"use client";

import { useSidebar } from "./SidebarContext";
import { Sidebar } from "./Sidebar";

export function SidebarWrapper() {
  const { isExpanded } = useSidebar();
  
  return (
    <div className={`hidden md:block h-screen ${isExpanded ? "w-64" : "w-16"} transition-all duration-300 border-r`}>
      <Sidebar />
    </div>
  );
} 