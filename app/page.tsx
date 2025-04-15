import { pages } from "@/app/pages.config";
import { ImageCard } from "@/components/molecules/ImageCard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-row items-center justify-center space-x-4 p-4 md:p-8">
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
