"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  doctorSchema,
  doctorCreateSchema,
  type DoctorCreateFormValues,
} from "@/schemas/doctor.schema";
import { createDoctorAction, updateDoctorAction } from "@/actions/doctor.actions";
import { listAllActiveDepartmentsAction } from "@/actions/department.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import type { Department, Doctor } from "@prisma/client";

export function DoctorForm({
  doctor,
  onSuccess,
}: {
  doctor?: Doctor;
  onSuccess: () => void;
}) {
  const isEdit = !!doctor;
  const [isPending, startTransition] = useTransition();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    listAllActiveDepartmentsAction().then(setDepartments);
  }, []);

  const form = useForm<DoctorCreateFormValues>({
    resolver: (isEdit
      ? zodResolver(doctorSchema)
      : zodResolver(doctorCreateSchema)) as unknown as Resolver<DoctorCreateFormValues>,
    defaultValues: {
      firstName: doctor?.firstName ?? "",
      lastName: doctor?.lastName ?? "",
      gender: doctor?.gender ?? "MALE",
      specialization: doctor?.specialization ?? "",
      phone: doctor?.phone ?? "",
      qualification: doctor?.qualification ?? "",
      yearsExperience: doctor?.yearsExperience ?? 0,
      consultationFee: doctor ? Number(doctor.consultationFee) : 0,
      departmentId: doctor?.departmentId ?? "",
      isAvailable: doctor?.isAvailable ?? true,
      email: "",
    },
  });

  function onSubmit(values: DoctorCreateFormValues) {
    startTransition(async () => {
      try {
        if (doctor) {
          const parsed = doctorSchema.parse(values);
          await updateDoctorAction(doctor.id, parsed);
          toast.success("Doctor updated");
        } else {
          const parsed = doctorCreateSchema.parse(values);
          await createDoctorAction(parsed);
          toast.success("Doctor created");
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="Anjali" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Rao" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isEdit ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="doctor@niramaya.hospital" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
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
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
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
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <FormControl>
                <Input placeholder="Cardiologist" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="qualification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualification</FormLabel>
                <FormControl>
                  <Input placeholder="MBBS, MD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="yearsExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of experience</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="consultationFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consultation fee</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <FormLabel className="pr-4">Available for consultation</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {doctor ? "Save changes" : "Create doctor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
