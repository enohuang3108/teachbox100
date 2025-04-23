import { pages } from "@/app/pages.config"; // Corrected path
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const pageKey = "coin-introduction";
const page = pages[pageKey];

// Image metadata
export const alt = page.title;
export const size = {
  width: 1200,
  height: 630,
};

// Deduce content type from imageSrc
const imageExtension = page.imageSrc.split(".").pop()?.toLowerCase();
let contentType = "image/png"; // Default
if (imageExtension === "jpg" || imageExtension === "jpeg") {
  contentType = "image/jpeg";
} else if (imageExtension === "webp") {
  contentType = "image/webp";
} else if (imageExtension === "gif") {
  contentType = "image/gif";
}
// Add more types if needed

export { contentType };

// Image generation
export default async function Image() {
  // Construct the absolute path to the image file in the public directory
  const imagePath = join(process.cwd(), "public", page.imageSrc);

  try {
    const imageData = await readFile(imagePath);

    // Return a raw Response object
    return new Response(imageData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Optional: Add caching headers
      },
    });
  } catch (error) {
    console.error(
      `Failed to read image file for OG image (${pageKey}): ${imagePath}`,
      error,
    );
    // Return a fallback response or re-throw
    return new Response(`Failed to generate OG image for ${pageKey}`, {
      status: 500,
    });
  }
}
