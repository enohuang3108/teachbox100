import { pages } from "@/app/pages.config";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface OgImageMetadata {
  alt: string;
  size: { width: number; height: number };
  contentType: string;
}

function calculateContentType(imageSrc: string): string {
  const imageExtension = imageSrc.split(".").pop()?.toLowerCase();
  if (imageExtension === "jpg" || imageExtension === "jpeg") {
    return "image/jpeg";
  } else if (imageExtension === "webp") {
    return "image/webp";
  } else if (imageExtension === "gif") {
    return "image/gif";
  }
  return "image/png";
}

export function getOgImageMetadata(pageKey: string): OgImageMetadata {
  const page = pages[pageKey];
  if (!page) {
    console.warn(`OG Image: Invalid pageKey '${pageKey}' provided.`);
    return {
      alt: "Default Title",
      size: { width: 1200, height: 675 },
      contentType: "image/png",
    };
  }

  const contentType = calculateContentType(page.imageSrc);

  return {
    alt: page.title,
    size: { width: 1200, height: 675 },
    contentType: contentType,
  };
}

export async function generateOgImageResponse(
  pageKey: string,
): Promise<Response> {
  const page = pages[pageKey];
  if (!page) {
    console.error(
      `OG Image: Invalid pageKey '${pageKey}' for response generation.`,
    );
    return new Response(`Invalid page key: ${pageKey}`, { status: 404 });
  }

  const imagePath = join(process.cwd(), "public", page.imageSrc);
  const contentType = calculateContentType(page.imageSrc);

  try {
    const imageData = await readFile(imagePath);

    return new Response(imageData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
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
