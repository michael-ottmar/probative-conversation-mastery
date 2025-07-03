import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // If trying to access a conversation page without auth
        if (req.nextUrl.pathname.startsWith("/conversation") && !token) {
          // Redirect to home with the original URL as callback
          const url = new URL("/", req.url);
          url.searchParams.set("callbackUrl", req.nextUrl.pathname);
          return false;
        }
        return true;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/conversation/:path*",
    "/api/documents/:path*",
    "/api/teams/:path*",
    "/api/todos/:path*",
    "/api/ai/:path*",
    "/api/user/:path*",
    "/api/liveblocks-auth/:path*",
  ],
};