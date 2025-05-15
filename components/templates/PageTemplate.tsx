import { type PageWithKey } from "@/app/pages.config";

export const PageTemplate = ({
  page,
  children,
}: {
  page: PageWithKey;
  children: React.ReactNode;
}) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-14 md:p-8 md:pt-4">
      <div className="mx-auto w-full max-w-4xl">
        <div className="w-full">
          <h1 className={`mb-8 text-4xl font-bold md:text-5xl lg:text-6xl vt-${page.key}-title`}>
            {page.title}
          </h1>
        </div>
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
};
