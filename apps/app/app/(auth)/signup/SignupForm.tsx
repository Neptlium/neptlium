"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, initialAuthActionState } from "../actions";
import { SubmitButton } from "../SubmitButton";

export function SignupForm() {
  const [state, formAction] = useActionState(signup, initialAuthActionState);

  if (state.success) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="w-full max-w-md px-6 text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="text-slate-400">
            We sent a confirmation link to your email address. Follow it to activate your
            account.
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
            <h1 className="text-3xl font-bold tracking-tight">Netlium</h1>
            <p className="mt-2 text-slate-400">Create an institutional account</p>
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

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-50 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-50 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
                required
              />
            </div>

            <SubmitButton label="Create Account" pendingLabel="Creating account..." />
          </form>

          <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
            <p>
              Already have an account?{" "}
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
