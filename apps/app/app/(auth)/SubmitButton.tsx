"use client";

import { useFormStatus } from "react-dom";

export interface SubmitButtonProps {
  readonly label: string;
  readonly pendingLabel: string;
}

export function SubmitButton({ label, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-50 hover:bg-slate-600 disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
