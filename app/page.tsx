import { pages } from "@/app/pages.config";
import { Background } from "@/components/atoms/Background";
import { ImageCard } from "@/components/molecules/ImageCard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-row space-x-4 items-center justify-center p-4 md:p-8">
      <Background />
      {Object.values(pages).map((page) => (
        <ImageCard
          key={page.path}
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
