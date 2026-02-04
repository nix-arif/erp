"use server";

import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

interface Product {
  brand: string;
  productCode: string;
  description: string;
  oum: string;
  unitPrice: number;
  imageUrl: string | null;
}

export async function seedToDatabase(data: Product[]) {
  try {
    if (!data || data.length === 0) {
      return { success: false, message: "No data found" };
    }

    const productsToInsert = data.map((item) => ({
      id: nanoid(12), // Jana ID unik secara manual
      brand: String(item.brand), // Anda boleh tukar ikut keperluan
      productCode: String(item.productCode),
      description: String(item.description),
      oum: String(item.oum),
      unitPrice: Number(item.unitPrice) || 0,
      imageUrl: item.imageUrl || null,
    }));

    await db
      .insert(product)
      .values(productsToInsert)
      .onConflictDoUpdate({
        target: product.productCode,
        set: {
          description: product.description,
          oum: product.oum,
          unitPrice: product.unitPrice,
          imageUrl: product.imageUrl,
        },
      });

    // Refresh halaman senarai produk supaya user nampak hasil seed
    revalidatePath("/dashboard/product");

    // Jika anda mahu pastikan halaman seed-data itu sendiri pun fresh
    revalidatePath("/dashboard/product/seed-data");
    return { success: true, count: productsToInsert.length };
  } catch (error: any) {
    console.error("SEED_ERROR:", error);
    return { success: false, message: error.message || "Fail to insert to DB" };
  }
}
