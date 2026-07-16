"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AuthBackground } from "./AuthBackground";
import { TrustFooter } from "./TrustFooter";
import { NeptliumMark } from "./NeptliumMark";

export interface AuthShellProps {
  readonly children: ReactNode;
}

/**
 * Auth shell layout.
 *
 * - Neptlium mark top-left, no text beside it.
 * - Content column: centered, 420px max-width, responsive padding.
 * - Trust footer at the bottom.
 * - Form sits directly on the background — no outer card boundary.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate flex min-h-screen min-h-dvh flex-col px-6 py-10 sm:px-10">
        <AuthBackground />

        {/* Top-left mark */}
        <div className="mb-12 flex w-full max-w-[560px] self-start sm:mb-14">
          <NeptliumMark size={36} />
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        {/* Trust footer */}
        <div className="mt-12 flex w-full justify-center">
          <TrustFooter />
        </div>
      </div>
    </MotionConfig>
  );
}
