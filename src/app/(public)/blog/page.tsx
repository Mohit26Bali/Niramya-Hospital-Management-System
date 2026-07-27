import Link from "next/link";
import { Clock } from "lucide-react";
import { BLOG_POSTS } from "@/content/blog-posts";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Health Articles
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Practical, reliable health guidance from our medical team — covering prevention,
          chronic care, and everyday wellbeing.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <Card className="h-full border-border shadow-none transition-shadow duration-150 group-hover:shadow-sm">
              <CardContent className="flex h-full flex-col p-6">
                <h2 className="text-base font-semibold text-foreground group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {post.readMinutes} min read
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
