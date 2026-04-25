import nodemailer from "nodemailer";

// ── Transporter ───────────────────────────────────────────────────────────────
// Jika EMAIL_USER diset → pakai Gmail SMTP (production/real email)
// Jika tidak diset → pakai Ethereal (fake SMTP, link muncul di terminal)
async function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Gmail SMTP dengan App Password
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: Ethereal fake SMTP (untuk development tanpa email nyata)
  const testAccount = await nodemailer.createTestAccount();
  console.log("\n📧 [DEV EMAIL] Menggunakan Ethereal fake SMTP");
  console.log("   User:", testAccount.user);
  console.log("   Pass:", testAccount.pass);
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// ── Email Interface ────────────────────────────────────────────────────────────
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// ── Send Email ────────────────────────────────────────────────────────────────
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const transporter = await createTransporter();
  const from = process.env.EMAIL_FROM || "Learnify LMS <noreply@learnify.id>";

  const info = await transporter.sendMail({ from, to, subject, html });

  // Jika Ethereal, tampilkan URL preview di terminal
  if (!process.env.EMAIL_USER) {
    console.log("\n✅ [DEV EMAIL] Email terkirim (fake)!");
    console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
    console.log("   Buka URL di atas untuk melihat email\n");
  } else {
    console.log(`✅ [EMAIL] Terkirim ke: ${to}`);
  }
}

// ── Reset Password Email Template ─────────────────────────────────────────────
export function resetPasswordEmailTemplate(resetUrl: string, userName: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password — Learnify</title>
</head>
<body style="margin:0;padding:0;background:#F0F2F8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2F8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#100E2E;padding:32px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#FF6B4A;width:36px;height:36px;border-radius:10px;text-align:center;vertical-align:middle;">
                    <div style="width:16px;height:16px;background:white;border-radius:3px;transform:rotate(45deg);margin:10px auto;"></div>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                      Learnify<span style="color:#FF6B4A;">.</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0F172A;">
                Reset Password Kamu 🔐
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.6;">
                Halo <strong style="color:#0F172A;">${userName}</strong>, kami menerima permintaan untuk reset password akun Learnify kamu.
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#64748B;line-height:1.6;">
                Klik tombol di bawah untuk membuat password baru. Link ini hanya berlaku selama <strong>1 jam</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#FF6B4A;border-radius:12px;padding:14px 32px;">
                    <a href="${resetUrl}" style="color:white;font-size:15px;font-weight:700;text-decoration:none;display:block;">
                      Reset Password Sekarang →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#9A3412;line-height:1.5;">
                  ⚠️ <strong>Bukan kamu yang meminta?</strong> Abaikan email ini. Password kamu tidak akan berubah.
                </p>
              </div>

              <!-- Fallback URL -->
              <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
                Jika tombol di atas tidak berfungsi, salin dan buka link ini di browser:<br/>
                <a href="${resetUrl}" style="color:#FF6B4A;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:24px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                © 2026 Learnify LMS · Email ini dikirim secara otomatis, mohon tidak membalas.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── 2FA OTP Email Template ────────────────────────────────────────────────────
// Digunakan untuk mengirim kode OTP via email saat verifikasi 2FA
export function twoFactorOtpEmailTemplate(otp: string, userName: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Kode Verifikasi — Learnify</title>
</head>
<body style="margin:0;padding:0;background:#F0F2F8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2F8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#100E2E;padding:32px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#FF6B4A;width:36px;height:36px;border-radius:10px;text-align:center;vertical-align:middle;">
                    <div style="width:16px;height:16px;background:white;border-radius:3px;transform:rotate(45deg);margin:10px auto;"></div>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                      Learnify<span style="color:#FF6B4A;">.</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#0F172A;">
                Kode Verifikasi Login &#x1F512;
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.6;">
                Halo <strong style="color:#0F172A;">${userName}</strong>, gunakan kode di bawah untuk menyelesaikan proses login ke Learnify.
              </p>

              <!-- OTP Box -->
              <div style="background:#FFF9F8;border:2px solid #FF6B4A;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">
                  Kode Verifikasi
                </p>
                <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:0.35em;color:#FF6B4A;font-family:monospace;">
                  ${otp}
                </p>
                <p style="margin:10px 0 0;font-size:12px;color:#94A3B8;">
                  Berlaku selama <strong>10 menit</strong>
                </p>
              </div>

              <!-- Warning -->
              <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:14px 18px;margin-bottom:16px;">
                <p style="margin:0;font-size:13px;color:#9A3412;line-height:1.5;">
                  &#x26A0;&#xFE0F; <strong>Jangan bagikan kode ini</strong> kepada siapa pun, termasuk tim Learnify.
                </p>
              </div>

              <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
                Jika kamu tidak sedang login, abaikan email ini dan pertimbangkan untuk mengganti password.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:24px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                &#169; 2026 Learnify LMS &middot; Email otomatis, mohon tidak membalas.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
