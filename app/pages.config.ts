interface Page {
  path: string;
  imageSrc: string;
  blurDataURL: string;
  title: string;
  description: string;
}

export const pages: { [key: string]: Page } = {
  "coin-value": {
    path: "/coin/value",
    imageSrc: "/images/cover_coin.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEXkWzHhWy/bfVPfeU3jd03djGHhmm/ppnJS83WVAAAADklEQVQI12NgMmMoCQQAAiEA/oMLiwwAAAAASUVORK5CYII=",
    title: "認識錢幣與鈔票",
    description: "學習怎麼計算錢幣與鈔票的價值",
  },
  "coin-pay": {
    path: "/coin/pay",
    imageSrc: "/images/cover_coin2.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEWKUj2vfVnLo3vVr33MoXXRrIHOr43PqoDH/NHxAAAADklEQVQI12MocmMIEAYABAsBHHBsQLkAAAAASUVORK5CYII=",
    title: "付款",
    description: "學習選擇正確的錢幣或鈔票來付款",
  },
};
