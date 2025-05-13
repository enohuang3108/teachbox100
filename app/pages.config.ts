interface Page {
  path: string;
  imageSrc: string;
  blurDataURL: string;
  title: string;
  description: string;
}

export const pages: { [key: string]: Page } = {
  "coin-introduction": {
    path: "/coin/introduction",
    imageSrc: "/images/cover_coin_introduction.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAK0lEQVQIW2M8s2n6f0ZmNgamo5kM7M7zGRjPbZnx//MHZgY+ASaGfwy/GQDZLwxSeEEb5AAAAABJRU5ErkJggg==",
    title: "認識新臺幣",
    description: "認識新臺幣的種類與價值",
  },
  "coin-value": {
    path: "/coin/value",
    imageSrc: "/images/cover_coin_value.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEXkWzHhWy/bfVPfeU3jd03djGHhmm/ppnJS83WVAAAADklEQVQI12NgMmMoCQQAAiEA/oMLiwwAAAAASUVORK5CYII=",
    title: "計算金錢價值",
    description: "學習怎麼計算錢幣與鈔票的價值",
  },
  "coin-pay": {
    path: "/coin/pay",
    imageSrc: "/images/cover_coin_pay.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEWKUj2vfVnLo3vVr33MoXXRrIHOr43PqoDH/NHxAAAADklEQVQI12MocmMIEAYABAsBHHBsQLkAAAAASUVORK5CYII=",
    title: "付款",
    description: "學習選擇正確的錢幣或鈔票來付款",
  },
  "coin-change": {
    path: "/coin/change",
    imageSrc: "/images/cover_coin_change.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAK0lEQVQIW2N8Gar0n5GFlYEznpvhvWQ5A+Oj88v/c3bUMvz9x8DAxMjAAAC/nQrBs+CLpQAAAABJRU5ErkJggg==",
    title: "找零",
    description: "學習選擇正確的錢幣或鈔票來找零",
  },
  "clock-current-time": {
    path: "/clock/current-time",
    imageSrc: "/images/cover_current_time.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAALUlEQVQIWwEiAN3/AcZZM/8OJgoA+eD1APn6/AAB5NvE/+R+bQAHCgYAXcj0ABtUD9CQT3miAAAAAElFTkSuQmCC",
    title: "認識時鐘",
    description: "學習如何看懂現在時間",
  },
};
