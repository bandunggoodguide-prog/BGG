"use client";

import { useEffect, useRef, useState } from "react";

const ELEMENT_ID = "wg-barcode-scanner";

export default function ScannerModal({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(ELEMENT_ID, { verbose: false });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 160 } },
          (decodedText) => {
            if (stoppedRef.current) return;
            stoppedRef.current = true;
            onDetected(decodedText);
          },
          () => {
            // ignore per-frame decode errors
          }
        );
      } catch (err) {
        if (!cancelled) {
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
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="font-semibold">Scan Barcode Produk</p>
        <button onClick={onClose} className="text-sm bg-white/10 px-3 py-1.5 rounded-full">
          Tutup
        </button>
      </div>
      <div className="flex-1 relative flex items-center justify-center">
        <div id={ELEMENT_ID} className="w-full max-w-md" />
        {error && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 text-center">
            <p className="text-sm text-slate-700">{error}</p>
            <button onClick={onClose} className="mt-3 text-brand-600 font-semibold text-sm">
              Kembali, cari manual saja
            </button>
          </div>
        )}
      </div>
      <p className="text-center text-white/70 text-xs py-4 px-6">
        Arahkan kamera ke barcode kemasan produk. Untuk barang tanpa barcode, tutup ini dan pilih dari daftar produk.
      </p>
    </div>
  );
}
