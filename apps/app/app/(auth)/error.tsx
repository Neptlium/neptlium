"use client";

export interface AuthErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function AuthError({ reset }: AuthErrorProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md px-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-slate-400">We couldn&apos;t complete your request. Please try again.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-50 hover:bg-slate-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
