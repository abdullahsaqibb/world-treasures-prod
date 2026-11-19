import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
const allowed = () => new Set((process.env.ADMIN_GITHUB_IDS ?? "").split(",").map(s=>s.trim()).filter(Boolean));
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ account, profile }) { return account?.provider === "github" && !!profile && allowed().has(String(profile.id)); },
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
  if (!session?.user?.id || !allowed().has(session.user.id)) throw new Error("Unauthorized");
  return session;
}
