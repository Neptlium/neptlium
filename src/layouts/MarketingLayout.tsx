import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * MARKETING LAYOUT — public website only.
 * No Supabase, no auth, no user state. Renders the marketing chrome
 * (navbar + footer) around the routed marketing page.
 */
export const MarketingLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
