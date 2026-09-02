import { PRODUCTS } from "@/lib/constants/products";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata("coin-buy");

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {PRODUCTS.map((product) => (
        <link
          key={product.name}
          rel="preload"
          href={product.modelPath}
          as="fetch"
          crossOrigin="anonymous"
        />
      ))}
      {children}
    </>
  );
}
