import "./globals.css";
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { Providers } from './providers';

export const metadata = {
  title: "Hospital System",
  description: "Admin & Patient Medical Record Dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="h-full">
      <body className="h-full flex bg-gradient-to-br from-gray-900 to-purple-900">
        <Providers>
          {session?.user?.role && <Sidebar role={session.user.role} />}
          <main className="flex-1 overflow-auto">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
