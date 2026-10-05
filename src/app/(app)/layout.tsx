import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-brand-600 text-white px-4 py-3 shadow-sm">
        <p className="font-bold text-lg leading-tight">Toko Arief</p>
        <p className="text-xs text-brand-100 leading-none">Kasir &amp; Stok</p>
      </header>
      <main className="px-3 py-3">{children}</main>
      <BottomNav />
    </div>
  );
}
