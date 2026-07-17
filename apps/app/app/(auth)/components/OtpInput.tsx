"use client";

import {
  useRef,
  useState,
  useCallback,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

interface OtpInputProps {
  /** Hidden input name that carries the joined code to the server action */
  name?: string;
  disabled?: boolean;
  hasError?: boolean;
  onComplete?: (code: string) => void;
}

const LENGTH = 6;

export function OtpInput({
  name = "token",
  disabled = false,
  hasError = false,
  onComplete,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const joined = digits.join("");

  function focus(index: number) {
    inputs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();
  }

  const handleChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);
      if (digit && index < LENGTH - 1) focus(index + 1);
      const code = next.join("");
      if (code.length === LENGTH) onComplete?.(code);
    },
    [digits, onComplete],
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (digits[index]) {
          const next = [...digits];
          next[index] = "";
          setDigits(next);
        } else if (index > 0) {
          focus(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        focus(index - 1);
      } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
        e.preventDefault();
        focus(index + 1);
      }
    },
    [digits],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, LENGTH);
      if (!pasted) return;
      const next = Array(LENGTH).fill("");
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      setDigits(next);
      const filled = pasted.length;
      focus(Math.min(filled, LENGTH - 1));
      if (filled === LENGTH) onComplete?.(pasted);
    },
    [onComplete],
  );

  const boxBase =
    "flex h-14 w-12 items-center justify-center rounded-lg border text-center text-2xl font-semibold tracking-widest caret-transparent outline-none transition-[border-color,box-shadow]";
  const boxIdle =
    "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-1)] text-text-primary focus:border-[color:var(--color-border-focus)] focus:shadow-[var(--shadow-focus-ring)]";
  const boxError =
    "border-[color:var(--color-danger)] bg-[color:var(--color-surface-1)] text-text-primary focus:shadow-[0_0_0_3px_rgba(217,83,79,0.28)]";
  const boxFilled = digits.some(Boolean) ? "border-[color:var(--color-border-strong)]" : "";

  return (
    <div role="group" aria-label="6-digit verification code">
      <input type="hidden" name={name} value={joined} aria-hidden="true" />

      <div className="flex items-center gap-2 sm:gap-3">
        {Array.from({ length: LENGTH }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digits[i]}
            disabled={disabled}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of ${LENGTH}`}
            aria-invalid={hasError}
            className={[
              boxBase,
              hasError ? boxError : boxIdle,
              !hasError && digits[i] ? boxFilled : "",
              disabled ? "cursor-not-allowed opacity-50" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
    </div>
  );
}
