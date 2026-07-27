import Image from "next/image";
import { GALLERY_ITEMS } from "@/content/gallery";
import { Card, CardContent } from "@/components/ui/card";

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Hospital Gallery
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          A look inside our facilities — from patient care areas to diagnostic and support
          services.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {GALLERY_ITEMS.map((item) => (
          <Card key={item.id} className="overflow-hidden border-border shadow-none">
            <CardContent className="p-0">
              <div className="flex items-center justify-center bg-accent p-4">
                <Image
                  src={`/illustrations/gallery/${item.id}.svg`}
                  alt={item.title}
                  width={240}
                  height={200}
                  className="h-auto w-full max-w-[200px]"
                />
              </div>
              <p className="border-t border-border px-4 py-3 text-center text-sm font-medium text-foreground">
                {item.title}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
