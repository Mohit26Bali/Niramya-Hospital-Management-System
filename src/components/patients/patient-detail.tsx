"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type {
  Admission,
  Appointment,
  Department,
  Doctor,
  Invoice,
  InvoiceItem,
  MedicalRecord,
  Patient,
  Prescription,
  PrescriptionItem,
  Room,
} from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog } from "@/components/shared/form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { PatientForm } from "@/components/patients/patient-form";
import { PatientTimeline } from "@/components/patients/patient-timeline";
import { deletePatientAction } from "@/actions/patient.actions";
import { avatarUrl, calculateAge, formatCurrency, formatDate, formatDateTime, initials } from "@/lib/utils";

const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

export function PatientDetail({
  patient,
  canUpdate,
  canDelete,
  appointments,
  medicalRecords,
  prescriptions,
  admissions,
  invoices,
}: {
  patient: Patient;
  canUpdate: boolean;
  canDelete: boolean;
  appointments: (Appointment & { doctor: Doctor; department: Department })[];
  medicalRecords: (MedicalRecord & { doctor: Doctor })[];
  prescriptions: (Prescription & { doctor: Doctor; items: PrescriptionItem[] })[];
  admissions: (Admission & { doctor: Doctor; room: Room })[];
  invoices: (Invoice & { items: InvoiceItem[] })[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div>
      <Link
        href="/patients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to patients
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={avatarUrl(patient.avatarSeed)} alt={fullName} />
            <AvatarFallback>{initials(fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{fullName}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{patient.patientNumber}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canUpdate ? (
            <FormDialog title="Edit patient" open={editOpen} onOpenChange={setEditOpen}>
              {(close) => (
                <PatientForm
                  patient={patient}
                  onSuccess={() => {
                    close();
                    setEditOpen(false);
                  }}
                />
              )}
            </FormDialog>
          ) : null}
          {canUpdate ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" /> Edit
            </Button>
          ) : null}
          {canDelete ? (
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              }
              title="Delete patient?"
              description={`"${fullName}" will be archived and hidden from lists.`}
              onConfirm={async () => {
                await deletePatientAction(patient.id);
                toast.success("Patient deleted");
                router.push("/patients");
              }}
            />
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medical-history">Medical History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">{patient.gender.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of birth</span>
                  <span className="font-medium">{formatDate(patient.dob)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{calculateAge(patient.dob)} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Blood group</span>
                  {patient.bloodGroup ? (
                    <Badge variant="outline">{BLOOD_GROUP_LABELS[patient.bloodGroup]}</Badge>
                  ) : (
                    <span className="font-medium text-muted-foreground">Unknown</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered on</span>
                  <span className="font-medium">{formatDate(patient.registeredAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{patient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{patient.email ?? "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">Address</span>
                  <span className="text-right font-medium">
                    {patient.address}, {patient.city}, {patient.state} {patient.pincode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency contact</span>
                  <span className="font-medium">
                    {patient.emergencyContactName} ({patient.emergencyContactPhone})
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Medical Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Allergies</p>
                  <p className="mt-1 font-medium">{patient.allergies || "None reported"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Chronic conditions</p>
                  <p className="mt-1 font-medium">{patient.chronicConditions || "None reported"}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance provider</span>
                  <span className="font-medium">{patient.insuranceProvider ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance number</span>
                  <span className="font-medium">{patient.insuranceNumber ?? "—"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <PatientTimeline
            appointments={appointments}
            medicalRecords={medicalRecords}
            prescriptions={prescriptions}
            admissions={admissions}
            invoices={invoices}
          />
        </TabsContent>

        <TabsContent value="appointments">
          {appointments.length === 0 ? (
            <EmptyState title="No appointments yet" description="Upcoming appointments for this patient will appear here." />
          ) : (
            <div className="space-y-2">
              {appointments.map((a) => (
                <Card key={a.id} className="shadow-none">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Dr. {a.doctor.firstName} {a.doctor.lastName} · {a.department.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(a.scheduledAt)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.reason}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="medical-history">
          {medicalRecords.length === 0 ? (
            <EmptyState title="No medical history yet" description="Visit records and diagnoses will appear here." />
          ) : (
            <div className="space-y-2">
              {medicalRecords.map((m) => (
                <Card key={m.id} className="shadow-none">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-foreground">{m.diagnosis}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Dr. {m.doctor.firstName} {m.doctor.lastName} · {formatDate(m.visitDate)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.chiefComplaint}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prescriptions">
          {prescriptions.length === 0 ? (
            <EmptyState title="No prescriptions yet" description="Prescribed medications will appear here." />
          ) : (
            <div className="space-y-2">
              {prescriptions.map((p) => (
                <Card key={p.id} className="shadow-none">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-foreground">
                      Dr. {p.doctor.firstName} {p.doctor.lastName} · {formatDate(p.issuedAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.items.map((i) => `${i.medicineName} (${i.dosage})`).join(", ")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="billing">
          {invoices.length === 0 ? (
            <EmptyState title="No billing records yet" description="Invoices and payment history will appear here." />
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <Card key={inv.id} className="shadow-none">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.invoiceNumber}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(inv.issuedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(Number(inv.totalAmount))}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="admissions">
          {admissions.length === 0 ? (
            <EmptyState title="No admission history yet" description="Hospital admission records will appear here." />
          ) : (
            <div className="space-y-2">
              {admissions.map((ad) => (
                <Card key={ad.id} className="shadow-none">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Room {ad.room.roomNumber} · Dr. {ad.doctor.firstName} {ad.doctor.lastName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(ad.admittedAt)}
                        {ad.dischargedAt ? ` – ${formatDate(ad.dischargedAt)}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={ad.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
