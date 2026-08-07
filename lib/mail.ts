import nodemailer from "nodemailer";
import QRCode from "qrcode";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInvitationEmail(params: {
  to: string;
  prenom: string;
  qrPayload: string;
}) {
  const { to, prenom, qrPayload } = params;
  const qrBuffer = await QRCode.toBuffer(qrPayload, { width: 420, margin: 2 });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `🎟️ Ton pass — ${process.env.EVENT_NAME}`,
    html: `
    <div style="background:#0b0b0b;padding:40px 0;font-family:Helvetica,Arial,sans-serif;">
      <table role="presentation" width="420" align="center" style="margin:auto;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <tr>
          <td style="padding:28px 28px 0;">
            <p style="color:#c9a961;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">Pass confirmé</p>
            <h1 style="color:#fff;font-size:26px;margin:0 0 20px;font-weight:800;">${process.env.EVENT_NAME}</h1>
            <p style="color:#ddd;font-size:15px;margin:0 0 24px;">Salut ${prenom}, ta place est réservée. Montre ce QR code à l'entrée.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px;">
            <div style="border-top:2px dashed #333;position:relative;"></div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 28px;">
            <div style="background:#fff;padding:16px;border-radius:12px;display:inline-block;">
              <img src="cid:qrcode" width="220" height="220" alt="QR code" style="display:block;" />
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px;">
            <div style="border-top:2px dashed #333;"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 32px;">
            <table width="100%">
              <tr>
                <td style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:2px;padding-bottom:4px;">Date</td>
              </tr>
              <tr>
                <td style="color:#fff;font-size:15px;font-weight:600;padding-bottom:14px;">${process.env.EVENT_DATE} — ${process.env.EVENT_TIME}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:2px;padding-bottom:4px;">Lieu</td>
              </tr>
              <tr>
                <td style="color:#fff;font-size:15px;font-weight:600;padding-bottom:8px;">${process.env.EVENT_LOCATION}</td>
              </tr>
              <tr>
                <td><a style="color:#c9a961;font-size:13px;">Voir l'itinéraire : Il ${process.env.EVENT_MAP_LINK}</a></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="text-align:center;color:#555;font-size:11px;margin-top:16px;">Pass personnel et unique — non transférable.</p>
    </div>
    `,
    attachments: [{ filename: "pass.png", content: qrBuffer, cid: "qrcode" }],
  });
}

/**
 * Prévient l'admin qu'une nouvelle demande de pass attend une validation.
 * Envoyé à ADMIN_EMAIL dès qu'un visiteur remplit le formulaire.
 */
export async function sendAdminNewRequestEmail(params: {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}) {
  const { nom, prenom, email, telephone } = params;
  const adminEmail = process.env.ADMIN_EMAIL || 'nogeproductions@gmail.com';
  if (!adminEmail) {
    console.warn(
      "ADMIN_EMAIL non défini — impossible d'envoyer la notification de nouvelle demande."
    );
    return;
  }

  const adminUrl = `${process.env.APP_URL || "https://after-festichill.lrpc.app"}/admin`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: `🔔 Nouvelle demande de pass — ${prenom} ${nom}`,
    html: `
    <div style="background:#0b0b0b;padding:40px 0;font-family:Helvetica,Arial,sans-serif;">
      <table role="presentation" width="440" align="center" style="margin:auto;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <tr>
          <td style="padding:28px 28px 0;">
            <p style="color:#c9a961;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">Validation requise</p>
            <h1 style="color:#fff;font-size:24px;margin:0 0 20px;font-weight:800;">${process.env.EVENT_NAME}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 20px;">
            <table width="100%" style="color:#ddd;font-size:14px;">
              <tr><td style="color:#888;padding-bottom:2px;">Nom</td></tr>
              <tr><td style="color:#fff;font-weight:600;padding-bottom:12px;">${prenom} ${nom}</td></tr>
              <tr><td style="color:#888;padding-bottom:2px;">Email</td></tr>
              <tr><td style="color:#fff;font-weight:600;padding-bottom:12px;">${email}</td></tr>
              <tr><td style="color:#888;padding-bottom:2px;">Téléphone</td></tr>
              <tr><td style="color:#fff;font-weight:600;padding-bottom:20px;">${telephone}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 28px 32px;">
            <a href="${adminUrl}" style="display:inline-block;background:#c9a961;color:#0b0b0b;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;">
              Valider la demande
            </a>
          </td>
        </tr>
      </table>
    </div>
    `,
  });
}

/**
 * Prévient poliment l'invité·e que sa demande de pass a été refusée.
 */
export async function sendRejectionEmail(params: { to: string; prenom: string }) {
  const { to, prenom } = params;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `À propos de ta demande — ${process.env.EVENT_NAME}`,
    html: `
    <div style="background:#0b0b0b;padding:40px 0;font-family:Helvetica,Arial,sans-serif;">
      <table role="presentation" width="420" align="center" style="margin:auto;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <tr>
          <td style="padding:28px;">
            <p style="color:#c9a961;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">${process.env.EVENT_NAME}</p>
            <h1 style="color:#fff;font-size:24px;margin:0 0 16px;font-weight:800;">Demande non retenue</h1>
            <p style="color:#ddd;font-size:15px;line-height:1.6;margin:0 0 8px;">
              Salut ${prenom}, malheureusement nous ne pouvons pas confirmer ta place pour cette soirée — les places sont limitées.
            </p>
            <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
              On espère te voir sur un prochain événement Festichill !
            </p>
          </td>
        </tr>
      </table>
    </div>
    `,
  });
}
