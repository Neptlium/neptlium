"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, initialAuthActionState } from "../actions";
import { SubmitButton } from "../SubmitButton";

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialAuthActionState);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Netlium</h1>
            <p className="mt-2 text-slate-400">Institutional Capital Operations</p>
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

            <SubmitButton label="Sign In" pendingLabel="Signing in..." />
          </form>

          <div className="space-y-3 border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
            <p>
              <Link
                href="/reset-password"
                className="text-slate-300 underline underline-offset-4 hover:text-slate-50"
              >
                Forgot your password?
              </Link>
            </p>
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-slate-300 underline underline-offset-4 hover:text-slate-50"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
