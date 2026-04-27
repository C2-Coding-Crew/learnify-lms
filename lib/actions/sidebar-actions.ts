"use server";

import { db } from "@/lib/db";
import * as LucideIcons from "lucide-react";
import React from "react";

export async function getSidebarMenus(roleId?: number) {
  const menus = await db.sidebarMenu.findMany({
    where: {
      OR: [
        { roleId: null },
        { roleId: roleId }
      ],
      isDeleted: 0,
      status: 1
    },
    orderBy: { order: "asc" }
  });

  // Jika DB kosong, kembalikan default untuk Student (sebagai fallback awal)
  if (menus.length === 0 && roleId === 2) {
    return [
      { name: "Dashboard",   href: "/dashboard/student",              icon: "LayoutDashboard" },
      { name: "Assignments", href: "/dashboard/student/assignments",   icon: "FileText" },
      { name: "Schedule",    href: "/dashboard/student/schedule",      icon: "Calendar" },
      { name: "Recordings",  href: "/dashboard/student/recordings",    icon: "Video" },
      { name: "Resources",   href: "/dashboard/student/resources",     icon: "Download" },
      { name: "Settings",    href: "/dashboard/settings/security",     icon: "Settings" },
    ];
  }

  return menus;
}
