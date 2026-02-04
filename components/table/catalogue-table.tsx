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

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

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
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10px]">No</TableHead>
          <TableHead>Product Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Image</TableHead>
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
            <TableCell>
              {product.imageUrl ? product.imageUrl : "No Image"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  );
}

export default CatalogueTable;
