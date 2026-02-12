"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, FileDown } from "lucide-react";
import { getProductsForCatalogue } from "@/scripts/product-database";
import { toast } from "sonner";
import CatalogueTable from "../table/catalogue-table";

/* ================= TYPES ================= */

interface ProductView {
  no: number;
  productCode: string;
  description: string | null;
  imageUrl: string | null;
}

/* ================= CONFIG ================= */

const ROWS_PER_CHUNK = 50;
const MAX_IMAGES = 100;

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: "Pilih fail Excel" }),
});

/* ================= COMPONENT ================= */

export const GenerateCatalogueForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [productDetails, setProductDetails] = useState<ProductView[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  /* ========== IMAGE PRELOADER ========== */
  const preloadImages = async (
    data: ProductView[],
  ): Promise<Map<string, HTMLImageElement | null>> => {
    const promises: Promise<[string, HTMLImageElement | null]>[] = data.map(
      (item) =>
        new Promise((resolve) => {
          if (!item.imageUrl) {
            resolve([item.productCode, null]);
            return;
          }

          const img = new Image();
          img.crossOrigin = "Anonymous"; // 🔹 important for addImage
          img.src = item.imageUrl;
          img.onload = () => resolve([item.productCode, img]);
          img.onerror = () => resolve([item.productCode, null]);
        }),
    );

    return new Map(await Promise.all(promises));
  };

  /* ================= SUBMIT ================= */

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const toastId = toast.loading("Processing PDF...");
    setIsLoading(true);

    try {
      // Read Excel
      const buffer = await values.file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const rows = XLSX.utils.sheet_to_json<any>(
        workbook.Sheets[workbook.SheetNames[0]],
        { defval: "" },
      );

      const excelData = rows
        .filter((r) => r["product code"])
        .map((row, index) => ({
          no: Number(row["no"]) || index + 1,
          productCode: String(row["product code"]).trim(),
        }));

      const result = await getProductsForCatalogue(excelData);
      if (!result.success || !result.data) {
        throw new Error("Gagal mendapatkan data produk");
      }

      setProductDetails(result.data);

      const finalData: ProductView[] = result.data;
      const imageMap = await preloadImages(finalData); // preload all images

      const doc = new jsPDF();

      // Chunking for large datasets
      for (let i = 0; i < finalData.length; i += ROWS_PER_CHUNK) {
        const chunk = finalData.slice(i, i + ROWS_PER_CHUNK);

        if (i !== 0) doc.addPage();

        autoTable(doc, {
          startY: 20,
          head: [["No", "Product Code", "Description", "Image"]],
          margin: { left: 10, right: 5 },

          // embed stable row index
          body: chunk.map((p, idx) => ({
            __rowIndex__: idx,
            no: p.no,
            productCode: p.productCode,
            description: p.description ?? "",
            __image__: "",
          })),

          columns: [
            { dataKey: "no" },
            { dataKey: "productCode" },
            { dataKey: "description" },
            { dataKey: "__image__" },
          ],

          columnStyles: {
            no: { cellWidth: 10, halign: "center" },
            productCode: { cellWidth: 30, halign: "center" },
            description: { cellWidth: 60 },
            __image__: { cellWidth: 90, halign: "center" }, // 🔹 wider image column
          },

          styles: {
            fontSize: 8, // smaller font
            cellPadding: 2, // reduced padding
            minCellHeight: 50, // enough height for image
            valign: "middle",
            lineWidth: 0.3,
          },

          // 🔹 smaller header height
          headStyles: {
            fontSize: 8, // smaller font for header
            cellPadding: 1.5, // smaller padding for header
            minCellHeight: 12, // reduce header row height
            valign: "middle",
            halign: "center",
          },

          // didDrawCell: (data) => {
          //   if (data.section !== "body") return;
          //   if (data.column.dataKey !== "__image__") return;

          //   const raw = data.row.raw as any;
          //   const rowIndex = raw?.__rowIndex__;
          //   if (typeof rowIndex !== "number") return;

          //   const product = chunk[rowIndex];
          //   if (!product) return;

          //   const img = imageMap.get(product.productCode);

          //   const padding = 2;
          //   const maxW = data.cell.width - padding * 2;
          //   const maxH = data.cell.height - padding * 2;

          //   if (img) {
          //     // draw image
          //     const ratio = Math.min(maxW / img.width, maxH / img.height);
          //     const w = img.width * ratio;
          //     const h = img.height * ratio;
          //     const x = data.cell.x + (data.cell.width - w) / 2;
          //     const y = data.cell.y + (data.cell.height - h) / 2;
          //     doc.addImage(img, "JPEG", x, y, w, h);
          //   } else {
          //     // no image → tulis "No Image" di tengah cell
          //     doc.setFontSize(8);
          //     doc.text(
          //       "No Image",
          //       data.cell.x + data.cell.width / 2,
          //       data.cell.y + data.cell.height / 2,
          //       { align: "center", baseline: "middle" },
          //     );
          //   }
          // },
          didDrawCell: (data) => {
            if (data.section !== "body") return;
            if (data.column.dataKey !== "__image__") return;

            const raw = data.row.raw as any;
            const rowIndex = raw?.__rowIndex__;
            if (typeof rowIndex !== "number") return;

            const product = chunk[rowIndex];
            if (!product) return;

            const img = imageMap.get(product.productCode);

            const padding = 2;
            const maxW = data.cell.width - padding * 2;
            const maxH = data.cell.height - padding * 2;

            const centerX = data.cell.x + data.cell.width / 2;
            const centerY = data.cell.y + data.cell.height / 2;

            // 🔥 IF IMAGE VALID
            if (img && img.width && img.height) {
              try {
                const ratio = Math.min(maxW / img.width, maxH / img.height);
                const w = img.width * ratio;
                const h = img.height * ratio;
                const x = data.cell.x + (data.cell.width - w) / 2;
                const y = data.cell.y + (data.cell.height - h) / 2;

                // auto detect format
                const format = product.imageUrl?.toLowerCase().includes(".png")
                  ? "PNG"
                  : "JPEG";

                doc.addImage(img, format, x, y, w, h);
                return;
              } catch (err) {
                console.warn("Image draw failed:", product.productCode);
              }
            }

            // 🔥 FALLBACK → No Image
            doc.setFontSize(8);
            doc.text("No Image", centerX, centerY, {
              align: "center",
              baseline: "middle",
            });
          },
        });
      }

      doc.save(`Catalogue_${Date.now()}.pdf`);
      toast.success("PDF Downloaded!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error occurred", { id: toastId });
    } finally {
      setIsLoading(false);
      setFileInputKey(Date.now());
    }
  };

  /* ================= UI ================= */

  return (
    <div className="mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown /> Catalogue Generator
          </CardTitle>
          <CardDescription>
            Optimized for large Excel files (10k–20k rows)
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} id="pdf-form">
            <Controller
              name="file"
              control={form.control}
              render={({ field }) => (
                <Input
                  key={fileInputKey}
                  type="file"
                  accept=".xlsx,.ods"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              )}
            />
          </form>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            form="pdf-form"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="animate-spin mr-2" />}
            Generate PDF
          </Button>
        </CardFooter>
      </Card>

      {/* Optional table preview */}
      <CatalogueTable products={productDetails} />
    </div>
  );
};
