import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if user is authenticated
        return !!token;
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