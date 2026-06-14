import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prismaClient";
import { createAuthMiddleware, APIError } from "better-auth/api";

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "Kata sandi harus minimal 8 karakter. / Password must be at least 8 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Kata sandi harus mengandung minimal satu huruf besar (A-Z). / Password must contain at least one uppercase letter (A-Z)." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Kata sandi harus mengandung minimal satu angka (0-9). / Password must contain at least one number (0-9)." };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, message: "Kata sandi harus mengandung minimal satu simbol/karakter khusus (misal: @, #, $, !). / Password must contain at least one symbol/special character." };
  }
  return { isValid: true, message: "" };
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "fallback-dev-secret-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3000}`,
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : []),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const { password } = ctx.body || {};
        if (password) {
          const check = validatePassword(password);
          if (!check.isValid) {
            throw new APIError("BAD_REQUEST", { message: check.message });
          }
        }
      }
      if (ctx.path === "/reset-password") {
        const { newPassword } = ctx.body || {};
        if (newPassword) {
          const check = validatePassword(newPassword);
          if (!check.isValid) {
            throw new APIError("BAD_REQUEST", { message: check.message });
          }
        }
      }
    }),
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: process.env.SESSION_EXPIRES_IN
      ? parseInt(process.env.SESSION_EXPIRES_IN, 10)
      : 1800,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT || "587";
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || '"PRDfy" <noreply@prdfy.space>';

      if (smtpHost && smtpUser && smtpPass) {
        try {
          const nodemailer = require("nodemailer");
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort, 10),
            secure: smtpPort === "465",
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          await transporter.sendMail({
            from: smtpFrom,
            to: user.email,
            subject: "Reset Kata Sandi Anda - PRDfy",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px; max-width: 560px; margin: 0 auto; background-color: #ffffff; color: #18181b;">
                <!-- Logo Header -->
                <div style="margin-bottom: 24px; text-align: left;">
                  <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #09090b; font-family: sans-serif;">PRD<span style="color: #a1a1aa;">fy</span></span>
                </div>
                
                <!-- Main Card -->
                <div style="border: 1px solid #e4e4e7; border-radius: 16px; padding: 32px; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.01);">
                  <!-- Indonesian Section -->
                  <h2 style="color: #09090b; font-size: 18px; font-weight: 750; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.01em;">Permintaan Atur Ulang Kata Sandi</h2>
                  <p style="font-size: 13px; line-height: 22px; color: #27272a; margin-top: 0; margin-bottom: 20px;">
                    Halo <strong>${user.name}</strong>, kami menerima permintaan untuk mengatur ulang kata sandi akun <strong>PRDfy</strong> Anda. Silakan klik tombol di bawah ini untuk membuat kata sandi baru.
                  </p>

                  <hr style="border: 0; border-top: 1px dashed #e4e4e7; margin: 20px 0;" />

                  <!-- English Section -->
                  <h2 style="color: #71717a; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.01em;">Password Reset Request</h2>
                  <p style="font-size: 13px; line-height: 22px; color: #52525b; margin-top: 0; margin-bottom: 20px;">
                    Hello <strong>${user.name}</strong>, we received a request to reset your <strong>PRDfy</strong> account password. Please click the button below to set a new password.
                  </p>
                  
                  <!-- CTA Button -->
                  <div style="margin: 28px 0; text-align: center;">
                    <a href="${url}" style="background-color: #18181b; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; display: inline-block;">
                      Reset Kata Sandi / Reset Password
                    </a>
                  </div>
                  
                  <!-- Fallback Link -->
                  <p style="font-size: 11px; line-height: 18px; color: #71717a; margin-top: 24px; margin-bottom: 0;">
                    Jika tombol di atas tidak berfungsi, salin link berikut ke browser Anda:<br/>
                    <span style="color: #a1a1aa; font-style: italic;">If the button above does not work, copy the link below to your browser:</span>
                  </p>
                  <p style="font-size: 11px; line-height: 18px; color: #09090b; word-break: break-all; margin-top: 8px; margin-bottom: 0; font-family: monospace; background-color: #f4f4f5; padding: 10px; border-radius: 8px; border: 1px solid #e4e4e7;">
                    ${url}
                  </p>
                </div>

                <!-- Footer -->
                <div style="margin-top: 28px; text-align: center; font-size: 11px; color: #a1a1aa; line-height: 18px;">
                  <p style="margin: 0 0 4px 0;">Email ini dikirim secara otomatis oleh sistem PRDfy. / This is an automated email from PRDfy.</p>
                  <p style="margin: 0;">Jika Anda tidak meminta reset kata sandi, abaikan email ini. / If you did not request a password reset, please ignore this email.</p>
                </div>
              </div>
            `,
          });
          console.log(`[Email] Password reset email sent to ${user.email} via SMTP`);
        } catch (error) {
          console.error("Failed to send password reset email:", error);
        }
      } else {
        console.log(`\n==================================================`);
        console.log(`[LOCAL DEV] PASSWORD RESET LINK FOR ${user.email}:`);
        console.log(url);
        console.log(`==================================================\n`);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT || "587";
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || '"PRDfy" <noreply@prdfy.space>';

      if (smtpHost && smtpUser && smtpPass) {
        try {
          const nodemailer = require("nodemailer");
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort, 10),
            secure: smtpPort === "465",
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          await transporter.sendMail({
            from: smtpFrom,
            to: user.email,
            subject: "Verifikasi Email Anda - PRDfy",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px; max-width: 560px; margin: 0 auto; background-color: #ffffff; color: #18181b;">
                <!-- Logo Header -->
                <div style="margin-bottom: 24px; text-align: left;">
                  <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #09090b; font-family: sans-serif;">PRD<span style="color: #a1a1aa;">fy</span></span>
                </div>
                
                <!-- Main Card -->
                <div style="border: 1px solid #e4e4e7; border-radius: 16px; padding: 32px; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.01);">
                  <!-- Indonesian Section -->
                  <h2 style="color: #09090b; font-size: 18px; font-weight: 750; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.01em;">Verifikasi Akun Anda</h2>
                  <p style="font-size: 13px; line-height: 22px; color: #27272a; margin-top: 0; margin-bottom: 20px;">
                    Halo <strong>${user.name}</strong>, terima kasih telah mendaftar di <strong>PRDfy</strong>. Silakan verifikasi alamat email Anda untuk mengaktifkan akun dan mengakses Workspace pembuatan dokumen PRD Anda.
                  </p>

                  <hr style="border: 0; border-top: 1px dashed #e4e4e7; margin: 20px 0;" />

                  <!-- English Section -->
                  <h2 style="color: #71717a; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.01em;">Verify Your Account</h2>
                  <p style="font-size: 13px; line-height: 22px; color: #52525b; margin-top: 0; margin-bottom: 20px;">
                    Hello <strong>${user.name}</strong>, thank you for registering at <strong>PRDfy</strong>. Please verify your email address to activate your account and access your PRD document workspace.
                  </p>
                  
                  <!-- CTA Button -->
                  <div style="margin: 28px 0; text-align: center;">
                    <a href="${url}" style="background-color: #18181b; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; display: inline-block;">
                      Verifikasi / Verify
                    </a>
                  </div>
                  
                  <!-- Fallback Link -->
                  <p style="font-size: 11px; line-height: 18px; color: #71717a; margin-top: 24px; margin-bottom: 0;">
                    Jika tombol di atas tidak berfungsi, salin link berikut ke browser Anda:<br/>
                    <span style="color: #a1a1aa; font-style: italic;">If the button above does not work, copy the link below to your browser:</span>
                  </p>
                  <p style="font-size: 11px; line-height: 18px; color: #09090b; word-break: break-all; margin-top: 8px; margin-bottom: 0; font-family: monospace; background-color: #f4f4f5; padding: 10px; border-radius: 8px; border: 1px solid #e4e4e7;">
                    ${url}
                  </p>
                </div>

                <!-- Footer -->
                <div style="margin-top: 28px; text-align: center; font-size: 11px; color: #a1a1aa; line-height: 18px;">
                  <p style="margin: 0 0 4px 0;">Email ini dikirim secara otomatis oleh sistem PRDfy. / This is an automated email from PRDfy.</p>
                  <p style="margin: 0;">Jika Anda tidak merasa mendaftar, abaikan email ini. / If you did not sign up, please ignore this email.</p>
                </div>
              </div>
            `,
          });
          console.log(`[Email] Verification email sent to ${user.email} via SMTP`);
        } catch (error) {
          console.error("Failed to send verification email:", error);
        }
      } else {
        console.log(`\n==================================================`);
        console.log(`[LOCAL DEV] EMAIL VERIFICATION LINK FOR ${user.email}:`);
        console.log(url);
        console.log(`==================================================\n`);
      }
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
      : {}),
  },
  user: {
    additionalFields: {
      tier: {
        type: "string",
        required: false,
        defaultValue: "free",
      },
    },
  },
});
