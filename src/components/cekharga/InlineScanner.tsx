"use client";

import { useBarcodeScanner } from "@/lib/useBarcodeScanner";

const CONTAINER_ID = "wg-inline-scanner";

export default function InlineScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const { error, starting, zoom, setZoom, torch, toggleTorch } = useBarcodeScanner(CONTAINER_ID, onDetected, {
    stopOnDetect: false,
  });

  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-black mb-3">
      <div id={CONTAINER_ID} className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

      {starting && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/70 text-sm">Membuka kamera...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-sm text-slate-700">{error}</p>
            <p className="text-xs text-slate-400 mt-2">Tidak apa, cari nama produk saja di bawah.</p>
          </div>
        </div>
      )}

      {!error && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-3 px-3">
          <div className="flex items-center gap-2">
            {torch.supported && (
              <button
                onClick={toggleTorch}
                aria-label="Lampu senter"
                className={`btn-tap w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  torch.on ? "bg-amber-400 text-amber-950" : "bg-white/15 text-white"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M9 18h6M10 22h4M12 2a5 5 0 0 0-3 9c.6.5 1 1.2 1 2v1h4v-1c0-.8.4-1.5 1-2a5 5 0 0 0-3-9z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {zoom.supported && (
              <div className="flex-1 flex items-center gap-2 bg-white/15 rounded-full px-3 h-10">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4 shrink-0">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M11 8v6M8 11h6" strokeLinecap="round" />
                </svg>
                <input
                  type="range"
                  min={zoom.min}
                  max={zoom.max}
                  step={zoom.step}
                  value={zoom.value}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-brand-500"
                  aria-label="Perbesar kamera untuk barcode kecil"
                />
              </div>
            )}
          </div>
          <p className="text-center text-white/70 text-[11px] mt-2">
            {zoom.supported ? "Geser untuk memperbesar barcode kecil (rokok, dsb)" : "Arahkan kamera ke barcode produk"}
          </p>
        </div>
      )}
    </div>
  );
}
