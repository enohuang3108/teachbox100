import { pages } from "@/app/pages.config";
import { ImageCard } from "@/components/molecules/ImageCard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-wrap items-center justify-center gap-4 px-16 py-32 lg:p-16">
      {Object.entries(pages)
        .map(([key, page]) => (
          <ImageCard
            key={key}
            pageKey={key}
            link={page.path}
            imageSrc={page.imageSrc}
            blurDataURL={page.blurDataURL}
            cardTitle={page.title}
            cardDescription={page.description}
          />
        ))}
    </main>
  );
}
