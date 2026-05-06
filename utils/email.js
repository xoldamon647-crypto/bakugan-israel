const nodemailer = require('nodemailer');

const SITE_URL = process.env.SITE_URL || 'https://bakugan-israel-production-9e68.up.railway.app';
const FROM = process.env.SMTP_FROM || '"בקוגן ישראל 🌀" <noreply@bakugan-israel.com>';

let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function send(to, subject, html) {
  if (!transporter) return;
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (e) {
    console.error('[email] failed:', e.message);
  }
}

function sendWelcome(to, username) {
  return send(to, 'ברוך הבא לבקוגן ישראל! 🌀', `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;background:#0D0D22;color:#EEEEF8;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#FF4500,#CC3300);padding:2rem;text-align:center">
        <div style="font-size:3rem">🌀</div>
        <h1 style="margin:0.5rem 0;font-size:1.6rem">ברוך הבא, ${username}!</h1>
        <p style="margin:0;opacity:0.85">הצטרפת רשמית לקהילת בקוגן ישראל</p>
      </div>
      <div style="padding:2rem">
        <p>שלום ${username},</p>
        <p>אנחנו שמחים שהצטרפת! עכשיו אתה חלק מקהילת בקוגן הישראלית.</p>
        <h3>מה אפשר לעשות?</h3>
        <ul>
          <li>🏆 הירשם לטורנירים ואירועים</li>
          <li>💬 השתתף בפורומים</li>
          <li>📖 גלה את ויקי הבקוגן</li>
          <li>🎬 צפה בכל פרקי הסדרה</li>
        </ul>
        <div style="text-align:center;margin-top:2rem">
          <a href="${SITE_URL}" style="background:linear-gradient(135deg,#FF6600,#CC3300);color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700">כנסו לאתר</a>
        </div>
      </div>
      <div style="padding:1rem;text-align:center;opacity:0.5;font-size:0.8rem;border-top:1px solid rgba(255,255,255,0.1)">
        © 2026 בקוגן ישראל
      </div>
    </div>
  `);
}

function sendPasswordReset(to, token) {
  const link = `${SITE_URL}/reset-password?token=${token}`;
  return send(to, 'איפוס סיסמה – בקוגן ישראל', `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;background:#0D0D22;color:#EEEEF8;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#FF4500,#CC3300);padding:2rem;text-align:center">
        <div style="font-size:3rem">🔑</div>
        <h1 style="margin:0.5rem 0;font-size:1.6rem">איפוס סיסמה</h1>
      </div>
      <div style="padding:2rem">
        <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
        <p>לחץ על הכפתור למטה כדי לאפס את הסיסמה. הקישור תקף לשעה אחת.</p>
        <div style="text-align:center;margin:2rem 0">
          <a href="${link}" style="background:linear-gradient(135deg,#FF6600,#CC3300);color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700">אפס סיסמה</a>
        </div>
        <p style="font-size:0.82rem;opacity:0.6">אם לא ביקשת איפוס סיסמה, התעלם מהמייל הזה. הסיסמה שלך לא תשתנה.</p>
        <p style="font-size:0.78rem;opacity:0.5;word-break:break-all">קישור: ${link}</p>
      </div>
    </div>
  `);
}

module.exports = { sendWelcome, sendPasswordReset };
