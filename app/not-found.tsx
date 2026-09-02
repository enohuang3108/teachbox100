import { pages } from "@/app/pages.config";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "找不到頁面",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-5 text-center">
      <h1 className="font-display text-ink text-4xl font-black">找不到這一頁</h1>
      <p className="text-muted-foreground text-lg leading-[1.75]">
        網址可能打錯了，或這個教材已經搬家。從下面挑一個開始玩吧。
      </p>
      <ul className="flex flex-wrap justify-center gap-2.5">
        <li>
          <Link
            href="/"
            className="bg-ink text-paper inline-flex rounded-full px-5 py-2.5 text-sm font-bold"
          >
            回首頁
          </Link>
        </li>
        {Object.entries(pages).map(([key, page]) => (
          <li key={key}>
            <Link
              href={page.path}
              className="bg-sand text-ink-soft hover:text-ink inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
