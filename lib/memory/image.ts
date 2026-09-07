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
