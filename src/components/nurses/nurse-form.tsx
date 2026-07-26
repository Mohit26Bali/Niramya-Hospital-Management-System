"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  nurseSchema,
  nurseCreateSchema,
  type NurseCreateFormValues,
} from "@/schemas/nurse.schema";
import { createNurseAction, updateNurseAction } from "@/actions/nurse.actions";
import { listAllActiveDepartmentsAction } from "@/actions/department.actions";
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
import type { Department, Nurse } from "@prisma/client";

const NONE_DEPARTMENT = "none";

export function NurseForm({
  nurse,
  onSuccess,
}: {
  nurse?: Nurse;
  onSuccess: () => void;
}) {
  const isEdit = !!nurse;
  const [isPending, startTransition] = useTransition();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    listAllActiveDepartmentsAction().then(setDepartments);
  }, []);

  const form = useForm<NurseCreateFormValues>({
    resolver: (isEdit
      ? zodResolver(nurseSchema)
      : zodResolver(nurseCreateSchema)) as unknown as Resolver<NurseCreateFormValues>,
    defaultValues: {
      firstName: nurse?.firstName ?? "",
      lastName: nurse?.lastName ?? "",
      gender: nurse?.gender ?? "MALE",
      phone: nurse?.phone ?? "",
      departmentId: nurse?.departmentId ?? "",
      shift: nurse?.shift ?? "MORNING",
      email: "",
    },
  });

  function onSubmit(values: NurseCreateFormValues) {
    startTransition(async () => {
      try {
        if (nurse) {
          const parsed = nurseSchema.parse(values);
          await updateNurseAction(nurse.id, parsed);
          toast.success("Nurse updated");
        } else {
          const parsed = nurseCreateSchema.parse(values);
          await createNurseAction(parsed);
          toast.success("Nurse created");
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
                  <Input placeholder="Meera" {...field} />
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
                  <Input placeholder="Nair" {...field} />
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
                  <Input type="email" placeholder="nurse@niramaya.hospital" {...field} />
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === NONE_DEPARTMENT ? "" : value)}
                  value={field.value || NONE_DEPARTMENT}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_DEPARTMENT}>None</SelectItem>
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
          <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MORNING">Morning</SelectItem>
                    <SelectItem value="EVENING">Evening</SelectItem>
                    <SelectItem value="NIGHT">Night</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {nurse ? "Save changes" : "Create nurse"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
