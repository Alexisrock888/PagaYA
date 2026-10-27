const nodemailer = require("nodemailer");

function smtpConfigured() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

async function sendPasswordResetEmail(email, nombre, token) {
    if (!smtpConfigured()) return false;

    const secure = process.env.SMTP_SECURE === "true";
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
    });

    const baseUrl = String(process.env.FRONTEND_URL || "http://localhost:5173").replace(/#.*$/, "").replace(/\/$/, "");
    const resetUrl = `${baseUrl}/#/restablecer-clave?token=${encodeURIComponent(token)}`;
    const recipientName = nombre ? String(nombre) : "usuario";
    const subject = "Restablece tu contraseña de PagaYA";
    const text = `Hola ${recipientName},\n\nSolicitamos restablecer la contraseña de tu cuenta PagaYA. Abre este enlace dentro de los próximos 30 minutos:\n${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo.`;
    const html = `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033"><div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e6ebf2;border-radius:12px;padding:32px"><strong style="font-size:22px;color:#087f5b">PagaYA</strong><h1 style="font-size:22px;margin-top:24px">Restablecer contraseña</h1><p>Hola ${recipientName.replace(/[<>]/g, "")},</p><p>Solicitamos restablecer la contraseña de tu cuenta. El enlace estará disponible durante 30 minutos.</p><p><a href="${resetUrl}" style="display:inline-block;background:#087f5b;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Restablecer contraseña</a></p><p style="font-size:13px;color:#667085">Si no solicitaste este cambio, puedes ignorar este correo.</p></div></body></html>`;

    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject,
        text,
        html
    });
    return true;
}

module.exports = { smtpConfigured, sendPasswordResetEmail };
