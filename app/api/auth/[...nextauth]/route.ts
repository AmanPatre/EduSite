import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignUp: { label: "isSignUp", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const isSignUp = credentials.isSignUp === "true";

        if (isSignUp) {
          // --- SIGN UP ---
          const existing = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (existing) throw new Error("EMAIL_EXISTS");

          const hashed = await bcrypt.hash(credentials.password, 12);
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split("@")[0],
              password: hashed,
            },
          });
          return { id: user.id, email: user.email, name: user.name };
        } else {
          // --- SIGN IN ---
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !user.password) throw new Error("NO_ACCOUNT");
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) throw new Error("WRONG_PASSWORD");
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        }
      },
    }),
  ],

  // JWT required for CredentialsProvider
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = (user as any).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/", // Redirect to home if they somehow land on default page
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
