import { requirePermission } from "@/lib/permissions";
import { listContactMessages } from "@/server/services/contact.service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkHandledButton } from "@/components/messages/mark-handled-button";
import { formatDateTime } from "@/lib/utils";

export default async function MessagesPage() {
  await requirePermission("contactMessage", "read");
  const messages = await listContactMessages();
  const open = messages.filter((m) => !m.handledAt).length;

  return (
    <div>
      <PageHeader
        title="Messages"
        description={`Messages sent from the website contact page. ${open} waiting for a reply.`}
      />
      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">No messages yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{m.subject}</p>
                  <div className="flex items-center gap-2">
                    {m.handledAt ? (
                      <Badge variant="secondary">Handled by {m.handledBy}</Badge>
                    ) : (
                      <Badge>New</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm">{m.message}</p>
                <p className="text-xs text-muted-foreground">
                  {m.name} · {m.email} · {m.phone}
                </p>
                {!m.handledAt && <MarkHandledButton id={m.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
