import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prismaClient";

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
