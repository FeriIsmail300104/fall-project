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
    <>
      {/* Render sidebar jika ada role */}
      {role && <SidebarClient role={role} />}

      <main
        className={`transition-all duration-300 p-6 ${role ? "md:ml-64" : ""}`}
      >
        {children}
      </main>
    </>
  );
}
