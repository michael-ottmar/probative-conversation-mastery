import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
});

// Only protect dashboard and conversation routes
export const config = {
  matcher: ["/dashboard/:path*", "/conversation/:path*"],
};