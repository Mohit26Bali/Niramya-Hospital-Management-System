"use client";

import { unwrap } from "@/lib/action-result";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  invoiceSchema,
  invoiceItemCategoryValues,
  type InvoiceFormValues,
} from "@/schemas/invoice.schema";
import { createInvoiceAction } from "@/actions/invoice.actions";
import { listAllActivePatientsAction } from "@/actions/patient.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

type PatientOption = { id: string; firstName: string; lastName: string; patientNumber: string };

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function LineItemsTotal({
  control,
  index,
}: {
  control: Control<InvoiceFormValues>;
  index: number;
}) {
  const quantity = useWatch({ control, name: `items.${index}.quantity` });
  const unitPrice = useWatch({ control, name: `items.${index}.unitPrice` });
  const total = (Number(quantity) || 0) * (Number(unitPrice) || 0);
  return <span className="text-sm font-medium text-foreground">{formatCurrency(total)}</span>;
}

function InvoiceSummary({ control }: { control: Control<InvoiceFormValues> }) {
  const items = useWatch({ control, name: "items" }) ?? [];
  const tax = useWatch({ control, name: "tax" });
  const discount = useWatch({ control, name: "discount" });

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0),
    0
  );
  const totalAmount = subtotal + (Number(tax) || 0) - (Number(discount) || 0);

  return (
    <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Tax</span>
        <span className="font-medium">{formatCurrency(Number(tax) || 0)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Discount</span>
        <span className="font-medium">- {formatCurrency(Number(discount) || 0)}</span>
      </div>
      <div className="mt-2 flex justify-between border-t border-border pt-2">
        <span className="text-base font-semibold text-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}

export function InvoiceForm({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [patients, setPatients] = useState<PatientOption[]>([]);

  useEffect(() => {
    listAllActivePatientsAction().then(setPatients).catch(() => setPatients([]));
  }, []);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      patientId: "",
      items: [{ description: "", category: "CONSULTATION", quantity: 1, unitPrice: 0 }],
      tax: 0,
      discount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function onSubmit(values: InvoiceFormValues) {
    const parsed = invoiceSchema.parse(values);
    startTransition(async () => {
      try {
        unwrap(await createInvoiceAction(parsed));
        toast.success("Invoice created");
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Line items</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                append({ description: "", category: "CONSULTATION", quantity: 1, unitPrice: 0 })
              }
            >
              <Plus className="size-3.5" /> Add item
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((item, index) => (
              <div key={item.id} className="rounded-lg border border-border p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Consultation fee" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.category`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {invoiceItemCategoryValues.map((value) => (
                              <SelectItem key={value} value={value}>
                                {toTitleCase(value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:items-end">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} value={field.value as number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            {...field}
                            value={field.value as number}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Line total</span>
                    <LineItemsTotal control={form.control} index={index} />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {form.formState.errors.items?.message ? (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.items.message}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <InvoiceSummary control={form.control} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Create invoice
          </Button>
        </div>
      </form>
    </Form>
  );
}
