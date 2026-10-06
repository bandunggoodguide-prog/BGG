"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Html5Qrcode } from "html5-qrcode";

type RangeState = { supported: boolean; min: number; max: number; step: number; value: number };
type ToggleState = { supported: boolean; on: boolean };

const INITIAL_RANGE: RangeState = { supported: false, min: 1, max: 1, step: 1, value: 1 };
const INITIAL_TOGGLE: ToggleState = { supported: false, on: false };

/**
 * Mengelola siklus hidup kamera html5-qrcode di sebuah elemen container, termasuk
 * zoom & senter — dua hal yang paling membantu saat barcode kecil (mis. bungkus rokok)
 * susah terbaca dari jarak normal.
 */
type Options = {
  /** true (default): hentikan kamera setelah barcode pertama terbaca (dipakai modal sekali-scan). */
  stopOnDetect?: boolean;
};

export function useBarcodeScanner(
  containerId: string,
  onDetected: (code: string) => void,
  options: Options = {}
) {
  const { stopOnDetect = true } = options;
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [zoom, setZoomState] = useState<RangeState>(INITIAL_RANGE);
  const [torch, setTorchState] = useState<ToggleState>(INITIAL_TOGGLE);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);
  const lastDetectionRef = useRef<{ code: string; at: number } | null>(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  useEffect(() => {
    stoppedRef.current = false;
    lastDetectionRef.current = null;
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(containerId, { verbose: false });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 12,
            // Kotak lebar & pendek lebih cocok untuk barcode 1D dibanding kotak persegi.
            qrbox: { width: 280, height: 130 },
            videoConstraints: {
              facingMode: "environment",
              // Resolusi lebih tinggi membantu kamera membedakan garis-garis tipis
              // pada barcode kecil seperti kemasan rokok.
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          (decodedText) => {
            if (stoppedRef.current) return;
            if (stopOnDetect) {
              stoppedRef.current = true;
              onDetectedRef.current(decodedText);
              return;
            }
            // Mode pindai terus: jangan panggil ulang untuk kode yang sama
            // berkali-kali tiap frame selama barang masih di depan kamera.
            const now = Date.now();
            const last = lastDetectionRef.current;
            if (last && last.code === decodedText && now - last.at < 1500) return;
            lastDetectionRef.current = { code: decodedText, at: now };
            onDetectedRef.current(decodedText);
          },
          () => {
            // abaikan error per-frame, normal selama belum ketemu barcode
          }
        );

        if (cancelled) return;
        setStarting(false);

        try {
          const caps = scanner.getRunningTrackCameraCapabilities();
          const zoomCap = caps.zoomFeature();
          if (zoomCap.isSupported()) {
            setZoomState({
              supported: true,
              min: zoomCap.min(),
              max: zoomCap.max(),
              step: zoomCap.step() || 0.1,
              value: zoomCap.value() ?? zoomCap.min(),
            });
          }
          const torchCap = caps.torchFeature();
          if (torchCap.isSupported()) {
            setTorchState({ supported: true, on: torchCap.value() ?? false });
          }
        } catch {
          // perangkat/browser tidak mengekspos kapabilitas kamera, abaikan saja
        }
      } catch {
        if (!cancelled) {
          setStarting(false);
          setError("Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      stoppedRef.current = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [containerId]);

  const setZoom = useCallback(async (value: number) => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.applyVideoConstraints({ advanced: [{ zoom: value } as unknown as MediaTrackConstraintSet] });
      setZoomState((prev) => ({ ...prev, value }));
    } catch {
      // abaikan kalau gagal menerapkan zoom
    }
  }, []);

  const toggleTorch = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    const next = !torch.on;
    try {
      await scanner.applyVideoConstraints({ advanced: [{ torch: next } as unknown as MediaTrackConstraintSet] });
      setTorchState((prev) => ({ ...prev, on: next }));
    } catch {
      // abaikan kalau perangkat tidak mendukung
    }
  }, [torch.on]);

  return { error, starting, zoom, setZoom, torch, toggleTorch };
}
