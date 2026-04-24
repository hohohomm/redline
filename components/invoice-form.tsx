"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InvoiceRow = {
  description: string;
  quantity: number;
  unit_price: number;
};

const emptyRow: InvoiceRow = {
  description: "",
  quantity: 1,
  unit_price: 0,
};

export function InvoiceForm() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rows, setRows] = useState<InvoiceRow[]>([emptyRow]);
  const [isSaving, setIsSaving] = useState(false);

  const subtotal = useMemo(() => {
    return rows.reduce((sum, row) => {
      return sum + row.quantity * row.unit_price;
    }, 0);
  }, [rows]);

  function updateRow(index: number, newRow: InvoiceRow) {
    const nextRows = [...rows];
    nextRows[index] = newRow;
    setRows(nextRows);
  }

  function addRow() {
    setRows([...rows, emptyRow]);
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_name: clientName,
        client_email: clientEmail,
        due_date: dueDate,
        rows,
      }),
    });

    setIsSaving(false);

    if (response.ok) {
      router.push("/dashboard/invoices");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <div>
        <p className="mb-3 text-sm text-stone-500">new collection</p>
        <h1 className="text-5xl font-bold tracking-[-0.055em] text-[#f5f1ea]">
          New <span className="gradient-text">invoice.</span>
        </h1>
        <p className="mt-3 text-stone-400">Create a draft invoice.</p>
      </div>

      <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-300">Client name</span>
          <Input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-300">Client email</span>
          <Input
            type="email"
            value={clientEmail}
            onChange={(event) => setClientEmail(event.target.value)}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-300">Due date</span>
          <Input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />
        </label>
      </div>

      <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f5f1ea]">Line items</h2>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            Add row
          </Button>
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-12">
              <Input
                className="sm:col-span-6"
                placeholder="Description"
                value={row.description}
                onChange={(event) =>
                  updateRow(index, { ...row, description: event.target.value })
                }
                required
              />
              <Input
                className="sm:col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={row.quantity}
                onChange={(event) =>
                  updateRow(index, { ...row, quantity: Number(event.target.value) })
                }
                required
              />
              <Input
                className="sm:col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={row.unit_price}
                onChange={(event) =>
                  updateRow(index, { ...row, unit_price: Number(event.target.value) })
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                className="sm:col-span-2"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <p className="text-xl font-semibold text-[#f5f1ea]">
          Subtotal: ${subtotal.toFixed(2)}
        </p>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save invoice"}
        </Button>
      </div>
    </form>
  );
}
