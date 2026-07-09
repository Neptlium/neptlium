"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, initialAuthActionState } from "../actions";
import { SubmitButton } from "../SubmitButton";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPassword, initialAuthActionState);

  if (state.success) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="w-full max-w-md px-6 text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="text-slate-400">
            If an account exists for that email address, we sent a link to reset your password.
          </p>
          <Link
            href="/login"
            className="inline-block text-slate-300 underline underline-offset-4 hover:text-slate-50"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
            <p className="mt-2 text-slate-400">
              Enter your email address and we&apos;ll send you a reset link
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            {state.error && (
              <div className="rounded-lg border border-red-800 bg-red-900/20 p-4">
                <p className="text-sm text-red-200">{state.error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="investor@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-50 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
                required
              />
            </div>

            <SubmitButton label="Send Reset Link" pendingLabel="Sending..." />
          </form>

          <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
            <p>
              Remembered your password?{" "}
              <Link
                href="/login"
                className="text-slate-300 underline underline-offset-4 hover:text-slate-50"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
