import User from "@/app/models/userModel";
import { connectDB } from "@/app/utils/connect";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

async function login(credentials) {
  try {
    connectDB();
    const user = await User.findOne({ email: credentials.email });
    if (!user) throw new Error("Wrong Credentials.");
    const isCorrect = await bcrypt.compare(credentials.password, user.password);
    if (!isCorrect) throw new Error("Wrong Credentials.");
    return user;
  } catch (error) {
    console.log("error while logging in", error);
    throw new Error("Something went wrong.");
  }
}

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials, req) {
        try {
          const user = await login(credentials);
          console.log(credentials);
          return user;
          // console.log("user:", user);
        } catch (error) {
          console.log("Failed to login. ", error);
        }
      },
    }),
  ],

  callbacks: {
    // Put the user info in to the token
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.id = user.id;
      }
      return token;
    },
    // Put the token info in to the session
    async session({ session, token }) {
      if (token) {
        session.user.email = token.email;
        session.user.id = token.id;
      }
      console.log("session: ", session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
