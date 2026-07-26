import { getHospitalProfileAction } from "@/actions/settings.actions";
import { PageHeader } from "@/components/shared/page-header";
import { HospitalProfileForm } from "@/components/settings/hospital-profile-form";

export default async function SettingsPage() {
  const profile = await getHospitalProfileAction();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage hospital-wide configuration" />
      <HospitalProfileForm profile={profile} />
    </div>
  );
}
