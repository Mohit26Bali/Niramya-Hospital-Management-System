import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/content/blog-posts";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content.split("\n\n");
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to articles
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            {post.readMinutes} min read
          </span>
        </div>
      </div>

      <div className="mt-8">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-4 text-base leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </div>

      {related.length > 0 ? (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="text-lg font-semibold text-foreground">Related Articles</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
                <Card className="h-full border-border shadow-none transition-shadow duration-150 group-hover:shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary">
                      {r.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.readMinutes} min read
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
