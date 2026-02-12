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

interface CatalogueTableProps {
  products: Product[];
}

function CatalogueTable({ products }: CatalogueTableProps) {
  return (
    <Table>
      <TableCaption>Product Detail Table</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-2.5">No</TableHead>
          <TableHead>Product Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Image</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products.map((product) => (
          <ImageCheckRow key={product.no} product={product} />
        ))}
      </TableBody>

      <TableFooter />
    </Table>
  );
}

function ImageCheckRow({ product }: { product: Product }) {
  const [imageExists, setImageExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (!product.imageUrl) {
      setImageExists(false);
      return;
    }

    const img = new Image();
    img.src = product.imageUrl;

    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);
  }, [product.imageUrl]);

  return (
    <TableRow className={imageExists === false ? "bg-red-400" : ""}>
      <TableCell className="font-medium">{product.no}</TableCell>
      <TableCell>{product.productCode}</TableCell>
      <TableCell>{product.description ?? "No Product"}</TableCell>
      <TableCell>
        {imageExists === null && "Checking..."}
        {imageExists === true && "Yes"}
        {imageExists === false && "No Image"}
      </TableCell>
    </TableRow>
  );
}

export default CatalogueTable;
