import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { emailLayout, safeEmailText, sendEmail } from "@/lib/email";

const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true";

export const auth = betterAuth({
  appName: "TradeBridge",
  database: prismaAdapter(prisma, { provider: "mysql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      const link = `<p style="line-height:1.6">Hello ${safeEmailText(user.name || "there")},</p><p style="line-height:1.6">Please verify your email address to secure your TradeBridge account.</p><p style="margin:26px 0"><a href="${url}" style="display:inline-block;background:#fbbf24;color:#111827;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700">Verify email address</a></p><p style="font-size:13px;color:#64748b;line-height:1.6">This link expires in 1 hour. If you did not create a TradeBridge account, you can ignore this email.</p>`;
      await sendEmail({
        to: user.email,
        subject: "Verify your TradeBridge email address",
        text: `Hello ${safeEmailText(user.name || "there")}, verify your TradeBridge email address using this link: ${url}\n\nThis link expires in 1 hour.`,
        html: emailLayout("Verify your email address", link),
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "BUYER",
        input: false,
      },
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL].filter(Boolean),
});
