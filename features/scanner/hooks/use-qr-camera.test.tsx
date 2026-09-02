import { describe, expect, it, vi } from "vitest";
import {
  createCameraLoopGuard,
  createQrFrameAdmissionGuard,
  releaseCameraStream,
  resumeCameraVideo,
} from "./use-qr-camera";

function decodePresentedFrame(
  guard: ReturnType<typeof createQrFrameAdmissionGuard>,
  presentedFrames: number,
  decoded: string | null,
) {
  return guard.observePresentedFrame(presentedFrames) ? guard.admit(decoded) : null;
}

describe("QR camera frame admission", () => {
  it("accepts the first QR on initial activation without requiring a cleared frame", () => {
    const guard = createQrFrameAdmissionGuard();
    guard.resetForNewStream();
    guard.beginScanCycle();

    expect(decodePresentedFrame(guard, 1, "QR-A")).toBe("QR-A");
    expect(decodePresentedFrame(guard, 2, "QR-A")).toBeNull();
  });

  it("does not re-accept the old QR when no frame advanced after rearm", () => {
    const guard = createQrFrameAdmissionGuard();
    guard.beginScanCycle();
    expect(decodePresentedFrame(guard, 10, "QR-A")).toBe("QR-A");

    guard.pauseForRearm(4);
    guard.beginScanCycle();

    expect(decodePresentedFrame(guard, 10, "QR-A")).toBeNull();
    expect(guard.observeFallbackFrame(4)).toBe(false);
    expect(guard.isWaitingForQrClear()).toBe(true);
  });

  it("blocks a genuinely fresh frame while the previous QR remains visible", () => {
    const guard = createQrFrameAdmissionGuard();
    guard.beginScanCycle();
    expect(decodePresentedFrame(guard, 1, "QR-A")).toBe("QR-A");

    guard.pauseForRearm(1);
    guard.beginScanCycle();

    expect(decodePresentedFrame(guard, 2, "QR-A")).toBeNull();
    expect(guard.isWaitingForQrClear()).toBe(true);
  });

  it("accepts the next QR only after a fresh QR-free frame", () => {
    const guard = createQrFrameAdmissionGuard();
    guard.beginScanCycle();
    expect(decodePresentedFrame(guard, 1, "QR-A")).toBe("QR-A");

    guard.pauseForRearm(1);
    guard.beginScanCycle();

    expect(decodePresentedFrame(guard, 2, null)).toBeNull();
    expect(guard.isWaitingForQrClear()).toBe(false);
    expect(decodePresentedFrame(guard, 3, "QR-B")).toBe("QR-B");
    expect(decodePresentedFrame(guard, 4, "QR-B")).toBeNull();
  });

  it("allows the old customer QR later after observing a fresh cleared frame", () => {
    const guard = createQrFrameAdmissionGuard();
    guard.beginScanCycle();
    expect(decodePresentedFrame(guard, 1, "QR-A")).toBe("QR-A");

    guard.pauseForRearm(1);
    guard.beginScanCycle();

    expect(decodePresentedFrame(guard, 2, null)).toBeNull();
    expect(decodePresentedFrame(guard, 3, "QR-A")).toBe("QR-A");
  });

  it("uses advancing video time as a safe fallback when frame callbacks are unavailable", () => {
    const guard = createQrFrameAdmissionGuard();
    guard.beginScanCycle();
    expect(guard.observeFallbackFrame(1)).toBe(true);
    expect(guard.admit("QR-A")).toBe("QR-A");

    guard.pauseForRearm(1);
    guard.beginScanCycle();

    expect(guard.observeFallbackFrame(1)).toBe(false);
    expect(guard.observeFallbackFrame(1.1)).toBe(true);
    expect(guard.admit("QR-A")).toBeNull();
    expect(guard.observeFallbackFrame(1.2)).toBe(true);
    expect(guard.admit(null)).toBeNull();
    expect(guard.observeFallbackFrame(1.3)).toBe(true);
    expect(guard.admit("QR-B")).toBe("QR-B");
  });
});

describe("QR camera lifecycle", () => {
  it("invalidates stopped loops across disable and Strict Mode-style setup replay", () => {
    const loops = createCameraLoopGuard();
    const first = loops.start();

    loops.stop();
    const replay = loops.start();

    expect(loops.isCurrent(first)).toBe(false);
    expect(loops.isCurrent(replay)).toBe(true);
    loops.stop();
    expect(loops.isCurrent(replay)).toBe(false);
  });

  it("stops every MediaStream track and detaches video during teardown", () => {
    const firstTrack = { stop: vi.fn() };
    const secondTrack = { stop: vi.fn() };
    const stream = {
      getTracks: () => [firstTrack, secondTrack],
    } as unknown as Pick<MediaStream, "getTracks">;
    const video = { srcObject: stream } as unknown as Pick<HTMLVideoElement, "srcObject">;

    releaseCameraStream(stream, video);

    expect(firstTrack.stop).toHaveBeenCalledOnce();
    expect(secondTrack.stop).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });

  it("keeps video.play failures fail-safe without starting a decoder loop", async () => {
    const startLoop = vi.fn();
    const onError = vi.fn();

    await resumeCameraVideo({
      video: { play: vi.fn().mockRejectedValue(new Error("play failed")) },
      startLoop,
      onError,
    });

    expect(startLoop).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
  });

  it("starts exactly one loop after video playback resumes", async () => {
    const startLoop = vi.fn();
    const onError = vi.fn();

    await resumeCameraVideo({
      video: { play: vi.fn().mockResolvedValue(undefined) },
      startLoop,
      onError,
    });

    expect(startLoop).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });
});
