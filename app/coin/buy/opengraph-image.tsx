import { generateOgImageResponse, getOgImageMetadata } from "@/lib/og-image";

const pageKey = "coin-buy";

export const { alt, size, contentType } = getOgImageMetadata(pageKey);

export default async function Image() {
  return generateOgImageResponse(pageKey);
}
