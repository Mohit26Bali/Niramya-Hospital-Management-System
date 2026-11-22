"use client";

import { unwrap } from "@/lib/action-result";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { admissionSchema, type AdmissionFormValues } from "@/schemas/admission.schema";
import { createAdmissionAction, updateAdmissionAction } from "@/actions/admission.actions";
import { listAllActivePatientsAction } from "@/actions/patient.actions";
import { listAllActiveDoctorsAction } from "@/actions/doctor.actions";
import { listAllActiveNursesAction } from "@/actions/nurse.actions";
import { listAllActiveRoomsAction } from "@/actions/room.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Admission, Doctor, Nurse, Room } from "@prisma/client";

type LightPatient = { id: string; firstName: string; lastName: string; patientNumber: string };
type LightDoctor = Omit<Doctor, "consultationFee"> & { consultationFee: number };
type LightRoom = Omit<Room, "ratePerDay"> & { ratePerDay: number };
const UNASSIGNED_NURSE = "unassigned";

export function AdmissionForm({
  admission,
  defaultAdmittedBy,
  onSuccess,
}: {
  admission?: Admission;
  defaultAdmittedBy?: string;
  onSuccess: () => void;
}) {
  const isEdit = !!admission;
  const [isPending, startTransition] = useTransition();
  const [patients, setPatients] = useState<LightPatient[]>([]);
  const [doctors, setDoctors] = useState<LightDoctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [rooms, setRooms] = useState<LightRoom[]>([]);

  useEffect(() => {
    listAllActivePatientsAction().then(setPatients);
    listAllActiveDoctorsAction().then((data) => setDoctors(data));
    listAllActiveNursesAction().then(setNurses);
    listAllActiveRoomsAction().then(setRooms);
  }, []);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      patientId: admission?.patientId ?? "",
      doctorId: admission?.doctorId ?? "",
      nurseId: admission?.nurseId ?? "",
      roomId: admission?.roomId ?? "",
      admittedBy: admission?.admittedBy ?? defaultAdmittedBy ?? "",
      reason: admission?.reason ?? "",
    },
  });

  // Rooms selectable: available rooms, plus the currently assigned room (if editing).
  const selectableRooms = rooms.filter(
    (r) => r.status === "AVAILABLE" || r.id === admission?.roomId
  );

  function onSubmit(values: AdmissionFormValues) {
    const parsed = admissionSchema.parse(values);
    startTransition(async () => {
      try {
        if (admission) {
          unwrap(await updateAdmissionAction(admission.id, parsed));
          toast.success("Admission updated");
        } else {
          unwrap(await createAdmissionAction(parsed));
          toast.success("Patient admitted");
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

        <div className="grid grid-cols-2 gap-4">
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
          <FormField
            control={form.control}
            name="nurseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nurse</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === UNASSIGNED_NURSE ? "" : value)}
                  value={field.value || UNASSIGNED_NURSE}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select nurse" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_NURSE}>Unassigned</SelectItem>
                    {nurses.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.firstName} {n.lastName}
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
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an available room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectableRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.roomNumber} ({r.type})
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
          name="admittedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admitted by</FormLabel>
              <FormControl>
                <Input placeholder="Staff name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Input placeholder="Reason for admission" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {isEdit ? "Save changes" : "Admit patient"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
