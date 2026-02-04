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
        {products.map((product, i) => (
          <TableRow
            key={i}
            className={`${product.imageUrl ? "" : "bg-red-400"}`}
          >
            <TableCell className="font-medium">{product.no}</TableCell>
            <TableCell>{product.productCode}</TableCell>
            <TableCell>
              {product.description ? product.description : "No Product"}
            </TableCell>
            <TableCell>{product.imageUrl ? "Yes" : "No Image"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  );
}

export default CatalogueTable;
