const nodemailer = require('nodemailer');

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ''), // strip spaces from app password
    },
  });
}

function generateEmailHtml(otp, recipientEmail) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickShow Email Verification</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f0f11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f0f11; padding: 30px 15px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="500" style="max-width: 500px; background: linear-gradient(180deg, #1a1a20 0%, #141418 100%); border: 1px solid #2a2a35; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <!-- Header -->
            <tr>
              <td style="padding: 28px 24px 16px; text-align: center; border-bottom: 1px solid #262630;">
                <div style="display: inline-block; padding: 6px 14px; background: rgba(229, 9, 20, 0.15); border: 1px solid rgba(229, 9, 20, 0.4); border-radius: 20px; color: #ff4d58; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 10px;">
                  🎬 QUICKSHOW CINEMAS
                </div>
                <h1 style="margin: 6px 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
                  Verify Your Email Address
                </h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #9ca3af;">
                  Complete your registration to start booking movie tickets
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 28px 24px; text-align: center;">
                <p style="margin: 0 0 18px; font-size: 14px; color: #d1d5db; line-height: 1.5;">
                  Use the one-time verification code below to verify your account for <strong style="color: #ffffff;">${recipientEmail}</strong>:
                </p>

                <!-- OTP Code Display -->
                <div style="display: inline-block; background: #0a0a0d; border: 2px dashed #ff3b47; border-radius: 12px; padding: 16px 32px; margin: 10px 0 20px;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ff4d58; display: block;">
                    ${otp}
                  </span>
                </div>

                <p style="margin: 0 0 6px; font-size: 13px; color: #9ca3af;">
                  ⏳ This code expires in <strong style="color: #ffffff;">10 minutes</strong>.
                </p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  If you didn't request this verification code, please ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 16px 24px; background-color: #0b0b0e; border-top: 1px solid #1f1f28; text-align: center; font-size: 11px; color: #6b7280;">
                © ${new Date().getFullYear()} QuickShow (SnapSeat). All rights reserved.<br>
                Instant, secure cinema ticket reservations.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

async function sendOtpEmail(recipientEmail, otp) {
  const normalizedEmail = String(recipientEmail).trim().toLowerCase();
  const transporter = getTransporter();

  // If no credentials configured in .env, log to console
  if (!transporter) {
    console.log('\n============================================================');
    console.log(' [QuickShow OTP Service - DEV MODE / NO SMTP CONFIGURED]');
    console.log(` Target Email : ${normalizedEmail}`);
    console.log(` OTP Code     : >>> ${otp} <<<`);
    console.log(' Expiration   : 10 minutes');
    console.log(' Tip: Configure EMAIL_USER and EMAIL_PASS in server/.env for real emails');
    console.log('============================================================\n');
    return {
      sent: true,
      mode: 'console',
      devOtp: otp,
      message: 'OTP generated and printed to server terminal (dev mode)',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"QuickShow Cinemas" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: `🎬 ${otp} is your QuickShow Verification Code`,
      text: `Your QuickShow verification code is: ${otp}. It will expire in 10 minutes.`,
      html: generateEmailHtml(otp, normalizedEmail),
    });

    console.log(`[QuickShow OTP] Email sent successfully to ${normalizedEmail}. MessageId: ${info.messageId}`);
    return {
      sent: true,
      mode: 'email',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`[QuickShow OTP] Error sending email via SMTP:`, error.message);
    // Console fallback on SMTP error so testing is not blocked
    console.log('\n============================================================');
    console.log(' [QuickShow OTP Service - SMTP FALLBACK]');
    console.log(` Target Email : ${normalizedEmail}`);
    console.log(` OTP Code     : >>> ${otp} <<<`);
    console.log(` SMTP Notice  : ${error.message}`);
    console.log('============================================================\n');

    return {
      sent: true,
      mode: 'console-fallback',
      devOtp: otp,
      warning: `Email sending failed (${error.message}). Use the OTP code shown in server terminal.`,
    };
  }
}

module.exports = {
  sendOtpEmail,
};
