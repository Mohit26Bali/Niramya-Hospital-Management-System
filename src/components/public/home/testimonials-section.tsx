import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/public/section-heading";
import { testimonials } from "@/content/testimonials";
import { cn } from "@/lib/utils";

export function TestimonialsSection() {
  const shown = testimonials.slice(0, 6);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Patient Stories"
          title="What Our Patients Say"
          align="center"
          className="mx-auto"
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((testimonial) => (
            <Card key={testimonial.name} className="h-full">
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < testimonial.rating
                          ? "fill-primary text-primary"
                          : "fill-transparent text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.city} &middot; {testimonial.treatment}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
