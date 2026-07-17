import { Routes, Route } from "react-router-dom";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import Home from "@/routes/Home";
import About from "@/routes/About";
import Platform from "@/routes/Platform";
import Security from "@/routes/Security";
import Contact from "@/routes/Contact";
import Privacy from "@/routes/legal/Privacy";
import Terms from "@/routes/legal/Terms";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/security" element={<Security />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
