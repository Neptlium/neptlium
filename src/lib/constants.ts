import type { LucideIcon } from "lucide-react";
import {
  Network,
  Cpu,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  Compass,
  BookOpen,
} from "lucide-react";

export const SITE = {
  name: "Netlium",
  domain: "netlium.co",
  tagline: "The Operating System for Institutional Digital Capital.",
  email: "access@netlium.co",
  legal:
    "Netlium provides financial infrastructure software. All allocation outputs are modeled and not guaranteed. Capital movement is subject to network, liquidity, and risk parameters.",
};

/**
 * Marketing platform lives on netliumsystems.com.
 * Every authentication / product-access CTA redirects to the separate
 * application platform at app.netliumsystems.com. Never embed app functionality
 * in the marketing site.
 */
const APP_BASE = "https://app.netliumsystems.com";

export const APP_URLS = {
  app: APP_BASE,
  signup: `${APP_BASE}/request-access`,
  login: `${APP_BASE}/login`,
  dashboard: `${APP_BASE}/dashboard`,
  demo: "/contact",
  contact: "/contact",
};

export type MegaMenuItem = {
  label: string;
  description: string;
  to: string;
  icon: LucideIcon;
};

export type MegaMenuGroup = {
  heading?: string;
  items: MegaMenuItem[];
};

export type NavEntry = {
  label: string;
  to: string;
  mega?: {
    title: string;
    description: string;
    groups: MegaMenuGroup[];
    footer?: {
      title: string;
      description: string;
      to: string;
      cta: string;
    };
  };
};

export const NAV_ENTRIES: NavEntry[] = [
  {
    label: "Platform",
    to: "/platform",
    mega: {
      title: "Platform",
      description:
        "One institutional execution layer for treasury, allocation, and settlement.",
      groups: [
        {
          heading: "Overview",
          items: [
            {
              label: "Platform Overview",
              description: "Treasury, allocation, and operational visibility.",
              to: "/platform",
              icon: Compass,
            },
            {
              label: "Capital Allocation",
              description: "Risk-aware allocation across digital capital.",
              to: "/platform",
              icon: Cpu,
            },
          ],
        },
        {
          heading: "Infrastructure",
          items: [
            {
              label: "Settlement Network",
              description: "Multi-rail capital movement, observable end-to-end.",
              to: "/platform",
              icon: Network,
            },
            {
              label: "Risk Monitoring",
              description: "Constraints enforced before any capital movement.",
              to: "/platform",
              icon: ShieldCheck,
            },
          ],
        },
      ],
      footer: {
        title: "See the platform",
        description:
          "From identity to settlement — engineered as one institutional pipeline.",
        to: "/platform",
        cta: "Explore the platform",
      },
    },
  },
  { label: "Security", to: "/security" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/** Flat link list (used by mobile + footer fallbacks). */
export const NAV_LINKS: { label: string; to: string }[] = NAV_ENTRIES.map(
  ({ label, to }) => ({ label, to })
);

export const RESOURCE_LINKS: { label: string; to: string; icon: LucideIcon }[] =
  [
    { label: "Platform", to: "/platform", icon: BookOpen },
    { label: "Security", to: "/security", icon: Lock },
    { label: "About", to: "/about", icon: Building2 },
    { label: "Contact", to: "/contact", icon: Mail },
  ];

export const FOOTER_LINKS = {
  Platform: [
    { label: "Platform Overview", to: "/platform" },
    { label: "Capital Allocation", to: "/platform" },
    { label: "Settlement Network", to: "/platform" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ],
  Trust: [
    { label: "Security", to: "/security" },
    { label: "Privacy Policy", to: "/legal/privacy" },
    { label: "Terms of Service", to: "/legal/terms" },
  ],
};

