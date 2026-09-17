export function getCoverPresentation(imageSrc: string) {
  // 去背圖（透明 PNG、covers/cutout/）直接站在卡片上，不墊底色也不裁切
  if (imageSrc.endsWith(".png") || imageSrc.includes("/covers/cutout/")) {
    return {
      imageClassName: "object-contain",
      imageContainerClassName: "bg-transparent",
      placeholder: "empty" as const,
    };
  }

  return {
    imageClassName: "object-cover",
    imageContainerClassName: "bg-sand",
    placeholder: "blur" as const,
  };
}
