"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import * as XLSX from "xlsx";
import { getProductImagesUrl } from "@/scripts/r2-helper";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface Product {
  no: number;
  productCode: string;
  description: string | null;
  oum: string;
  unitPrice: number;
  productImageUrl: string | null;
}

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
];

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => ACCEPTED_TYPES.includes(file.type), {
      message: "File must be .ods or .xlsx",
    }),
});

const constructCompleteProductData = (product: Product) => {
  const productCode = product.productCode.replace("/", ":");
  const key = `${productCode}.jpg`;
  return {
    no: product.no,
    productCode: product.productCode,
    description: product.description,
    oum: product.oum,
    unitPrice: product.unitPrice ?? 0,
    productImageUrl: `/${encodeURIComponent(key)}`,
  };
};

const SeedExcelForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<Product[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const file = values.file;
      if (!file) return;

      // Read Excel file
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        defval: "",
      });

      const products = rows.map((row) => {
        return {
          no: row["no"],
          productCode: row["product code"],
          description: row["description"],
          oum: row["oum"],
          unitPrice: row["unit price"],
        };
      });

      console.log(products);

      // const productCode = item.productCode.replaceAll("/", ":");

      const newData = products.map((product) =>
        constructCompleteProductData({ ...product, productImageUrl: "" }),
      );

      const newSheet = XLSX.utils.json_to_sheet(newData);
      XLSX.utils.json_to_sheet(newData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, "seedFile");
      XLSX.writeFile(newWorkbook, "seedFile.xlsx");
    } catch (error) {
      console.error("Failed to generate catalogue", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Attach File</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} id="seedFile-form">
            <FieldGroup>
              <Controller
                name="file"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="file">File</FieldLabel>
                    <Input
                      id="file"
                      type="file"
                      accept=".xlsx,.ods"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field>
            <Button type="submit" form="seedFile-form">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Generate Seed File"
              )}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SeedExcelForm;
