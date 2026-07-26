import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listRoomsAction } from "@/actions/room.actions";
import { PageHeader } from "@/components/shared/page-header";
import { RoomsView } from "@/components/rooms/rooms-view";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listRoomsAction(params)]);

  return (
    <div>
      <PageHeader title="Rooms" description="Manage hospital rooms and occupancy" />
      <RoomsView
        result={{ ...result, data: JSON.parse(JSON.stringify(result.data)) }}
        canCreate={can(session?.user.role, "room", "create")}
        canEdit={can(session?.user.role, "room", "update")}
      />
    </div>
  );
}
