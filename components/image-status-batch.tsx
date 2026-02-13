import { useEffect, useState } from "react";

interface Product {
  no: number;
  productCode: string;
  description: string | null;
  imageUrl: string | null;
}

export default function useImageStatusBatch(products: Product[]) {
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const batchSize = 50; // adjust based on performance
    let i = 0;

    const fetchNextBatch = async () => {
      const batch = products.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (p) => {
          if (!p.imageUrl) {
            setStatusMap((prev) => ({ ...prev, [p.productCode]: false }));
            return;
          }

          try {
            const res = await fetch(
              `/api/check-image?url=${encodeURIComponent(p.imageUrl)}`,
            );
            const data = await res.json();
            setStatusMap((prev) => ({ ...prev, [p.productCode]: data.exists }));
          } catch {
            setStatusMap((prev) => ({ ...prev, [p.productCode]: false }));
          }
        }),
      );

      i += batchSize;
      if (i < products.length) {
        setTimeout(fetchNextBatch, 50); // small delay to prevent blocking
      }
    };

    fetchNextBatch();
  }, [products]);

  return statusMap;
}
