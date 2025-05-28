import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const url = req.nextUrl.pathname;
      if (url.startsWith("/dashboard/admin")) return token?.role === "ADMIN";
      if (url.startsWith("/dashboard/patient"))
        return token?.role === "PATIENT";
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
