// 老師上傳的圖片縮成縮圖再存：牌組放在 localStorage，原圖一張就能塞爆 5MB。
export const FACE_IMAGE_SIZE = 320;

export async function fileToFace(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("請選擇圖片檔");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, FACE_IMAGE_SIZE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.8);
}

/** 分享時重壓一張臉：瀏覽器不支援輸出 webp（舊 Safari）就退回 jpeg */
export async function reencodeFace(
  face: string,
  size: number,
  quality: number,
): Promise<string> {
  const img = new Image();
  img.src = face;
  await img.decode();
  const scale = Math.min(1, size / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL("image/webp", quality);
  return webp.startsWith("data:image/webp")
    ? webp
    : canvas.toDataURL("image/jpeg", quality);
}
