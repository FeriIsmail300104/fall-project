"use client";

import Sidebar from "./Sidebar";

export default function SidebarClient({ role }: { role: string }) {
  return (
    <div className="h-full w-64 flex-shrink-0 bg-white">
      <Sidebar role={role} />
    </div>
  );
}
