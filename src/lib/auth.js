
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  appName: "TradeBridge",

  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
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

  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
  ],
});
