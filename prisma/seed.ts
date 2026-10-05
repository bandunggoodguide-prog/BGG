import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  barcode?: string;
  category: string;
  unit: string;
  icon: string;
  color: string;
  costPrice: number;
  priceRegular: number;
  priceB2B: number;
  priceDonation: number;
  stock: number;
  minStock: number;
};

const products: SeedProduct[] = [
  { name: "Indomie Goreng", barcode: "8991234500017", category: "Mie Instan", unit: "pcs", icon: "noodle", color: "orange", costPrice: 2800, priceRegular: 3500, priceB2B: 3200, priceDonation: 3000, stock: 100, minStock: 20 },
  { name: "Mie Sedap Goreng", barcode: "8991234500024", category: "Mie Instan", unit: "pcs", icon: "noodle", color: "amber", costPrice: 2500, priceRegular: 3000, priceB2B: 2800, priceDonation: 2700, stock: 90, minStock: 20 },
  { name: "Beras Pandan Wangi", category: "Sembako", unit: "kg", icon: "rice", color: "amber", costPrice: 11000, priceRegular: 13000, priceB2B: 12000, priceDonation: 11500, stock: 150, minStock: 25 },
  { name: "Gula Pasir", category: "Sembako", unit: "kg", icon: "sugar", color: "slate", costPrice: 13000, priceRegular: 15000, priceB2B: 14000, priceDonation: 13500, stock: 80, minStock: 15 },
  { name: "Minyak Goreng Bimoli 1L", barcode: "8991234500031", category: "Sembako", unit: "botol", icon: "oil", color: "yellow", costPrice: 15000, priceRegular: 18000, priceB2B: 17000, priceDonation: 16000, stock: 40, minStock: 10 },
  { name: "Telur Ayam", category: "Sembako", unit: "kg", icon: "egg", color: "amber", costPrice: 24000, priceRegular: 27000, priceB2B: 26000, priceDonation: 25000, stock: 50, minStock: 10 },
  { name: "Tepung Terigu Segitiga", barcode: "8991234500048", category: "Sembako", unit: "kg", icon: "flour", color: "slate", costPrice: 9000, priceRegular: 11000, priceB2B: 10500, priceDonation: 10000, stock: 35, minStock: 10 },
  { name: "Rokok Surya 12", barcode: "8991234500055", category: "Rokok", unit: "bungkus", icon: "cigarette", color: "red", costPrice: 24000, priceRegular: 27000, priceB2B: 26000, priceDonation: 26000, stock: 60, minStock: 10 },
  { name: "Rokok Gudang Garam Filter", barcode: "8991234500062", category: "Rokok", unit: "bungkus", icon: "cigarette", color: "red", costPrice: 22000, priceRegular: 25000, priceB2B: 24000, priceDonation: 24000, stock: 55, minStock: 10 },
  { name: "Aqua Botol 600ml", barcode: "8991234500079", category: "Minuman", unit: "botol", icon: "water", color: "cyan", costPrice: 2500, priceRegular: 4000, priceB2B: 3500, priceDonation: 3000, stock: 120, minStock: 24 },
  { name: "Teh Pucuk Harum", barcode: "8991234500086", category: "Minuman", unit: "botol", icon: "drink", color: "green", costPrice: 3000, priceRegular: 5000, priceB2B: 4500, priceDonation: 4000, stock: 80, minStock: 20 },
  { name: "Kopi Kapal Api Sachet", barcode: "8991234500093", category: "Minuman", unit: "sachet", icon: "coffee", color: "amber", costPrice: 1000, priceRegular: 1500, priceB2B: 1300, priceDonation: 1200, stock: 200, minStock: 40 },
  { name: "Susu Kental Manis Indomilk", barcode: "8991234500109", category: "Minuman", unit: "pcs", icon: "milk", color: "blue", costPrice: 8000, priceRegular: 10000, priceB2B: 9500, priceDonation: 9000, stock: 40, minStock: 10 },
  { name: "Bawang Merah", category: "Bumbu Dapur", unit: "kg", icon: "onion", color: "pink", costPrice: 28000, priceRegular: 32000, priceB2B: 30000, priceDonation: 29000, stock: 20, minStock: 5 },
  { name: "Bawang Putih", category: "Bumbu Dapur", unit: "kg", icon: "onion", color: "slate", costPrice: 25000, priceRegular: 29000, priceB2B: 27000, priceDonation: 26000, stock: 18, minStock: 5 },
  { name: "Cabai Rawit", category: "Bumbu Dapur", unit: "kg", icon: "chili", color: "red", costPrice: 45000, priceRegular: 55000, priceB2B: 50000, priceDonation: 48000, stock: 10, minStock: 3 },
  { name: "Gas LPG 3kg", category: "Sembako", unit: "pcs", icon: "gas", color: "lime", costPrice: 18000, priceRegular: 22000, priceB2B: 20000, priceDonation: 19000, stock: 15, minStock: 5 },
  { name: "Sabun Mandi Lifebuoy", barcode: "8991234500116", category: "Sabun & Perawatan", unit: "pcs", icon: "soap", color: "red", costPrice: 3000, priceRegular: 4500, priceB2B: 4000, priceDonation: 3500, stock: 70, minStock: 15 },
  { name: "Sampo Sunsilk Sachet", barcode: "8991234500123", category: "Sabun & Perawatan", unit: "sachet", icon: "shampoo", color: "violet", costPrice: 700, priceRegular: 1000, priceB2B: 900, priceDonation: 850, stock: 150, minStock: 30 },
  { name: "Deterjen Rinso Sachet", barcode: "8991234500130", category: "Sabun & Perawatan", unit: "sachet", icon: "spray", color: "green", costPrice: 1500, priceRegular: 2000, priceB2B: 1800, priceDonation: 1700, stock: 100, minStock: 20 },
  { name: "Roti Tawar", category: "Lainnya", unit: "pcs", icon: "bread", color: "amber", costPrice: 8000, priceRegular: 10000, priceB2B: 9500, priceDonation: 9000, stock: 15, minStock: 5 },
  { name: "Permen Kopiko", barcode: "8991234500147", category: "Jajanan", unit: "pak", icon: "candy", color: "red", costPrice: 5000, priceRegular: 7000, priceB2B: 6500, priceDonation: 6000, stock: 30, minStock: 10 },
];

async function main() {
  for (const p of products) {
    const existing = p.barcode ? await prisma.product.findUnique({ where: { barcode: p.barcode } }) : await prisma.product.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: { ...p, barcode: p.barcode ?? null } });
      continue;
    }
    const created = await prisma.product.create({ data: { ...p, barcode: p.barcode ?? null } });
    if (created.stock > 0) {
      await prisma.stockMovement.create({
        data: { productId: created.id, type: "RESTOCK", qty: created.stock, note: "Stok awal (seed)" },
      });
    }
  }

  console.log("Seed selesai: produk contoh sudah dimasukkan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
