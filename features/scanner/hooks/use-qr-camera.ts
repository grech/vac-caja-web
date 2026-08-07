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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestInFlightRef = useRef(false);
  const callbackLockedRef = useRef(false);
  const enabledRef = useRef(enabled);
  const onDecodedRef = useRef(onDecoded);
  const lastDecodeAtRef = useRef(0);
  const [status, setStatus] = useState<CameraStatus>("requestable");

  enabledRef.current = enabled;
  onDecodedRef.current = onDecoded;

  const stopLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    stopLoop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopLoop]);

  const scanFrame = useCallback(function scanFrameLoop(timestamp: number) {
    const video = videoRef.current;

    if (!enabledRef.current || callbackLockedRef.current || !streamRef.current || !video) {
      animationFrameRef.current = null;
      return;
    }

    try {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && timestamp - lastDecodeAtRef.current >= 120) {
        lastDecodeAtRef.current = timestamp;
        const canvas = canvasRef.current ?? document.createElement("canvas");
        canvasRef.current = canvas;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (context && canvas.width > 0 && canvas.height > 0) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const decoded = decodeQrFrame(context.getImageData(0, 0, canvas.width, canvas.height));

          if (decoded !== null) {
            callbackLockedRef.current = true;
            onDecodedRef.current(decoded);
            animationFrameRef.current = null;
            return;
          }
        }
      }
    } catch {
      stopStream();
      setStatus("error");
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanFrameLoop);
  }, [stopStream]);

  const startLoop = useCallback(() => {
    stopLoop();
    callbackLockedRef.current = false;
    lastDecodeAtRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [scanFrame, stopLoop]);

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
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        setStatus("error");
        return;
      }

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
      stopLoop();
      video?.pause();
      return;
    }

    if (streamRef.current && video) {
      callbackLockedRef.current = false;
      void video.play().then(startLoop).catch(() => {
        stopStream();
        setStatus("error");
      });
    }
  }, [enabled, startLoop, stopLoop, stopStream]);

  useEffect(() => stopStream, [stopStream]);

  return { videoRef, status, requestCamera };
}
