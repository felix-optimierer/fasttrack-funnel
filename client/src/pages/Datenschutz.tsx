import { Logo, Footer } from "@/components/funnel";
import { SEO } from "@/components/SEO";

export default function Datenschutz() {
  return (
    <>
      <SEO title="Datenschutzerklärung | Physio Freiheit" description="Datenschutzerklärung der Bewegungsoptimierer GmbH für go.physiofreiheit.de" />
      <div className="min-h-screen flex flex-col">
        <header className="container flex items-center justify-center py-3 md:py-4">
          <Logo />
        </header>

        <main className="container flex-1 py-10">
          <div className="mx-auto max-w-3xl space-y-8 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Datenschutz</h1>
              <p className="mt-2 font-semibold text-foreground">Bewegungsoptimierer GmbH</p>
              <p className="text-xs text-muted-foreground">Stand: 23. Juli 2026</p>
            </div>

            <p>
              Der Schutz Ihrer personenbezogenen Daten ist uns ein großes Anliegen. Daher möchten wir Ihnen hier alle Informationen über die Verarbeitung und Speicherung Ihrer Daten beim Besuch unserer Website und in unseren Unternehmen auflisten.
            </p>
            <p>
              Um alle Funktionen und Dienste unserer Seite in Anspruch nehmen zu können, ist eine Erhebung Ihrer personenbezogenen Daten teilweise erforderlich. Die Bearbeitung und Speicherung erfolgt ausschließlich nach den gesetzlichen Vorgaben der Datenschutz-Grundverordnung (DSGVO), des Bundesdatenschutzgesetzes (BDSG) und des Telekommunikation-Digitale-Dienste-Datenschutz-Gesetzes (TDDDG).
            </p>

            {/* Verantwortliche Stelle */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Verantwortliche Stelle</h2>
              <p>
                Bewegungsoptimierer GmbH<br />
                Münsterstraße 30, 91572 Bechhofen<br />
                Kontakt: robin@bewegungsoptimierer.de
              </p>
              <p>
                Nähere Informationen finden Sie im <a href="/impressum" className="underline text-gold hover:text-gold/80">Impressum</a>.
              </p>
            </section>

            {/* Datenschutzbeauftragte */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Datenschutzbeauftragte</h2>
              <p>
                Mag. Elisa Drescher<br />
                Kontakt: office@scaleline-ltd.com
              </p>
            </section>

            {/* Allgemeine Hinweise zur Datensicherheit */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Allgemeine Hinweise zur Datensicherheit</h2>
              <p>
                Um Ihre Daten möglichst umfassend vor unerwünschten Zugriffen zu schützen, ergreifen wir technische und organisatorische Maßnahmen und setzen auf unserer Website ein Verschlüsselungsverfahren ein. Ihre Daten werden über das Internet mittels einer sogenannten TLS-Verschlüsselung von Ihrem Endgerät zu unserem Server und umgekehrt übertragen. TLS steht für „Transport Layer Security" und ist ein Verschlüsselungsprotokoll für die Datenübertragung im Internet. Sie erkennen eine bestehende Verschlüsselung in der Regel daran, dass das Schloss-Symbol in der Adressleiste Ihres Browsers geschlossen ist und die Adresse mit https:// beginnt.
              </p>
            </section>

            {/* Hosting */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Hosting und Bereitstellung der Website</h2>
              <p>
                Zur Bereitstellung unserer Website und der zugehörigen Landingpages setzen wir externe Dienstleister ein, die in unserem Auftrag als Auftragsverarbeiter tätig werden. Beim Aufruf der Website werden automatisch technisch erforderliche Verbindungs- und Server-Log-Daten verarbeitet.
              </p>
            </section>

            {/* Zugriffs- und Protokolldaten */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Erhebung von Zugriffs- und Protokolldaten</h2>
              <p>
                Diese Website erhebt und speichert automatisch Informationen in sogenannten Server-Log-Files, die Ihr Browser an uns übermittelt. Es handelt sich hierbei um:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP-Adresse des Nutzers</li>
                <li>Datum und Zeitpunkt des Zugriffs</li>
                <li>Art der Anfrage</li>
                <li>Browsertyp und Browserversion</li>
                <li>Betriebssystem des Nutzers (Gerät, OS-Version)</li>
                <li>Referrer-Informationen (Quelle des Zugriffs)</li>
              </ul>
              <p>
                Rechtsgrundlage für diese Verarbeitung ist unser berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt darin, Anhaltspunkte einer rechtswidrigen Nutzung unserer Website ermitteln zu können (etwa zur Abwehr von Angriffen) und einen reibungslosen Verbindungsaufbau zu gewährleisten. Eine längere Speicherung der Log-Dateien erfolgt nur bei Angriffen auf unsere Infrastruktur oder anderen Rechtsverletzungen zum Zweck der Beweissicherung, ebenfalls auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              </p>
              <p>
                Mit dem Provider dieser Website der Hetzner Online GmbH mit Sitz in Deutschland haben wir einen Auftragsverarbeitungsvertrag nach Art. 28 DSGVO abgeschlossen. Hierbei handelt es sich um einen datenschutzrechtlich vorgeschriebenen Vertrag, der gewährleistet, dass die Hetzner Online GmbH die personenbezogenen Daten unserer Websitebesucher nur nach unseren Weisungen und unter Einhaltung der DSGVO verarbeitet.
              </p>
              <p>
                Die erhobenen Daten werden in Server-Log-Dateien, die Ihr Browser automatisch an uns verschlüsselt übermittelt, für 7 Tage gespeichert. Nur bei Angriffen auf unsere Server-Infrastruktur oder anderen Rechtsverletzungen speichern wir die Server-Log-Dateien. Diese längere Speicherdauer erfolgt aufgrund unseres berechtigten Interesses nach Art. 6 Abs. 1 lit. f) DSGVO und dient lediglich der Beweissicherung.
              </p>
            </section>

            {/* Cookies und Einwilligungsmanagement */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Einsatz von Cookies und Einwilligungsmanagement</h2>
              <p>
                Wir verwenden Cookies und ähnliche Technologien, um die Nutzung unserer Website zu ermöglichen, komfortabler zu gestalten und auszuwerten. Cookies sind kleine Textinformationen, die über den Browser auf Ihrem Endgerät gespeichert werden können. Ergänzend setzen wir sogenannte Web Beacons (auch Pixel Tags oder Clear GIFs) ein, die zusammen mit Cookies das Nutzerverhalten auf der Website erfassen können.
              </p>
              <p>
                Die durch technisch notwendige Cookies verarbeiteten Daten sind zur Wahrung unserer berechtigten Interessen sowie der Dritter nach Art. 6 Abs. 1 lit. f DSGVO erforderlich. Jeder Einsatz von Cookies und Technologien, der nicht technisch zwingend erforderlich ist, stellt eine Verarbeitung dar, die nur mit Ihrer ausdrücklichen und aktiven Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO sowie nach den Vorgaben des TDDDG erfolgt.
              </p>
              <p>
                Über unser Cookie-Consent-Tool können Sie selbst einstellen, welchen Kategorien Sie zustimmen. Sie können Ihre Einwilligung dort jederzeit mit Wirkung für die Zukunft widerrufen oder ändern. Einmal gespeicherte Cookies können Sie zudem jederzeit über die Einstellungen Ihres Browsers löschen; außerdem können Sie Ihren Browser so einstellen, dass keine Cookies gespeichert werden. In diesem Fall stehen unter Umständen nicht alle Funktionen der Website zur Verfügung.
              </p>
              <p>Wir setzen Cookies und Technologien für folgende Zwecke ein:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Technisch notwendig:</strong> ohne diese können Sie unsere Dienste nicht nutzen (z.&nbsp;B. korrekte Anzeige der Website, von Ihnen gewünschte Funktionen).</li>
                <li><strong>Komfort:</strong> Berücksichtigung Ihrer tatsächlichen oder vermuteten Präferenzen (z.&nbsp;B. Sprache).</li>
                <li><strong>Statistik:</strong> anonyme Statistiken zur Nutzung unserer Dienste.</li>
                <li><strong>Marketing:</strong> Anzeige auf Sie abgestimmter Werbeinhalte auf Grundlage einer Analyse Ihres Nutzungsverhaltens, ggf. website-, browser- oder geräteübergreifend anhand einer User-ID.</li>
              </ul>
            </section>

            {/* Einwilligungsmanagement */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Einwilligungsmanagement</h2>
              <p>
                Wir nutzen eine Cookie-Consent-Technologie, um Ihre datenschutzrechtliche Einwilligung zur Speicherung bestimmter Cookies bzw. zum Einsatz bestimmter Technologien einzuholen und datenschutzkonform zu dokumentieren. Hierfür werden technisch notwendige Cookies gesetzt, in denen unter anderem Cookie-Laufzeit, Cookie-Version, Domain und Pfad der Website, Ihre Einwilligungen sowie eine zufällig generierte UID gespeichert werden. Rechtsgrundlage ist unser berechtigtes Interesse an der rechtssicheren Dokumentation und Nachweisbarkeit von Einwilligungen (Art. 6 Abs. 1 lit. f DSGVO) sowie die Erfüllung unserer Rechenschaftspflicht (Art. 5 Abs. 2, Art. 6 Abs. 1 lit. c DSGVO).
              </p>
            </section>

            {/* Google Tag Manager */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Google Tag Manager</h2>
              <p>
                Wir nutzen den Google Tag Manager der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Über den Google Tag Manager werden Website-Tags zentral verwaltet. Als Tags werden kleine Code-Abschnitte bezeichnet, die beispielsweise Aktivitäten auf unserer Website erfassen. Der Google Tag Manager selbst setzt keine Cookies, sondern steuert das Auslösen anderer Tags, die ihrerseits Daten erfassen können. Bei der Einbindung kann Ihre IP-Adresse an Google übertragen werden; dabei kann es auch zu einer Übermittlung an Server von Google in den USA kommen. Mit Google besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.
              </p>
              <p>
                Für Übermittlungen in die USA stützen wir uns auf den Angemessenheitsbeschluss der EU-Kommission zum EU-US Data Privacy Framework (Art. 45 DSGVO), soweit der jeweilige Empfänger zertifiziert ist; ergänzend können Standardvertragsklauseln (Art. 46 DSGVO) zur Anwendung kommen.
              </p>
            </section>

            {/* Google Analytics */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Google Analytics</h2>
              <p>
                Sofern Sie Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO erteilen, nutzt diese Website Google Analytics, einen Dienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, sowie der Google LLC (USA). Google Analytics verwendet Cookies und ähnliche Technologien, die eine Analyse der Nutzung der Website ermöglichen. Die dabei erzeugten Informationen über Ihre Nutzung dieser Website können an Server von Google, auch in den USA, übertragen und dort gespeichert werden. Für Übermittlungen in die USA stützen wir uns auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework (Art. 45 DSGVO), ergänzend auf Standardvertragsklauseln (Art. 46 DSGVO).
              </p>
              <p>
                Im Auftrag des Betreibers dieser Website nutzt Google diese Informationen, um Ihre Nutzung der Website auszuwerten, Reports über die Websiteaktivitäten zusammenzustellen und weitere mit der Website- und Internetnutzung verbundene Dienstleistungen zu erbringen. Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft über den Cookie-Banner widerrufen. Die Aufbewahrungsdauer der Nutzer- und Ereignisdaten richtet sich nach den Einstellungen der jeweiligen Property.
              </p>
            </section>

            {/* Google Ads */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Google Ads, Conversion-Tracking und Remarketing</h2>
              <p>
                Sofern Sie eingewilligt haben (Art. 6 Abs. 1 lit. a DSGVO), setzen wir Dienste der Google Ireland Limited für Conversion-Tracking und Remarketing ein. Dabei werden über die Google-Werbedienste (u.&nbsp;a. über die Domain doubleclick.net) Cookies bzw. ähnliche Technologien genutzt, um die Wirksamkeit unserer Werbeanzeigen zu messen und Ihnen auf Basis Ihres Nutzungsverhaltens interessenbezogene Werbung auf Websites Dritter und in Google-Diensten anzuzeigen. Hierbei kann es zu einer Übermittlung von Daten an Google, auch in die USA, kommen. Für diese Übermittlung stützen wir uns auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework (Art. 45 DSGVO), ergänzend auf Standardvertragsklauseln (Art. 46 DSGVO). Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
              </p>
            </section>

            {/* Meta-Pixel */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Meta-Pixel (Facebook-Pixel) und serverseitiges Tracking</h2>
              <p>
                Mit Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) setzen wir auf unserer Website das Meta-Pixel (Facebook-Pixel) ein. Für die mit dem Pixel verbundenen Verarbeitungen sind neben uns auch die Meta Platforms Ireland Limited, 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland, gemeinsam Verantwortliche nach Art. 26 DSGVO; hierzu besteht eine entsprechende Vereinbarung. Durch das Pixel werden Daten über Ihre Nutzung unserer Website erhoben und mit Daten von Meta abgeglichen, um Ihnen auf den Plattformen von Meta auf Sie abgestimmte Werbung anzuzeigen und Conversions zu messen. Meta verwendet die Daten auch für eigene Zwecke sowie für Werbezwecke Dritter gemäß der Datenrichtlinie von Meta.
              </p>
              <p>
                Ergänzend kann ein serverseitiges Übermitteln von Ereignisdaten (Conversions API) über eine von uns genutzte Serverschnittstelle erfolgen. Bei einer Übermittlung in die USA stützen wir uns auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework (Art. 45 DSGVO), ergänzend auf Standardvertragsklauseln (Art. 46 DSGVO). Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
              </p>
            </section>

            {/* Microsoft Clarity */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Microsoft Clarity</h2>
              <p>
                Mit Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO nutzen wir Microsoft Clarity, einen Dienst der Microsoft Ireland Operations Limited. Clarity analysiert in pseudonymer Form die Performance unserer Website und stellt uns zum Beispiel Heatmaps bereit, die zeigen, welche Bereiche unserer Website besonders genutzt werden. Datenübermittlungen an die Microsoft Corporation (USA) stützen wir auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework (Art. 45 DSGVO), ergänzend auf Standardvertragsklauseln. Microsoft verarbeitet die Daten weisungsgebunden in unserem Auftrag; hierzu besteht ein Auftragsverarbeitungsvertrag. Die Speicherdauer entnehmen Sie den Angaben im Cookie-Banner. Weitere Informationen:{" "}
                <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer" className="underline text-gold hover:text-gold/80">https://clarity.microsoft.com</a>
              </p>
            </section>

            {/* Taboola */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Taboola</h2>
              <p>
                Mit Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO setzen wir auf unserer Website das Taboola-Pixel ein, einen Dienst der Taboola Inc., 16 Madison Square West, 7th Floor, New York, NY 10010, USA. Das Taboola-Pixel ermöglicht es uns, die Wirksamkeit unserer Werbeanzeigen auf der Taboola-Plattform zu messen und Ihnen auf Basis Ihres Nutzungsverhaltens interessenbezogene Inhalte und Werbung anzuzeigen. Dabei können Daten über Ihre Nutzung unserer Website (z.&nbsp;B. aufgerufene Seiten, IP-Adresse, Browser-Informationen) an Server von Taboola, auch in den USA, übertragen werden.
              </p>
              <p>
                Für Übermittlungen in die USA stützen wir uns auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework (Art. 45 DSGVO), ergänzend auf Standardvertragsklauseln (Art. 46 DSGVO). Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft über den Cookie-Banner widerrufen. Weitere Informationen:{" "}
                <a href="https://www.taboola.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-gold hover:text-gold/80">https://www.taboola.com/policies/privacy-policy</a>
              </p>
            </section>

            {/* Matomo */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Matomo</h2>
              <p>
                Sofern Sie Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO erteilen, nutzen wir den Webanalyse-Dienst Matomo zur Analyse des Nutzungsverhaltens auf unserer Website. Das Hosting erfolgt über unseren Auftragsverarbeiter, die Piwik PRO GmbH mit Sitz in Deutschland. Eine Weitergabe der Daten an sonstige Dritte erfolgt nicht. Nach Erteilung Ihrer Einwilligung setzt Matomo Cookies, sodass Ihr Browser wiedererkannt werden kann. Ihre IP-Adresse wird gekürzt (anonymisiert) verarbeitet.
              </p>
              <p>Dabei können folgende Daten verarbeitet werden:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP-Adresse des Nutzers, gekürzt um die letzten zwei Bytes (anonymisiert)</li>
                <li>aufgerufene Unterseite und Zeitpunkt des Aufrufs</li>
                <li>Seite, von der Sie auf unsere Website gelangt sind (Referrer)</li>
                <li>verwendeter Browser samt Plugins, Betriebssystem und Bildschirmauflösung</li>
                <li>Verweildauer auf der Website</li>
                <li>von der aufgerufenen Unterseite aus angesteuerte Seiten</li>
              </ul>
              <p>
                Die Daten werden nicht dazu genutzt, Sie persönlich zu identifizieren, und werden nicht mit anderen Daten zusammengeführt oder an Dritte verkauft.
              </p>
            </section>

            {/* WhatsApp */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Kommunikation über WhatsApp und WhatsApp-Marketing</h2>
              <p>
                Wir bieten die Möglichkeit, mit uns über den Messenger-Dienst WhatsApp zu kommunizieren. Anbieter ist die WhatsApp Ireland Limited, 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland, ein Unternehmen der Meta-Unternehmensgruppe. Bei der Nutzung von WhatsApp werden insbesondere Ihre Mobilfunknummer, Nachrichteninhalte sowie Nutzungs- und Gerätedaten verarbeitet. Es kann zu einer Übermittlung von Daten an die Meta Platforms, Inc. in den USA kommen; hierfür stützen wir uns auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework (Art. 45 DSGVO), ergänzend auf Standardvertragsklauseln (Art. 46 DSGVO). Weiters können beauftragte Agenturen Zugriff auf Ihre Daten haben. Die Agenturen sind hier als Auftragsverarbeiter tätig und dürfen auf die Daten ausschließlich nach unseren Weisungen Zugriff nehmen.
              </p>
              <h3 className="text-base font-semibold text-foreground">Individuelle Kommunikation</h3>
              <p>
                Wenn Sie uns über WhatsApp kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage der Anbahnung oder Durchführung eines Vertrags dient, andernfalls unser berechtigtes Interesse an einer effizienten Kommunikation nach Art. 6 Abs. 1 lit. f DSGVO. Wir empfehlen, über WhatsApp keine sensiblen Informationen (z.&nbsp;B. Gesundheitsdaten) zu übermitteln.
              </p>
            </section>

            {/* CRM SalesSuite */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Customer-Relationship-Management (SalesSuite)</h2>
              <p>
                Zur Verwaltung von Interessenten- und Kundendaten sowie zur Steuerung unseres Vertriebs- und Kommunikationsprozesses nutzen wir das CRM-System SalesSuite. Anbieter ist die SalesSuite CRM FlexCo mit Sitz in Österreich. In SalesSuite werden insbesondere Daten verarbeitet, die Sie uns über unsere Formulare, im Rahmen von Anfragen oder der weiteren Kommunikation zur Verfügung stellen, beispielsweise Name, E-Mail-Adresse, Telefonnummer, Angaben aus Formularen sowie der Kommunikationsverlauf und der Status im Vertriebsprozess. Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.
              </p>
              <p>
                Die Verarbeitung dient der Organisation, Dokumentation und Nachverfolgung von Kontakten und Geschäftsvorgängen, der Kommunikation mit Ihnen (u.&nbsp;a. E-Mail-Versand aus dem System, telefonische Kontaktaufnahme) sowie der Auswertung unserer Vertriebsaktivitäten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung der Anbahnung oder Durchführung eines Vertrags dient, sowie Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an einer effizienten Kunden- und Interessentenverwaltung.
              </p>
            </section>

            {/* E-Mail-Marketing KlickTipp */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">E-Mail-Marketing (KlickTipp)</h2>
              <p>
                Wir verwenden KlickTipp (Coyosoft GmbH, Deutschland) für den Versand von E-Mails. Ihre E-Mail-Adresse und Ihr Name werden nach Ihrer Eintragung an KlickTipp übermittelt. KlickTipp speichert diese Daten auf Servern in Deutschland. KlickTipp ermöglicht uns, Öffnungs- und Klickraten zu analysieren. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Sie können sich jederzeit über den Abmeldelink in jeder E-Mail abmelden.
              </p>
            </section>

            {/* Automatisierung Make.com */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Automatisierung (Make.com)</h2>
              <p>
                Wir verwenden Make.com (Celonis SE, München) zur Automatisierung von Geschäftsprozessen. Nach Ihrer Eintragung können Ihre Daten über Make.com an weitere Dienste (z.&nbsp;B. KlickTipp, SalesSuite) weitergeleitet werden. Make.com verarbeitet Daten gemäß der DSGVO auf Servern in der EU. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
              </p>
            </section>

            {/* Videos Wistia */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Videos (Wistia)</h2>
              <p>
                Auf unserer Website binden wir Videos des Anbieters Wistia (Wistia Inc., Cambridge, MA, USA) ein. Die Einbindung erfolgt über eine 2-Click-Lösung: Das Video wird erst geladen, nachdem Sie aktiv auf den Play-Button klicken. Erst dann wird eine Verbindung zu den Servern von Wistia hergestellt.
              </p>
              <p>Bei der Nutzung können folgende Daten an Wistia übertragen werden:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP-Adresse</li>
                <li>Browser-Typ und -Version</li>
                <li>Betriebssystem</li>
                <li>Wiedergabedaten (Abspielposition, Dauer)</li>
              </ul>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch Klick auf Play). Wistia verarbeitet Daten gemäß dem EU-US Data Privacy Framework.
              </p>
            </section>

            {/* Terminbuchung Calendly */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Terminbuchung (Calendly)</h2>
              <p>
                Für die Online-Terminbuchung verwenden wir Calendly (Calendly LLC, Atlanta, GA, USA). Das Calendly-Widget wird erst nach Ihrer Einwilligung über den Cookie-Consent-Banner geladen.
              </p>
              <p>Bei der Terminbuchung werden folgende Daten erhoben:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name</li>
                <li>E-Mail-Adresse</li>
                <li>Gewählter Termin</li>
                <li>Ggf. weitere von Ihnen eingegebene Informationen</li>
              </ul>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a und b DSGVO. Calendly verarbeitet Daten gemäß dem EU-US Data Privacy Framework.
              </p>
            </section>

            {/* Kontaktformulare */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Kontaktformulare und Lead-Erfassung</h2>
              <p>
                Auf unserer Website bieten wir verschiedene Formulare an, über die Sie kostenlose Inhalte anfordern können (z.&nbsp;B. KI-Report, Exit-Plan, Traumwebseite-Fallstudien). Dabei werden folgende Daten erhoben:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Vor- und Nachname</li>
                <li>E-Mail-Adresse</li>
                <li>Telefon-/WhatsApp-Nummer</li>
                <li>Zeitpunkt der Eintragung</li>
                <li>Herkunftsseite (UTM-Parameter)</li>
              </ul>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) sowie Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen). Die Daten werden zur Zustellung der angeforderten Inhalte, zur Kontaktaufnahme per E-Mail und WhatsApp sowie zur Terminvereinbarung verwendet. Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
              </p>
            </section>

            {/* Social Media und Videokonferenzen */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Social-Media-Präsenzen und Videokonferenzsystem</h2>
              <p>
                Weitere Informationen zum Datenschutz im Zusammenhang mit unseren Social-Media-Präsenzen sowie für Videokonferenzsysteme finden Sie unter dem Punkt Datenschutz auf{" "}
                <a href="https://www.bewegungsoptimierer.de/" target="_blank" rel="noopener noreferrer" className="underline text-gold hover:text-gold/80">https://www.bewegungsoptimierer.de/</a>
              </p>
            </section>

            {/* Betroffenenrechte */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Ihre Rechte als betroffene Person</h2>
              <p>
                Sie haben nach Art. 15 DSGVO das Recht, auf Antrag unentgeltlich Auskunft über die zu Ihrer Person gespeicherten personenbezogenen Daten zu erhalten. Weiterhin haben Sie bei Vorliegen der gesetzlichen Voraussetzungen ein Recht auf Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO) sowie ein Recht auf Datenübertragbarkeit (Art. 20 DSGVO).
              </p>
              <p>
                Sofern die Verarbeitung auf Art. 6 Abs. 1 lit. e oder f DSGVO beruht, steht Ihnen nach Art. 21 DSGVO ein Widerspruchsrecht zu. Beruht die Verarbeitung auf einer Einwilligung (Art. 6 Abs. 1 lit. a, Art. 9 Abs. 2 lit. a bzw. Art. 49 Abs. 1 lit. a DSGVO), können Sie die Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, ohne dass die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung berührt wird.
              </p>
              <p>
                Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: robin@bewegungsoptimierer.de
              </p>
            </section>

            {/* Aufsichtsbehörde */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Zuständige Aufsichtsbehörde</h2>
              <p>
                Bayerisches Landesamt für Datenschutzaufsicht<br />
                Postfach 1349, 91504 Ansbach<br />
                Telefon: +49 (0) 981 180093-0<br />
                Telefax: +49 (0) 981 180093-800<br />
                E-Mail: poststelle@lda.bayern.de
              </p>
            </section>

            {/* Automatisierte Entscheidungen */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Automatisierte Entscheidungen und Profiling</h2>
              <p>
                Eine ausschließlich auf einer automatisierten Verarbeitung beruhende Entscheidung, die Ihnen gegenüber rechtliche Wirkung entfaltet oder Sie in ähnlicher Weise erheblich beeinträchtigt (Art. 22 DSGVO), findet nicht statt. Soweit wir im Rahmen von Marketing- und Analysediensten (etwa Meta-Pixel, Google Ads oder A/B-Testing) Ihr Nutzungsverhalten auswerten, kann dies ein Profiling im Sinne des Art. 4 Nr. 4 DSGVO umfassen; dies erfolgt ausschließlich auf Grundlage Ihrer Einwilligung und dient der interessengerechten Ausspielung von Inhalten und Werbung.
              </p>
            </section>

            {/* Bereitstellung */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Bereitstellung Ihrer Daten</h2>
              <p>
                Soweit in den vorstehenden Abschnitten keine anderslautenden Angaben gemacht wurden, ist die Bereitstellung personenbezogener Daten weder gesetzlich noch vertraglich vorgeschrieben oder für einen Vertragsabschluss erforderlich. Die Nichtbereitstellung Ihrer Daten kann jedoch zur Folge haben, dass wir beispielsweise Ihre Anfragen nicht beantworten können.
              </p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
