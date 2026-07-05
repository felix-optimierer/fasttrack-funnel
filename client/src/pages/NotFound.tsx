import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { SEO_CONFIG } from "@/lib/seo-config";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, Footer } from "@/components/funnel";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <>
    <SEO {...SEO_CONFIG.notFound} />
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5 text-center"
      style={{
        backgroundImage: `linear-gradient(rgba(6,15,28,0.85), rgba(6,15,28,0.95)), url(${ASSETS.heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Logo className="mb-8" />
      <div className="font-display text-7xl font-extrabold text-gradient-gold">
        404
      </div>
      <h1 className="mt-4 max-w-md text-xl font-bold md:text-2xl">
        Diese Abkürzung führt ins Leere
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Die Seite gibt es nicht – aber der schnellste Weg zu deiner
        Traumwebseite wartet auf der Startseite.
      </p>
      <GoldButton className="mt-7 w-auto px-8" onClick={() => navigate("/")}>
        Zurück zum Fast-Track
        <ArrowRight className="h-5 w-5" />
      </GoldButton>
      <Footer />
    </div>
    </>
  );
}
