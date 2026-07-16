"use client";

import {
  type InputHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  forwardRef,
  useId,
  useState,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "./utils/cn";

export interface FieldProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Field({ children, className }: FieldProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-label text-text-secondary", className)}
      {...props}
    />
  );
}

const inputClasses =
  "w-full rounded-xs border border-border-default bg-surface-2 px-3 py-2 text-body text-text-primary placeholder-text-muted transition-colors duration-150 ease-out focus:border-accent-primary focus:outline-none focus:shadow-[var(--shadow-focus-ring)] disabled:opacity-50 aria-[invalid=true]:border-danger";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const generatedId = useId();
  const toggleId = `${generatedId}-toggle`;

  if (!isPassword) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputClasses, className)}
        {...props}
      />
    );
  }

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(inputClasses, "pr-10", className)}
        {...props}
      />
      <button
        type="button"
        id={toggleId}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        disabled={props.disabled}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-text-muted hover:text-text-secondary focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)] disabled:pointer-events-none"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(inputClasses, "min-h-24 resize-y", className)}
        {...props}
      />
    );
  },
);

export function FieldError({
  children,
  ...props
}: { readonly children?: ReactNode } & HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p role="alert" className="text-body-sm text-danger" {...props}>
      {children}
    </p>
  );
}

export function FieldHint({
  children,
  ...props
}: { readonly children?: ReactNode } & HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className="text-body-sm text-text-muted" {...props}>
      {children}
    </p>
  );
}
