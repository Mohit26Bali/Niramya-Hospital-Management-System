import { revalidatePath } from "next/cache";

/**
 * The public website's doctor and department pages are generated ahead of time. Without this call a doctor
 * added, changed or removed in the staff portal would not appear (or disappear) on the website until the next
 * deployment.
 */
export function revalidatePublicDirectory() {
  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/departments");
  revalidatePath("/doctors/[id]", "page");
  revalidatePath("/departments/[id]", "page");
}
