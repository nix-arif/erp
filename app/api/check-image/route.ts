import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { products } = await req.json();

  const result: Record<string, boolean> = {};

  for (const product of products) {
    if (!product.imageUrl) {
      result[product.productCode] = false;
      continue;
    }

    try {
      const res = await fetch(product.imageUrl, { method: "GET" });
      result[product.productCode] = res.ok;
    } catch {
      result[product.productCode] = false;
    }
  }

  return NextResponse.json(result);
}
