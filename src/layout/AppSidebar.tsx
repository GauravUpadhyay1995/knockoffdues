"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  // BoxCubeIcon,
  // CalenderIcon,
  // ListIcon,
  // PageIcon,
  // PieChartIcon,
  // TableIcon,
  GroupIcon,
  ShootingStarIcon,
  FolderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
  DocsIcon

} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { usePermissions } from '@/hooks/usePermissions';
import Image from "next/image";
import { useTheme } from '@/context/ThemeContext';


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  // const adminData = localStorage.getItem('admin');
  // const modulePermission = adminData?.permissions;

  const { theme } = useTheme();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { canAccess, isLoading } = usePermissions();

  // Move navItems inside so canAccess is available

  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/admin",
    },
    {
      icon: <GridIcon />,
      name: "Calender",
      path: "/admin/calender",
    },
    {
      name: "Employee Management",
      icon: <UserCircleIcon />,
      path: "/admin/users-list",
    },
    {
      name: "Tasks Management",
      icon: <FolderIcon />,
      path: "/admin/tasks",
    },
    {
      name: "Departments",
      icon: <FolderIcon />,
      path: "/admin/departments",
    },
    {
      name: "Teams Management",
      icon: <GroupIcon />,
      path: "/admin/teams",
      subItems: [
        { name: "All Teams", path: "/admin/teams", pro: false },
        { name: "Add Team", path: "/admin/teams/add", pro: false },
      ],
    },
    {
      name: "Events Management",
      icon: <GroupIcon />,
      path: "/admin/events",
      subItems: [
        { name: "All Events", path: "/admin/events", pro: false },
        { name: "Add Events", path: "/admin/events/add", pro: false },
      ],
    },
    {
      name: "Docs&Links Mgmt",
      icon: <GroupIcon />,
      path: "/admin/links-docs",
      subItems: [
        { name: "All Links-Docs", path: "/admin/links-docs", pro: false },
        { name: "Add Links-Docs", path: "/admin/links-docs/add", pro: false },
      ],
    },
    {
      name: "News Management",
      icon: <DocsIcon />,
      path: "/admin/news",
      subItems: [
        { name: "All News", path: "/admin/news", pro: false },
        { name: "Add News", path: "/admin/news/add", pro: false },
      ],
    },

    {
      name: "TRL Management",
      icon: <ShootingStarIcon />,
      path: "/admin/trl",
      subItems: [
        { name: "All TRLs", path: "/admin/trl", pro: false },
        { name: "Add TRL", path: "/admin/trl/add", pro: false },
      ],
    },
    {
      name: "Gallery Management",
      icon: <FolderIcon />,
      path: "/admin/gallery",
      subItems: [
        { name: "All Galleries", path: "/admin/gallery", pro: false },
        { name: "Add Gallery", path: "/admin/gallery/add", pro: false },
      ],
    },

  ];


  const othersItems: NavItem[] = [


    // {
    //   icon: <BoxCubeIcon />,
    //   name: "UI Elements",
    //   subItems: [
    //     { name: "Alerts", path: "/admin/alerts", pro: false },
    //     { name: "Avatar", path: "/admin/avatars", pro: false },
    //     { name: "Badge", path: "/admin/badge", pro: false },
    //     { name: "Buttons", path: "/admin/buttons", pro: false },
    //     { name: "Images", path: "/admin/images", pro: false },
    //     { name: "Videos", path: "/admin/videos", pro: false },
    //   ],
    // },
    // {
    //   icon: <PlugInIcon />,
    //   name: "Authentication",
    //   subItems: [
    //     { name: "Sign In", path: "/signin", pro: false },
    //     { name: "Sign Up", path: "/signup", pro: false },
    //   ],
    // },
  ];

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => {
    if (isLoading) {
      return (
        <ul className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <li key={i} className="animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className="flex flex-col gap-4">
        {navItems.map((nav, index) => {
          // Check if user has permission to view this menu item
          if (nav.name === "Employee Management" && !canAccess("User", "read")) return null;
          if (nav.name === "Teams Management" && !canAccess("Team", "read")) return null;
          if (nav.name === "Events Management" && !canAccess("Event", "read")) return null;
          if (nav.name === "Docs&Links Mgmt" && !canAccess("Docs & Links", "read")) return null;
          if (nav.name === "News Management" && !canAccess("New", "read")) return null;
          if (nav.name === "TRL Management" && !canAccess("TRL", "read")) return null;
          if (nav.name === "Gallery Management" && !canAccess("Gallery", "read")) return null;
          if (nav.name === "Dashboard" && !canAccess("Dashboard", "read")) return null;
          if (nav.name === "Tasks Management" && !canAccess("Task", "read")) return null;
          if (nav.name === "Departments" && !canAccess("Department", "read")) return null;


          // Filter subItems for Upload Customers permission
          let filteredSubItems = nav.subItems;

          return (
            <li key={nav.name}>
              {filteredSubItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                    } cursor-pointer ${!isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                    }`}
                >
                  <span
                    className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                        }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    href={nav.path}
                    className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                      }`}
                  >
                    <span
                      className={`${isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                        }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className={`menu-item-text`}>{nav.name}</span>
                    )}
                  </Link>
                )
              )}
              {filteredSubItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {filteredSubItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item ${isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                            }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge `}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge `}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

          );
        })}
      </ul>
    );
  };

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };
  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-4 px-4 flex items-center ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/admin" className="flex items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-400 bg-clip-text text-transparent">

                <Image className="h-24 w-24 rounded-full object-cover mt-4" src="/images/logo/logo.png" alt="Knock Off Dues Logo" width={100} height={50} priority />

              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Knock Off Dues
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>


    </aside>
  );
};

export default AppSidebar;
