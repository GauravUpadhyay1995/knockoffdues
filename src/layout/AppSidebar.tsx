"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { usePermissions } from "@/context/PermissionContext";
import {
  CalenderIcon,
  GroupIcon,
  ShootingStarIcon,
  FolderIcon,
  ChevronDownIcon,
  GridIcon,
  UserCircleIcon,
  DocsIcon,
  BankIcon,
  HorizontaLDots,
} from "../icons";
import SidebarWidget from "./SidebarWidget";
import { useTheme } from "@/context/ThemeContext";

/* ------------------------------------------------------------------
   SUBMENU → PERMISSION MAP (MATCHES FIREBASE KEYS)
------------------------------------------------------------------ */
const submenuPermissionMap: Record<string, { module: string; action: string }> = {
  "All Teams": { module: "team", action: "read" },
  "Add Team": { module: "team", action: "create" },

  "All Events": { module: "event", action: "read" },
  "Add Events": { module: "event", action: "create" },

  "All Links-Docs": { module: "document", action: "read" },
  "Add Links-Docs": { module: "document", action: "create" },

  "All News": { module: "news", action: "read" },
  "Add News": { module: "news", action: "create" },

  "All TRLs": { module: "trl", action: "read" },
  "Add TRL": { module: "trl", action: "create" },

  "All Galleries": { module: "gallery", action: "read" },
  "Add Gallery": { module: "gallery", action: "create" },

  "Mail Setup": { module: "settings", action: "read" },
  "Permissions": { module: "settings", action: "read" },
  "Branches": { module: "settings", action: "read" },
  "Department": { module: "department", action: "read" },
  "Roles": { module: "settings", action: "read" },
  "Company Setup": { module: "settings", action: "update" },
  "Venders": { module: "account", action: "read" },

  
};

/* ------------------------------------------------------------------
   TYPES
------------------------------------------------------------------ */
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

/* ------------------------------------------------------------------
   COMPONENT
------------------------------------------------------------------ */
const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { permissions, loading } = usePermissions();
  console.log("permissions",permissions)
  const { theme } = useTheme();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  /* ------------------------------------------------------------------
     HELPERS
  ------------------------------------------------------------------ */
  const isActive = useCallback(
    (path?: string) => path === pathname,
    [pathname]
  );

  const hasPermission = (module: string, action: string) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.includes(`${module}.${action}`);
  };

  const canShowSubmenu = (name: string) => {
    const perm = submenuPermissionMap[name];
    if (!perm) return true;
    return hasPermission(perm.module, perm.action);
  };

  /* ------------------------------------------------------------------
     NAV CONFIG
  ------------------------------------------------------------------ */
  const navItems: NavItem[] = [
    { name: "Dashboard", icon: <GridIcon />, path: "/admin" },
    { name: "Calender", icon: <CalenderIcon />, path: "/admin/calender" },

    {
      name: "Account Management",
      icon: <BankIcon />,
      subItems: [{ name: "Venders", path: "/admin/accounts/venders" }],
    },

    { name: "Employee Management", icon: <UserCircleIcon />, path: "/admin/users-list" },
    { name: "Tasks Management", icon: <FolderIcon />, path: "/admin/tasks" },

    {
      name: "Teams Management",
      icon: <GroupIcon />,
      subItems: [
        { name: "All Teams", path: "/admin/teams" },
        { name: "Add Team", path: "/admin/teams/add" },
      ],
    },

    {
      name: "Events Management",
      icon: <GroupIcon />,
      subItems: [
        { name: "All Events", path: "/admin/events" },
        { name: "Add Events", path: "/admin/events/add" },
      ],
    },

    {
      name: "Docs&Links Mgmt",
      icon: <DocsIcon />,
      subItems: [
        { name: "All Links-Docs", path: "/admin/links-docs" },
        { name: "Add Links-Docs", path: "/admin/links-docs/add" },
      ],
    },

    {
      name: "News Management",
      icon: <DocsIcon />,
      subItems: [
        { name: "All News", path: "/admin/news" },
        { name: "Add News", path: "/admin/news/add" },
      ],
    },

    {
      name: "TRL Management",
      icon: <ShootingStarIcon />,
      subItems: [
        { name: "All TRLs", path: "/admin/trl" },
        { name: "Add TRL", path: "/admin/trl/add" },
      ],
    },

    {
      name: "Gallery Management",
      icon: <FolderIcon />,
      subItems: [
        { name: "All Galleries", path: "/admin/gallery" },
        { name: "Add Gallery", path: "/admin/gallery/add" },
      ],
    },

    {
      name: "Settings",
      icon: <FolderIcon />,
      subItems: [
        { name: "Mail Setup", path: "/admin/settings/emails" },
        { name: "Permissions", path: "/admin/settings/permissions" },
        { name: "Branches", path: "/admin/settings/branches" },
        { name: "Department", path: "/admin/departments" },
        { name: "Roles", path: "/admin/settings/roles" },
        { name: "Company Setup", path: "/admin/settings/config" },
      ],
    },
  ];

  /* ------------------------------------------------------------------
     FILTER MAIN MENU (FIXED)
  ------------------------------------------------------------------ */
  const filterMenu = (nav: NavItem) => {
    if (loading) return true;

    // If submenu exists → allow if ANY submenu is allowed
    if (nav.subItems?.length) {
      return nav.subItems.some(sub => canShowSubmenu(sub.name));
    }

    const moduleMap: Record<string, string> = {
      "Dashboard": "dashboard",
      "Calender": "calender",
      "Employee Management": "employee",
      "Tasks Management": "task",
      "Account Management":"account",
      "Team Management":"team",
      "Event Management":"event",
      "Document Management":"document",
      "News Management":"news",
      "TRL Management":"trl",
      "Gallery Management":"gallery",
      "Setting Management":"setting"
    };

    const module = moduleMap[nav.name];
    if (!module) return true;

    return hasPermission(module, "read");
  };

  /* ------------------------------------------------------------------
     RENDER MENU
  ------------------------------------------------------------------ */
  return (
    <aside
      className={`z-50 fixed flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 h-screen border-r transition-all duration-300
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col overflow-y-auto no-scrollbar mt-10">
        <nav className="mb-6">
          <h2 className={`mb-4 text-xs uppercase text-gray-400 ${isExpanded || isHovered ? "text-left" : "text-center"}`}>
            {isExpanded || isHovered ? "Menu" : <HorizontaLDots />}
          </h2>

          <ul className="flex flex-col gap-4">
            {navItems.map((nav, index) => {
              if (!filterMenu(nav)) return null;

              const subItems = nav.subItems?.filter(sub => canShowSubmenu(sub.name)) || [];
              if (nav.subItems && subItems.length === 0) return null;

              return (
                <li key={nav.name}>
                  {!nav.subItems ? (
                    <Link
                      href={nav.path!}
                      className={`menu-item ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                    >
                      {nav.icon}
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => setOpenSubmenu(openSubmenu === index ? null : index)}
                        className={`menu-item ${openSubmenu === index ? "menu-item-active" : "menu-item-inactive"}`}
                      >
                        {nav.icon}
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <>
                            <span className="menu-item-text">{nav.name}</span>
                            <ChevronDownIcon className={`ml-auto transition-transform ${openSubmenu === index ? "rotate-180" : ""}`} />
                          </>
                        )}
                      </button>

                      {(isExpanded || isHovered || isMobileOpen) && openSubmenu === index && (
                        <ul className="mt-2 space-y-1 ml-9">
                          {subItems.map(sub => (
                            <li key={sub.name}>
                              <Link
                                href={sub.path}
                                className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
