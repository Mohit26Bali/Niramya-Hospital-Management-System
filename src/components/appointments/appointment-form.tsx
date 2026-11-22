"use client";

import { unwrap } from "@/lib/action-result";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  appointmentSchema,
  type AppointmentFormValues,
} from "@/schemas/appointment.schema";
import { createAppointmentAction, updateAppointmentAction } from "@/actions/appointment.actions";
import { listAllActivePatientsAction } from "@/actions/patient.actions";
import { listAllActiveDoctorsAction } from "@/actions/doctor.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Appointment, Department, Doctor } from "@prisma/client";

type LightPatient = { id: string; firstName: string; lastName: string; patientNumber: string };
type DoctorWithDept = Omit<Doctor, "consultationFee"> & {
  consultationFee: number;
  department: Department;
};

export function AppointmentForm({
  appointment,
  onSuccess,
}: {
  appointment?: Appointment;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [patients, setPatients] = useState<LightPatient[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithDept[]>([]);

  useEffect(() => {
    listAllActivePatientsAction().then(setPatients);
    listAllActiveDoctorsAction().then((data) => setDoctors(data));
  }, []);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      doctorId: appointment?.doctorId ?? "",
      departmentId: appointment?.departmentId ?? "",
      scheduledAt: appointment
        ? new Date(appointment.scheduledAt).toISOString().slice(0, 16)
        : "",
      durationMins: appointment?.durationMins ?? 30,
      reason: appointment?.reason ?? "",
      notes: appointment?.notes ?? "",
    },
  });

  function onSubmit(values: AppointmentFormValues) {
    const parsed = appointmentSchema.parse(values);
    startTransition(async () => {
      try {
        if (appointment) {
          unwrap(await updateAppointmentAction(appointment.id, parsed));
          toast.success("Appointment updated");
        } else {
          unwrap(await createAppointmentAction(parsed));
          toast.success("Appointment created");
        }
        onSuccess();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.patientNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const doctor = doctors.find((d) => d.id === value);
                  if (doctor) form.setValue("departmentId", doctor.departmentId);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName} — {d.department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled at</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={
                      field.value
                        ? new Date(field.value as string | number | Date).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationMins"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (mins)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Input placeholder="Routine checkup" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {appointment ? "Save changes" : "Create appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
