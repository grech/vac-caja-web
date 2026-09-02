"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { decodeQrFrame } from "../services/qr-decoder";

export type CameraStatus =
  | "requestable"
  | "initializing"
  | "active"
  | "permission-denied"
  | "unavailable"
  | "error";

type VideoWithFrameCallbacks = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (timestamp: number, metadata: { presentedFrames?: number }) => void,
  ) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

export function createQrFrameAdmissionGuard() {
  let requiresQrClear = false;
  let callbackLocked = false;
  let lastPresentedFrame: number | null = null;
  let lastFallbackTime: number | null = null;

  return {
    resetForNewStream() {
      requiresQrClear = false;
      callbackLocked = false;
      lastPresentedFrame = null;
      lastFallbackTime = null;
    },
    beginScanCycle() {
      callbackLocked = false;
    },
    pauseForRearm(currentTime: number | null) {
      requiresQrClear = true;
      if (currentTime !== null && Number.isFinite(currentTime)) {
        lastFallbackTime = currentTime;
      }
    },
    observePresentedFrame(presentedFrames: number) {
      if (!Number.isFinite(presentedFrames)) {
        return false;
      }

      const advanced = lastPresentedFrame === null || presentedFrames > lastPresentedFrame;
      if (advanced) {
        lastPresentedFrame = presentedFrames;
      }
      return advanced;
    },
    observeFallbackFrame(currentTime: number) {
      if (!Number.isFinite(currentTime)) {
        return false;
      }

      const advanced = lastFallbackTime === null || currentTime > lastFallbackTime;
      if (advanced) {
        lastFallbackTime = currentTime;
      }
      return advanced;
    },
    admit(decoded: string | null) {
      if (decoded === null) {
        requiresQrClear = false;
        return null;
      }

      if (requiresQrClear || callbackLocked) {
        return null;
      }

      callbackLocked = true;
      return decoded;
    },
    isWaitingForQrClear() {
      return requiresQrClear;
    },
    isCallbackLocked() {
      return callbackLocked;
    },
  };
}

export function createCameraLoopGuard() {
  let generation = 0;

  return {
    start() {
      generation += 1;
      return generation;
    },
    stop() {
      generation += 1;
    },
    isCurrent(candidate: number) {
      return candidate === generation;
    },
  };
}

export function releaseCameraStream(
  stream: Pick<MediaStream, "getTracks"> | null,
  video: Pick<HTMLVideoElement, "srcObject"> | null,
) {
  stream?.getTracks().forEach((track) => track.stop());
  if (video) {
    video.srcObject = null;
  }
}

export async function resumeCameraVideo({
  video,
  startLoop,
  onError,
}: {
  video: Pick<HTMLVideoElement, "play">;
  startLoop: () => void;
  onError: () => void;
}) {
  try {
    await video.play();
    startLoop();
  } catch {
    onError();
  }
}

function classifyCameraError(error: unknown): CameraStatus {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "permission-denied";
    }

    if (
      error.name === "NotFoundError" ||
      error.name === "OverconstrainedError" ||
      error.name === "NotReadableError"
    ) {
      return "unavailable";
    }
  }

  return "error";
}

export function useQrCamera({
  enabled,
  onDecoded,
}: {
  enabled: boolean;
  onDecoded: (value: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoFrameCallbackRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestInFlightRef = useRef(false);
  const enabledRef = useRef(enabled);
  const onDecodedRef = useRef(onDecoded);
  const lastDecodeAtRef = useRef(0);
  const admissionGuardRef = useRef(createQrFrameAdmissionGuard());
  const loopGuardRef = useRef(createCameraLoopGuard());
  const [status, setStatus] = useState<CameraStatus>("requestable");

  useEffect(() => {
    enabledRef.current = enabled;
    onDecodedRef.current = onDecoded;
  }, [enabled, onDecoded]);

  const stopLoop = useCallback(() => {
    loopGuardRef.current?.stop();

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const video = videoRef.current as VideoWithFrameCallbacks | null;
    if (videoFrameCallbackRef.current !== null) {
      video?.cancelVideoFrameCallback?.(videoFrameCallbackRef.current);
      videoFrameCallbackRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    stopLoop();
    releaseCameraStream(streamRef.current, videoRef.current);
    streamRef.current = null;
    admissionGuardRef.current?.resetForNewStream();
  }, [stopLoop]);

  const decodeVideoFrame = useCallback((video: HTMLVideoElement) => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context || canvas.width <= 0 || canvas.height <= 0) {
      return false;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const decoded = decodeQrFrame(context.getImageData(0, 0, canvas.width, canvas.height));
    const admitted = admissionGuardRef.current?.admit(decoded) ?? null;

    if (admitted === null) {
      return false;
    }

    onDecodedRef.current(admitted);
    return true;
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();
    admissionGuardRef.current?.beginScanCycle();
    lastDecodeAtRef.current = 0;
    const loopGeneration = loopGuardRef.current?.start() ?? 0;

    const canScan = () => loopGuardRef.current?.isCurrent(loopGeneration)
      && enabledRef.current
      && admissionGuardRef.current?.isCallbackLocked() === false
      && streamRef.current !== null
      && videoRef.current !== null;

    const failCamera = () => {
      stopStream();
      setStatus("error");
    };

    const scanPresentedFrame = (
      timestamp: number,
      isFresh: (video: HTMLVideoElement) => boolean,
    ) => {
      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !isFresh(video)) {
        return false;
      }

      if (timestamp - lastDecodeAtRef.current < 120) {
        return false;
      }

      lastDecodeAtRef.current = timestamp;
      return decodeVideoFrame(video);
    };

    const scheduleNext = () => {
      if (!canScan()) {
        return;
      }

      const video = videoRef.current as VideoWithFrameCallbacks;
      if (typeof video.requestVideoFrameCallback === "function") {
        videoFrameCallbackRef.current = video.requestVideoFrameCallback((timestamp, metadata) => {
          videoFrameCallbackRef.current = null;
          if (!canScan()) {
            return;
          }

          try {
            const accepted = scanPresentedFrame(timestamp, (currentVideo) => {
              const presentedFrames = metadata.presentedFrames;
              return typeof presentedFrames === "number"
                ? admissionGuardRef.current?.observePresentedFrame(presentedFrames) === true
                : admissionGuardRef.current?.observeFallbackFrame(currentVideo.currentTime) === true;
            });
            if (!accepted) {
              scheduleNext();
            }
          } catch {
            failCamera();
          }
        });
        return;
      }

      animationFrameRef.current = requestAnimationFrame((timestamp) => {
        animationFrameRef.current = null;
        if (!canScan()) {
          return;
        }

        try {
          const accepted = scanPresentedFrame(
            timestamp,
            (currentVideo) => admissionGuardRef.current
              ?.observeFallbackFrame(currentVideo.currentTime) === true,
          );
          if (!accepted) {
            scheduleNext();
          }
        } catch {
          failCamera();
        }
      });
    };

    scheduleNext();
  }, [decodeVideoFrame, stopLoop, stopStream]);

  const requestCamera = useCallback(async () => {
    if (requestInFlightRef.current || !enabledRef.current) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      return;
    }

    requestInFlightRef.current = true;
    setStatus("initializing");
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });

      if (!enabledRef.current) {
        releaseCameraStream(stream, null);
        return;
      }

      const video = videoRef.current;
      if (!video) {
        releaseCameraStream(stream, null);
        setStatus("error");
        return;
      }

      admissionGuardRef.current?.resetForNewStream();
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setStatus("active");
      startLoop();
    } catch (error) {
      stopStream();
      setStatus(classifyCameraError(error));
    } finally {
      requestInFlightRef.current = false;
    }
  }, [startLoop, stopStream]);

  useEffect(() => {
    const video = videoRef.current;

    if (!enabled) {
      if (streamRef.current && admissionGuardRef.current?.isCallbackLocked()) {
        admissionGuardRef.current?.pauseForRearm(video?.currentTime ?? null);
      }
      stopLoop();
      video?.pause();
      return;
    }

    if (streamRef.current && video) {
      void resumeCameraVideo({
        video,
        startLoop,
        onError: () => {
          stopStream();
          setStatus("error");
        },
      });
    }
  }, [enabled, startLoop, stopLoop, stopStream]);

  useEffect(() => stopStream, [stopStream]);

  return { videoRef, status, requestCamera };
}
