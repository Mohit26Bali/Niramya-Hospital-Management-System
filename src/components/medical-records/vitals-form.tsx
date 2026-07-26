"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { vitalsSchema, type VitalsFormValues } from "@/schemas/medical-record.schema";
import { updateMedicalRecordVitalsAction } from "@/actions/medical-record.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { MedicalRecord } from "@prisma/client";

export function VitalsForm({
  medicalRecord,
  onSuccess,
}: {
  medicalRecord: MedicalRecord;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      temperatureC: medicalRecord.temperatureC ? Number(medicalRecord.temperatureC) : "",
      bloodPressure: medicalRecord.bloodPressure ?? "",
      heartRateBpm: medicalRecord.heartRateBpm ?? "",
      respiratoryRate: medicalRecord.respiratoryRate ?? "",
      spo2: medicalRecord.spo2 ?? "",
      weightKg: medicalRecord.weightKg ? Number(medicalRecord.weightKg) : "",
      heightCm: medicalRecord.heightCm ? Number(medicalRecord.heightCm) : "",
      nurseNotes: medicalRecord.nurseNotes ?? "",
    },
  });

  function onSubmit(values: VitalsFormValues) {
    const parsed = vitalsSchema.parse(values);
    startTransition(async () => {
      try {
        await updateMedicalRecordVitalsAction(medicalRecord.id, parsed);
        toast.success("Vitals updated");
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
            name="temperatureC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="37.0" {...field} value={field.value as number | string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bloodPressure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood pressure</FormLabel>
                <FormControl>
                  <Input placeholder="120/80" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="heartRateBpm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heart rate (bpm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="72" {...field} value={field.value as number | string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="respiratoryRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Respiratory rate</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="16" {...field} value={field.value as number | string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="spo2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SpO2 (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="98" {...field} value={field.value as number | string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="70" {...field} value={field.value as number | string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heightCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="170" {...field} value={field.value as number | string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nurseNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nurse notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional observation notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Save vitals
          </Button>
        </div>
      </form>
    </Form>
  );
}
