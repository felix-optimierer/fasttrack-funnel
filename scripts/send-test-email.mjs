import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: "PhysioFreiheit <noreply@go.physiofreiheit.de>",
  to: ["felix@onboarding-prozesse.de"],
  subject: "Test-Mail: Resend Integration aktiv ✓",
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0f172a; font-size: 24px; margin: 0;">PhysioFreiheit Fast-Track</h1>
        <p style="color: #c9a227; font-size: 14px; margin-top: 4px;">E-Mail-System aktiv</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Resend-Integration erfolgreich!</h2>
        <p style="color: #475569; line-height: 1.6;">
          Diese Test-Mail bestätigt, dass die E-Mail-Integration über Resend funktioniert. 
          Ab jetzt können automatische E-Mails versendet werden, z.B.:
        </p>
        <ul style="color: #475569; line-height: 1.8;">
          <li>Wöchentliche Funnel-KPI-Reports (jeden Montag)</li>
          <li>Lead-Bestätigungen</li>
          <li>Automatische Benachrichtigungen</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Gesendet vom Fast-Track Funnel System<br>
          ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}
        </p>
      </div>
    </div>
  `,
});

if (error) {
  console.error("Fehler beim Senden:", error);
  process.exit(1);
} else {
  console.log("Test-Mail erfolgreich gesendet!");
  console.log("E-Mail-ID:", data?.id);
}
