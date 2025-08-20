import { pages } from "@/app/pages.config";
import { Badge } from "@/components/atoms/shadcn/badge";
import { Separator } from "@/components/atoms/shadcn/separator";
import { ImageCard } from "@/components/molecules/ImageCard";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/jsonld";

export default function Home() {
  const websiteSchema = getWebsiteSchema();
  const organizationSchema = getOrganizationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-8 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2 text-primary border-primary/20 bg-primary/10">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              台灣互動式教學平台
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-primary leading-tight">
              TeachBox100
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              專為台灣學童設計的互動式學習平台，在趣味中學習實用知識
            </p>
          </div>
        </section>
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
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
          </div>
        </section>

        {/* Footer Section */}
        <section className="bg-muted/50 border-t border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-6">
              <p className="text-sm text-muted-foreground">
                適合學齡前至國小學生或特教生使用
              </p>
              <Separator className="max-w-xs mx-auto" />
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <Badge variant="secondary">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
                  時鐘辨識
                </Badge>
                <Badge variant="secondary">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
                  金錢計算
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
