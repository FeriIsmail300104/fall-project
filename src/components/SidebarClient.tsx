"use client";

import Sidebar from "./Sidebar";

export default function SidebarClient({ role }: { role: string }) {
  return (
    <div className="fixed top-0 left-0 h-full w-64 z-40 bg-white shadow-lg">
      <Sidebar role={role} />
    </div>
  );
}