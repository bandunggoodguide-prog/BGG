"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export default function NumPad({ value, onChange, maxLength = 6 }: Props) {
  function press(key: string) {
    if (key === "") return;
    if (key === "del") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= maxLength) return;
    onChange(value + key);
  }

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {KEYS.map((key, idx) =>
        key === "" ? (
          <div key={idx} />
        ) : (
          <button
            key={idx}
            type="button"
            onClick={() => press(key)}
            className="btn-tap h-16 rounded-2xl bg-white border border-slate-200 text-2xl font-semibold text-slate-700 shadow-sm active:bg-slate-100 flex items-center justify-center"
          >
            {key === "del" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                <path d="M21 4H9l-7 8 7 8h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 10l4 4m0-4l-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              key
            )}
          </button>
        )
      )}
    </div>
  );
}
