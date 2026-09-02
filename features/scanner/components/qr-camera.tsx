"use client";

import { Button } from "@/components/ui/button";
import { useQrCamera, type CameraStatus } from "../hooks/use-qr-camera";

const CAMERA_COPY: Record<CameraStatus, { title: string; description: string }> = {
  requestable: {
    title: "Cámara lista para iniciar",
    description: "Activa la cámara y coloca el QR del cliente dentro del recuadro.",
  },
  initializing: {
    title: "Iniciando cámara",
    description: "Confirma el permiso del navegador si aparece una solicitud.",
  },
  active: {
    title: "Buscando código QR",
    description: "Mantén el código visible y evita moverlo durante la lectura.",
  },
  "permission-denied": {
    title: "La cámara no tiene permiso",
    description: "Permite el acceso desde los permisos de este sitio y vuelve a intentarlo.",
  },
  unavailable: {
    title: "Cámara no disponible",
    description: "No encontramos una cámara utilizable o está ocupada por otra aplicación.",
  },
  error: {
    title: "No pudimos iniciar la cámara",
    description: "Cierra otras aplicaciones que usen la cámara y vuelve a intentarlo.",
  },
};

export function QrCamera({
  enabled,
  onDecoded,
}: {
  enabled: boolean;
  onDecoded: (value: string) => void;
}) {
  const { videoRef, status, requestCamera } = useQrCamera({ enabled, onDecoded });
  const copy = CAMERA_COPY[status];
  const canRequest = status !== "initializing" && status !== "active";

  return (
    <section aria-labelledby="camera-title">
      <div className="relative aspect-[4/3] overflow-hidden rounded-surface border border-border bg-ink">
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Vista en vivo de la cámara para leer el código QR del cliente"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-[12%] rounded-brand border-2 border-vac-yellow shadow-[0_0_0_999px_rgba(32,33,36,0.28)]" aria-hidden="true" />
      </div>

      <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div aria-live="polite">
          <h2 id="camera-title" className="text-lg font-semibold text-ink">{copy.title}</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-strong">{copy.description}</p>
        </div>
        {canRequest ? (
          <Button
            variant="primary"
            onClick={() => void requestCamera()}
            disabled={!enabled}
          >
            {status === "requestable" ? "Activar cámara" : "Reintentar cámara"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
