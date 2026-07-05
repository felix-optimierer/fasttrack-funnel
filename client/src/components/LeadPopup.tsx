// Lead-Popup: Overlay-Formular mit Name, E-Mail, WhatsApp, Checkbox, Validierung.
// Wird von /exit-plan und /ki-report verwendet.
import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { GoldButton } from "@/components/funnel";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface LeadPopupProps {
  open: boolean;
  onClose: () => void;
  /** Headline im Popup, z.B. "An wen dürfen wir den Exit-Plan senden?" */
  headline: string;
  /** Subtext unter der Headline */
  subtext?: string;
  /** Quelle für Lead-Tracking (z.B. "exit-plan" oder "ki-report") */
  source: string;
  /** Redirect-URL nach erfolgreichem Submit (z.B. "/ki-report-termin") */
  redirectTo?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  consent?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  // Mindestens 8 Ziffern (ohne führende 0)
  const digits = phone.replace(/[\s\-\(\)\/\+]/g, "");
  return /^\d{8,15}$/.test(digits);
}

export function LeadPopup({ open, onClose, headline, subtext, source, redirectTo }: LeadPopupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const [, navigate] = useLocation();
  const leadMutation = trpc.leads.create.useMutation();

  // ESC-Taste zum Schließen
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Body-Scroll verhindern
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Feld ist erforderlich";
    if (!email.trim()) {
      newErrors.email = "Feld ist erforderlich";
    } else if (!validateEmail(email)) {
      newErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein";
    }
    if (!phone.trim()) {
      newErrors.phone = "Feld ist erforderlich";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Bitte gib eine gültige Telefonnummer ein (ohne 0)";
    }
    if (!consent) newErrors.consent = "Wählen Sie mindestens eine Option";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await leadMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        source,
      });
      if (redirectTo) {
        toast.success("Perfekt! Du wirst weitergeleitet...");
        setTimeout(() => navigate(redirectTo), 600);
      } else {
        setSubmitted(true);
        toast.success("Perfekt! Dein Download wird vorbereitet.");
      }
    } catch {
      toast.error("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    }
  }

  function handleClose() {
    setName("");
    setEmail("");
    setPhone("");
    setConsent(false);
    setErrors({});
    setSubmitted(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* X-Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Schließen"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Vielen Dank!</h2>
            <p className="text-sm text-neutral-600">
              Dein Download wird in Kürze per WhatsApp & E-Mail zugestellt.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 rounded-lg bg-neutral-100 px-6 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200"
            >
              Schließen
            </button>
          </div>
        ) : (
          <>
            {/* Headline */}
            <h2 className="mb-1 text-center text-xl font-extrabold uppercase text-neutral-900 sm:text-2xl">
              {headline}
            </h2>
            {subtext && (
              <p className="mb-6 text-center text-sm text-neutral-600">
                {subtext}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="Wie heißt du?"
                  className={`w-full rounded-lg border px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition ${errors.name ? "border-red-500 focus:ring-red-200" : "border-neutral-300 focus:border-gold focus:ring-gold/30"} focus:ring-2`}
                />
                {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
              </div>

              {/* E-Mail */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="Deine aktuelle E-Mail Adresse"
                  className={`w-full rounded-lg border px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition ${errors.email ? "border-red-500 focus:ring-red-200" : "border-neutral-300 focus:border-gold focus:ring-gold/30"} focus:ring-2`}
                />
                {errors.email && <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>}
              </div>

              {/* WhatsApp Nummer mit DE-Flagge */}
              <div>
                <div className={`flex items-center rounded-lg border px-4 py-3.5 transition ${errors.phone ? "border-red-500 focus-within:ring-red-200" : "border-neutral-300 focus-within:border-gold focus-within:ring-gold/30"} focus-within:ring-2`}>
                  <span className="mr-3 text-lg" aria-label="Deutschland">🇩🇪</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
                    placeholder="Deine WhatsApp Nummer"
                    className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>}
              </div>

              {/* Consent Checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => { setConsent(e.target.checked); setErrors((p) => ({ ...p, consent: undefined })); }}
                    className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-gold accent-gold"
                  />
                  <span className="text-sm text-neutral-700">
                    Ja, ich möchte von der Bewegungsoptimierer GmbH gelegentlich mit relevanten Infos per WhatsApp kontaktiert werden.
                  </span>
                </label>
                {errors.consent && <p className="mt-1 text-xs font-medium text-red-500">{errors.consent}</p>}
              </div>

              {/* Submit Button */}
              <GoldButton
                type="submit"
                glow
                className="w-full"
                disabled={leadMutation.isPending}
              >
                <Download className="h-5 w-5" />
                {leadMutation.isPending ? "Wird gesendet..." : "Jetzt kostenlos herunterladen"}
              </GoldButton>

              {/* Trust-Hinweise */}
              <div className="flex items-center justify-center gap-4 pt-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  🔒 Deine Daten sind sicher
                </span>
                <span className="flex items-center gap-1">
                  🛡️ SSL verschlüsselt
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
