"use client";

import { useState } from "react";
import * as z from "zod";
import * as XLSX from "xlsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { seedToDatabase } from "@/scripts/seed-pg";

interface Product {
  brand: string;
  productCode: string;
  description: string;
  oum: string;
  unitPrice: number;
  imageUrl: string | null;
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

const SeedDataForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<Product[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const file = values.file;
    if (!file) return;

    if (file.name !== "seedFile.ods") {
      toast.error("Not Authorised");
      setIsLoading(false);
      form.reset({ file: undefined });
      return;
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: "",
    });

    const allProducts: Product[] = rows.map((row) => {
      return {
        brand: row["brand"],
        productCode: row["productCode"],
        description: row["description"],
        oum: row["oum"],
        unitPrice: row["unitPrice"],
        imageUrl: row["productImageUrl"],
      };
    });

    // 2. LOGIK BATCHING
    const BATCH_SIZE = 500; // Hantar 500 baris sekali jalan
    const totalBatches = Math.ceil(allProducts.length / BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = start + BATCH_SIZE;
      const chunk = allProducts.slice(start, end);

      console.log(`Sending batch ${i + 1} of ${totalBatches}...`);

      const resultSeed = await seedToDatabase(chunk);
      console.log(resultSeed);

      if (!resultSeed.success) {
        throw new Error(`Gagal pada batch ke-${i + 1}: ${resultSeed.message}`);
      }

      // Opsional: Boleh tambah progress bar state di sini (e.g. setProgress(i/totalBatches * 100))
    }

    toast.success(`Berjaya seed kesemua ${allProducts.length} baris!`);
    form.reset({ file: undefined });

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">
            <AlertTriangle className="text-red-500" /> Seed Data
          </CardTitle>
          <CardDescription>Upload a .ods or .xlsx file</CardDescription>
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
                <div className="flex items-center gap-2">
                  <span>Loading</span>
                  <Loader2 className="animate-spin size-4" />
                </div>
              ) : (
                "Seed Data"
              )}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SeedDataForm;
