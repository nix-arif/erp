import { getLogoUploadUrl } from "@/scripts/r2-helper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { filename } = await req.json();
    const { url, key } = await getLogoUploadUrl(filename);
    return NextResponse.json({ url, key }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
