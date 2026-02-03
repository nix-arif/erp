"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from "xlsx";
import { getProductImages } from "@/scripts/r2-helper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Field, FieldLabel, FieldGroup, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import CatalogueTable from "../table/catalogue-table";

interface Product {
  no: number;
  productCode: string;
  description: string | null;
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

export const GenerateCatalogueForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<Product[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
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
      };
    });

    const results = await getProductImages(products);

    setProductDetails(results);

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Create Catalogue</CardTitle>
          <CardDescription>Upload a .ods or .xlsx file</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
            <Button type="submit" className="mt-4" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span>Loading</span>
                  <Loader2 className="animate-spin size-4" />
                </div>
              ) : (
                "Generate"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <CatalogueTable products={productDetails} />
    </div>
  );
};
