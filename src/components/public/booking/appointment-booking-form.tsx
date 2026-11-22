"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import {
  publicBookingSchema,
  type PublicBookingFormValues,
} from "@/schemas/public-booking.schema";
import { submitPublicBookingAction } from "@/actions/public-booking.actions";
import { listPublicDepartmentsAction, listPublicDoctorsAction } from "@/actions/public-directory.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
// Only the public fields (see actions/public-directory.actions.ts).
type Department = { id: string; name: string };
type DoctorWithDept = {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  departmentId: string;
  consultationFee: number;
  department: Department;
};

const APPOINTMENT_TYPE_OPTIONS = [
  { value: "CONSULTATION", label: "Consultation" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "HEALTH_CHECKUP", label: "Health Checkup" },
  { value: "EMERGENCY_REFERRAL", label: "Emergency Referral" },
] as const;

export function AppointmentBookingForm({
  defaultDoctorId,
}: {
  defaultDoctorId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithDept[]>([]);
  const [confirmation, setConfirmation] = useState<{
    appointmentNumber: string;
  } | null>(null);

  useEffect(() => {
    listPublicDepartmentsAction().then(setDepartments);
    listPublicDoctorsAction().then((data) => setDoctors(data));
  }, []);

  const form = useForm<PublicBookingFormValues>({
    resolver: zodResolver(publicBookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      gender: "MALE",
      dob: "",
      departmentId: "",
      doctorId: defaultDoctorId ?? "",
      preferredDateTime: "",
      appointmentType: "CONSULTATION",
      reason: "",
      website: "",
    },
  });

  const selectedDepartmentId = form.watch("departmentId");

  // Once doctors have loaded, if we were handed a defaultDoctorId, derive
  // and pre-select its department too.
  useEffect(() => {
    if (!defaultDoctorId || doctors.length === 0) return;
    const doctor = doctors.find((d) => d.id === defaultDoctorId);
    if (doctor && !form.getValues("departmentId")) {
      form.setValue("departmentId", doctor.departmentId);
    }
  }, [defaultDoctorId, doctors, form]);

  const filteredDoctors = useMemo(
    () =>
      selectedDepartmentId
        ? doctors.filter((d) => d.department.id === selectedDepartmentId)
        : doctors,
    [doctors, selectedDepartmentId]
  );

  function onSubmit(values: PublicBookingFormValues) {
    const parsed = publicBookingSchema.parse(values);
    startTransition(async () => {
      const result = await submitPublicBookingAction(parsed);
      if (result.success) {
        setConfirmation({ appointmentNumber: result.appointmentNumber });
      } else {
        toast.error(result.error);
      }
    });
  }

  if (confirmation) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle className="size-14 text-primary" />
          <h2 className="text-2xl font-semibold">Appointment Requested!</h2>
          <p className="text-muted-foreground">
            Our team will confirm your appointment shortly. Please save your appointment
            number for reference.
          </p>
          <div className="mt-2 w-full rounded-lg border border-border bg-muted/40 p-4 text-left">
            <p className="text-xs text-muted-foreground">Appointment Number</p>
            <p className="font-mono text-lg font-semibold">{confirmation.appointmentNumber}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6">
        {/* Honeypot: hidden from people and from screen readers; only scripts fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Leave this field empty
            <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
          </label>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" {...field} />
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
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value as string}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Selected doctor may no longer belong to this department.
                      const currentDoctorId = form.getValues("doctorId");
                      const stillValid = doctors.some(
                        (d) => d.id === currentDoctorId && d.department.id === value
                      );
                      if (!stillValid) form.setValue("doctorId", "");
                    }}
                    value={field.value}
                  >
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
                      {filteredDoctors.map((d) => (
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
              name="preferredDateTime"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Preferred date &amp; time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value as string}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointmentType"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Appointment type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                    >
                      {APPOINTMENT_TYPE_OPTIONS.map((opt) => (
                        <Label
                          key={opt.value}
                          htmlFor={`appointmentType-${opt.value}`}
                          className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-normal hover:bg-accent"
                        >
                          <RadioGroupItem value={opt.value} id={`appointmentType-${opt.value}`} />
                          {opt.label}
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Reason for visit</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe your symptoms or reason for the appointment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Request Appointment
          </Button>
        </div>
      </form>
    </Form>
  );
}
