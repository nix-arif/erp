"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";

interface Product {
  no: number;
  productCode: string;
  description: string | null;
  imageUrl: string | null;
}

interface Props {
  products: Product[];
}

export default function CatalogueTable({ products }: Props) {
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkImages = async () => {
      setLoading(true);

      const res = await fetch("/api/check-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      });

      const data = await res.json();

      // 🔥 update sekali sahaja
      setStatusMap(data);
      setLoading(false);
    };

    if (products.length > 0) {
      checkImages();
    }
  }, [products]);

  return (
    <Table>
      <TableCaption>Product Detail Table</TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Product Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Image</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products.map((product) => {
          const exists = statusMap[product.productCode];

          return (
            <TableRow
              key={product.productCode}
              className={exists === false ? "bg-red-400" : ""}
            >
              <TableCell>{product.no}</TableCell>
              <TableCell>{product.productCode}</TableCell>
              <TableCell>{product.description ?? "No Product"}</TableCell>
              <TableCell>
                {loading ? "Checking..." : exists ? "Yes" : "No Image"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>

      <TableFooter />
    </Table>
  );
}
