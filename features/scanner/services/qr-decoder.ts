import jsQR from "jsqr";

export function decodeQrFrame(imageData: ImageData): string | null {
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });

  return result?.data ?? null;
}
