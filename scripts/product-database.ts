"use server";

import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function getProductsForCatalogue(
  data: { no: number; productCode: string }[],
) {
  try {
    if (!data || data.length === 0) return { success: false, data: [] };

    const codes = data.map((item) => String(item.productCode));

    const dbProducts = await db
      .select()
      .from(product)
      .where(inArray(product.productCode, codes));

    const dbMap = new Map(dbProducts.map((p) => [p.productCode, p]));

    const mergedData = data.map((item) => {
      const details = dbMap.get(item.productCode);
      return {
        no: item.no,
        productCode: item.productCode,
        description: details?.description || "Not Found",
        imageUrl: details?.imageUrl || null,
      };
    });

    return { success: true, data: mergedData };
  } catch (error: any) {
    return { success: false, error: "Database error" };
  }
}
