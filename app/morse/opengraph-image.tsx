import { generateOgImageResponse, getOgImageMetadata } from "@/lib/og-image";
const pageKey = "morse";
export const { alt, size, contentType } = getOgImageMetadata(pageKey);
export default async function Image() { return generateOgImageResponse(pageKey); }
