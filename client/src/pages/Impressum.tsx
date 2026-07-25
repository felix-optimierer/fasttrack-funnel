import { Logo, Footer } from "@/components/funnel";
import { SEO } from "@/components/SEO";

export default function Impressum() {
  return (
    <>
      <SEO title="Impressum | Physio Freiheit" description="Impressum der Bewegungsoptimierer GmbH" />
      <div className="min-h-screen flex flex-col">
        <header className="container flex items-center justify-center py-3 md:py-4">
          <Logo />
        </header>

        <main className="container flex-1 py-10">
          <div className="mx-auto max-w-3xl prose prose-invert prose-sm">
            <h1 className="text-2xl font-extrabold text-foreground mb-8">Impressum</h1>

            <section className="space-y-4 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Bewegungsoptimierer GmbH</p>
                <p>Münsterstraße 30<br />91572 Bechhofen</p>
              </div>

              <div>
                <p><span className="font-semibold text-foreground">Handelsregister:</span> HRB 8786</p>
                <p><span className="font-semibold text-foreground">Registergericht:</span> Amtsgericht Ansbach</p>
              </div>

              <div>
                <p><span className="font-semibold text-foreground">USt-IdNr.:</span> DE452764531</p>
              </div>

              <div>
                <p className="font-semibold text-foreground">Vertreten durch die Geschäftsführer:</p>
                <p>Robin Nürnberg, Felix Nürnberg</p>
              </div>

              <div>
                <p className="font-semibold text-foreground">Kontakt:</p>
                <p>Telefon: <a href="tel:+4917670534198" className="text-gold hover:underline">+49 176 70534198</a></p>
                <p>E-Mail: <a href="mailto:support@bewegungsoptimierer.de" className="text-gold hover:underline">support@bewegungsoptimierer.de</a></p>
              </div>

              <div>
                <p className="font-semibold text-foreground">Berufshaftpflichtversicherung:</p>
                <p>
                  Hiscox SA, Niederlassung für Deutschland<br />
                  Hauptbevollmächtigter: Markus Niederreiner<br />
                  Bernhard-Wicki-Str. 3, 80636 München<br />
                  Geltungsraum: Weltweit
                </p>
              </div>

              <div>
                <p className="font-semibold text-foreground">Inhaltlich verantwortlich gem. § 18 Abs. 2 MStV:</p>
                <p>
                  Robin Nürnberg<br />
                  Bewegungsoptimierer GmbH<br />
                  Münsterstraße 30, 91572 Bechhofen
                </p>
              </div>

              <div>
                <p className="font-semibold text-foreground">EU-Streitschlichtung:</p>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                </p>
                <p className="mt-2">
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
