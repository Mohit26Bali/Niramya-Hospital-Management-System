import { AppointmentBookingForm } from "@/components/public/booking/appointment-booking-form";

export const metadata = {
  title: "Book an Appointment | Niramaya",
  description: "Request an appointment with a Niramaya doctor online.",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const doctorIdParam = params.doctorId;
  const defaultDoctorId = typeof doctorIdParam === "string" ? doctorIdParam : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Book an Appointment</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Fill out the form below to request an appointment with one of our doctors. Our team
          will reach out to confirm your visit.
        </p>
      </div>
      <AppointmentBookingForm defaultDoctorId={defaultDoctorId} />
    </div>
  );
}
