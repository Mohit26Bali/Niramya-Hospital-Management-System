"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { markContactMessageHandledAction } from "@/actions/contact-admin.actions";
import { unwrap } from "@/lib/action-result";
import { Button } from "@/components/ui/button";

export function MarkHandledButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            unwrap(await markContactMessageHandledAction(id));
            toast.success("Marked as handled");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong");
          }
        })
      }
    >
      Mark as handled
    </Button>
  );
}
