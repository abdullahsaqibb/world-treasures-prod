import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAuthorizedAdminId } from "@/lib/admin-config";
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub({ issuer: "https://github.com/login/oauth" })],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ account, profile }) { return account?.provider === "github" && !!profile && isAuthorizedAdminId(String(profile.id)); },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile?.id !== undefined) token.githubId=String(profile.id);
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = String(token.githubId ?? "");
      return session;
    }
  },
  pages: { signIn: "/admin/login" }
});
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !isAuthorizedAdminId(session.user.id)) throw new Error("Unauthorized");
  return session;
}
