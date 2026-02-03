import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface Product {
  no: number;
  productImageUrl: string;
}

interface CatalogueProps {
  products: Product[];
}

export const Catalogue: React.FC<CatalogueProps> = ({ products }) => {
  return (
    <Document>
      <Page size="A4">
        <View>
          {products.map(({ no, productImageUrl }) => (
            <Image src={productImageUrl} key={no} />
          ))}
        </View>
      </Page>
    </Document>
  );
};
