"use server";

import * as LucideIcons from "lucide-react";
import React from "react";

export async function getSidebarMenus(roleId?: number) {
  // Stub - sidebarMenu model doesn't exist, use fallback menus
  if (roleId === 1) { // Admin
    return [
      { name: "Main Console",       href: "/dashboard/admin",            icon: "LayoutDashboard" },
      { name: "Manage Students",    href: "/dashboard/admin/students",    icon: "GraduationCap" },
      { name: "Manage Instructors", href: "/dashboard/admin/instructors", icon: "UserCheck" },
      { name: "Course Revenues",    href: "/dashboard/admin/revenues",    icon: "Wallet" },
      { name: "System Logs",        href: "/dashboard/admin/logs",        icon: "Activity" },
    ];
  }
  if (roleId === 2) { // Instructor
    return [
      { name: "Dashboard",   href: "/dashboard/instructor",            icon: "LayoutDashboard" },
      { name: "My Courses",  href: "/dashboard/instructor/courses",    icon: "BookOpen" },
      { name: "Students",    href: "/dashboard/instructor/students",   icon: "Users" },
      { name: "Analytics",   href: "/dashboard/instructor/analytics",  icon: "BarChart" },
      { name: "Settings",    href: "/dashboard/settings/security",     icon: "Settings" },
    ];
  }
  if (roleId === 3) { // Student
    return [
      { name: "Dashboard",   href: "/dashboard/student",              icon: "LayoutDashboard" },
      { name: "Assignments", href: "/dashboard/student/assignments",   icon: "FileText" },
      { name: "Schedule",    href: "/dashboard/student/schedule",      icon: "Calendar" },
      { name: "Recordings",  href: "/dashboard/student/recordings",    icon: "Video" },
      { name: "Resources",   href: "/dashboard/student/resources",     icon: "Download" },
      { name: "Settings",    href: "/dashboard/settings/security",     icon: "Settings" },
    ];
  }
  
  // Default for unknown role
  return [
    { name: "Dashboard",   href: "/dashboard",              icon: "LayoutDashboard" },
  ];
}
