import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔍 Attempting login with:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          // Cari user di db
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log("👤 User found:", user ? "Yes" : "No");
          if (user) {
            console.log("📋 User role:", user.role);
            console.log(
              "🔐 Stored password hash:",
              user.password.substring(0, 10) + "..."
            );
          }

          if (!user) {
            console.log("❌ User not found");
            return null;
          }

          // Cek pw
          const isValid = await compare(credentials.password, user.password);
          console.log("🔐 Password valid:", isValid);

          if (!isValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("✅ Login successful");
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("💥 Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // atau '/auth/login' sesuai route login Anda
    signOut: "/login", // redirect ke login setelah logout
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
