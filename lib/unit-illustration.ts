export function getUnitIllustrationSrc({
  imageSrc,
  illustrationSrc,
}: {
  imageSrc: string;
  illustrationSrc?: string;
}) {
  if (illustrationSrc) return illustrationSrc;
  return imageSrc.replace("/covers/warm/", "/covers/cutout/");
}
