"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import SidebarClient from "./SidebarClient";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full grid bg-gradient-to-br from-gray-900 to-purple-900"
      style={{
        gridTemplateColumns: role ? "256px 1fr" : "1fr",
        gap: 0,
      }}
    >
      {role && <SidebarClient role={role} />}
      <main className="overflow-auto p-6">{children}</main>
    </div>
  );
}
