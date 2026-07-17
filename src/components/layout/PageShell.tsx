import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { NetliumBrand } from "@/lib/netlium-branding";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  type?: "marketing" | "app";
}

export const PageShell = ({
  children,
  title,
  description,
  type = "app",
}: PageShellProps) => {
  const location = useLocation();

  const meta = type === "marketing"
    ? NetliumBrand.marketing
    : NetliumBrand.app;

  useEffect(() => {
    window.scrollTo(0, 0);

    document.title = title
      ? `${title} — Netlium`
      : meta.title;

    let metaTag = document.querySelector('meta[name="description"]');

    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "description");
      document.head.appendChild(metaTag);
    }

    metaTag.setAttribute("content", description || meta.description);
  }, [title, description, location.pathname, meta]);

  return (
    <div className="min-h-screen flex flex-col bg-[#05070A] text-white">
      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
