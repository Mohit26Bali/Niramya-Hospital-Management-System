import { PublicNav } from "@/components/public/nav";
import { PublicFooter } from "@/components/public/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public flex min-h-screen flex-col bg-background text-foreground">
      <PublicNav />
      {children}
      <PublicFooter />
    </div>
  );
}
