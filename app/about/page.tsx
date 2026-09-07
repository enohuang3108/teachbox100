import { PageDecor } from "@/components/atoms/PageDecor";
import { AUTHOR, REPO_URL, getOrganizationSchema } from "@/lib/jsonld";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import Image from "next/image";

export const metadata: Metadata = {
  title: "關於我們",
  description:
    "TeachBox100 是由 Eno Huang 獨立開發的免費國小生活技能互動教材，2025 年上線，涵蓋新臺幣、時鐘與課堂遊戲工具，不需註冊、可離線使用，原始碼公開。",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "關於我們",
    url: "/about",
    siteName: "TeachBox100",
    type: "website",
    locale: "zh_TW",
  },
};

const PARAGRAPHS = [
  "TeachBox100 是一套放在瀏覽器裡的免費教材。老師或家長打開網頁就能用，不需要註冊帳號，也不需要安裝任何東西。加入主畫面之後，就算教室網路不穩也能離線使用。",
  "內容集中在國小低年級最貼近生活的兩件事：認識新臺幣與看懂時鐘。這兩個單元在課本裡篇幅不多，但要真的學會，得反覆操作很多次。所以每個單元都做成可以一直出新題的小遊戲，不計時、不計分，孩子照自己的步調練。",
  "特教班也常拿這套教材上生活數學和生活自理課。按鈕刻意做得大、回饋做得清楚，金額上限和難度老師都能調。",
  "除了教材，也有翻牌配對、抽籤轉盤、教學大富翁這類讓老師帶入自己題目的課堂工具，同一套遊戲可以用在任何科目的複習。",
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationSchema()),
        }}
      />
      <main className="relative min-h-screen">
        <PageDecor />
        <article className="mx-auto w-full max-w-3xl px-5 pt-8 pb-20 md:px-8 md:pt-28">
          <nav aria-label="麵包屑">
            <ol className="text-muted-foreground flex gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-ink underline-offset-4 hover:underline"
                >
                  首頁
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page">關於</li>
            </ol>
          </nav>

          <h1 className="font-display text-ink mt-8 text-4xl font-black tracking-[-0.02em]">
            關於 TeachBox100
          </h1>

          <div className="text-muted-foreground mt-6 flex flex-col gap-5 text-lg leading-[1.9]">
            {PARAGRAPHS.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>

          <h2 className="font-display text-ink mt-14 text-2xl font-extrabold">
            誰在做這件事
          </h2>
          <div className="mt-5 flex items-start gap-5">
            <Image
              src="/images/mascot/barkley-lying.webp"
              alt=""
              aria-hidden
              width={160}
              height={160}
              className="size-20 shrink-0 object-contain"
            />
            <p className="text-muted-foreground text-lg leading-[1.9]">
              由軟體工程師{" "}
              <a
                href={AUTHOR.github}
                className="text-ink underline underline-offset-4"
                rel="me"
              >
                {AUTHOR.name}
              </a>{" "}
              獨立開發與維護，2025 年 4 月上線。所有原始碼公開在{" "}
              <a
                href={REPO_URL}
                className="text-ink underline underline-offset-4"
              >
                GitHub
              </a>
              ，教材裡的錯誤、想要的新單元，都歡迎到那裡留言。旁邊這隻狗狗叫阿黃，是全站的吉祥物。
            </p>
          </div>

          <h2 className="font-display text-ink mt-14 text-2xl font-extrabold">
            引用與授權
          </h2>
          <p className="text-muted-foreground mt-5 text-lg leading-[1.9]">
            教材可以自由用在課堂、教案和文章裡，引用時請附上網址。
          </p>
        </article>
      </main>
    </>
  );
}
