/**
 * Zentrale SEO-Konfiguration für alle Seiten.
 * Jede Seite hat einen individuellen Titel und eine Meta-Beschreibung.
 */

const BASE_URL = "https://go.physiofreiheit.de";
const BRAND = "Physio Freiheit";

export interface PageSEO {
  title: string;
  description: string;
  canonical: string;
}

export const SEO_CONFIG: Record<string, PageSEO> = {
  home: {
    title: `Kostenlose Inhalte für Physiotherapie-Praxisinhaber | ${BRAND}`,
    description:
      "Sichere dir kostenlose Inhalte von Physio Freiheit: KI-Report 2026, Exit-Plan und Traumwebseite-Anleitung für Physiotherapie-Praxisinhaber. Doppelt TÜV-zertifiziert.",
    canonical: `${BASE_URL}/`,
  },
  traumwebseite: {
    title: `Traumwebseite in 60 Minuten per KI-Agent | ${BRAND}`,
    description:
      "Als Praxisinhaber deine DSGVO-konforme Praxis-Webseite in unter 60 Minuten per KI-Agent bauen lassen – ohne Technikkenntnisse, ohne Agentur, ohne Baukasten. Über 100x bewiesen.",
    canonical: `${BASE_URL}/traumwebseite`,
  },
  anleitung: {
    title: `9 Fallstudien: Praxis-Webseite per KI-Agent | ${BRAND}`,
    description:
      "Sieh dir 9 echte Fallstudien an, wie Physiotherapie-Praxen ihre Webseite in unter 60 Minuten per KI-Agent erstellt haben. Schritt-für-Schritt-Anleitung inklusive.",
    canonical: `${BASE_URL}/anleitung`,
  },
  kiReport: {
    title: `Der Physiopraxis KI-Report 2026 – Kostenlos | ${BRAND}`,
    description:
      "Die 3 KI-Strategien, die deine Praxis 2026 revolutionieren. Die 5 fatalsten Fehler, die 90% aller Physiopraxen machen. Jetzt kostenlos sichern.",
    canonical: `${BASE_URL}/ki-report`,
  },
  exitPlan: {
    title: `Der 5-Schritte Exit-Plan für Praxisinhaber | ${BRAND}`,
    description:
      "Der exakte Plan, mit dem über 100 Praxisinhaber ihre Behandlungszeit reduziert und mehr Gewinn auf dem Konto haben. Jetzt kostenlos sichern.",
    canonical: `${BASE_URL}/exit-plan`,
  },
  webseiteTermin: {
    title: `Kostenlose KI-Praxisanalyse buchen | ${BRAND}`,
    description:
      "Sichere dir deine kostenlose 1:1-KI-Praxisanalyse mit einem Physio-Freiheit-Experten. Erfahre, wie du deine Praxis mit KI auf das nächste Level bringst.",
    canonical: `${BASE_URL}/webseite-termin`,
  },
  kiReportTermin: {
    title: `1:1-Praxisanalyse nach KI-Report | ${BRAND}`,
    description:
      "Dein KI-Report ist auf dem Weg. Sichere dir jetzt deine kostenlose 1:1-Praxisanalyse und erfahre, wie du die KI-Strategien in deiner Praxis umsetzt.",
    canonical: `${BASE_URL}/ki-report-termin`,
  },
  exitPlanTermin: {
    title: `1:1-Praxisanalyse nach Exit-Plan | ${BRAND}`,
    description:
      "Dein Exit-Plan ist auf dem Weg. Sichere dir jetzt deine kostenlose 1:1-Praxisanalyse und erfahre, wie du den Exit-Plan in deiner Praxis umsetzt.",
    canonical: `${BASE_URL}/exit-plan-termin`,
  },
  dankeTermin: {
    title: `Termin bestätigt – Nächste Schritte | ${BRAND}`,
    description:
      "Dein Termin ist gebucht. Hier findest du die nächsten Schritte zur Vorbereitung auf deine 1:1-Praxisanalyse mit Physio Freiheit.",
    canonical: `${BASE_URL}/danke-termin`,
  },
  notFound: {
    title: `Seite nicht gefunden | ${BRAND}`,
    description:
      "Diese Seite existiert nicht. Kehre zur Startseite zurück und entdecke kostenlose Inhalte für Physiotherapie-Praxisinhaber.",
    canonical: `${BASE_URL}/`,
  },
};
