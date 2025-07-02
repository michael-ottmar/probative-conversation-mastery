import { auth } from "@/auth";

export default auth((req) => {
  // req.auth is the session
});

export const config = {
  matcher: ["/dashboard/:path*", "/conversation/:path*"],
};