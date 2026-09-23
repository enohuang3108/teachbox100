import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata("morse");
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <>{children}</>; }
