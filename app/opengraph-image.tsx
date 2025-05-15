import { appInfo } from "@/app/pages.config";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const { alt, size, contentType } = {
  alt: appInfo.title,
  size: {
    width: 1200,
    height: 675,
  },
  contentType: "image/webp",
};

export default async function Image(
  pageKey: string,
): Promise<Response> {
  const imagePath = join(process.cwd(), "public", appInfo.imageSrc);

  try {
    const imageData = await readFile(imagePath);

    return new Response(imageData, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(
      `Failed to read image file for OG image (${pageKey}): ${imagePath}`,
      error,
    );
    return new Response(`Failed to generate OG image for ${pageKey}`, {
      status: 500,
    });
  }
}
