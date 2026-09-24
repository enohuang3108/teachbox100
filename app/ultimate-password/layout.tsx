import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata("ultimate-password");
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <>{children}</>; }
