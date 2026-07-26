"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  medicalRecordSchema,
  type MedicalRecordFormValues,
} from "@/schemas/medical-record.schema";
import {
  createMedicalRecordAction,
  updateMedicalRecordAction,
} from "@/actions/medical-record.actions";
import { listAllActivePatientsAction } from "@/actions/patient.actions";
import { listAllActiveDoctorsAction } from "@/actions/doctor.actions";
import { Button } from "@/components/ui/button";
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
import type { MedicalRecord } from "@prisma/client";

type PatientOption = { id: string; firstName: string; lastName: string; patientNumber: string };
type DoctorOption = { id: string; firstName: string; lastName: string };

export function MedicalRecordForm({
  medicalRecord,
  onSuccess,
}: {
  medicalRecord?: MedicalRecord;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  useEffect(() => {
    listAllActivePatientsAction().then(setPatients);
    listAllActiveDoctorsAction().then(setDoctors);
  }, []);

  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: medicalRecord?.patientId ?? "",
      doctorId: medicalRecord?.doctorId ?? "",
      chiefComplaint: medicalRecord?.chiefComplaint ?? "",
      symptoms: medicalRecord?.symptoms ?? "",
      diagnosis: medicalRecord?.diagnosis ?? "",
      allergies: medicalRecord?.allergies ?? "",
      treatmentPlan: medicalRecord?.treatmentPlan ?? "",
      doctorNotes: medicalRecord?.doctorNotes ?? "",
    },
  });

  function onSubmit(values: MedicalRecordFormValues) {
    const parsed = medicalRecordSchema.parse(values);
    startTransition(async () => {
      try {
        if (medicalRecord) {
          await updateMedicalRecordAction(medicalRecord.id, parsed);
          toast.success("Medical record updated");
        } else {
          await createMedicalRecordAction(parsed);
          toast.success("Medical record created");
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
        <div className="grid grid-cols-2 gap-4">
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        Dr. {d.firstName} {d.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="chiefComplaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chief complaint</FormLabel>
              <FormControl>
                <Textarea placeholder="Reason for visit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symptoms</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional symptom notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Textarea placeholder="Diagnosis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional known allergies" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatmentPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment plan</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional treatment plan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional private notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {medicalRecord ? "Save changes" : "Create record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
