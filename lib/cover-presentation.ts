export function getCoverPresentation(imageSrc: string) {
  if (imageSrc.endsWith(".png")) {
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
