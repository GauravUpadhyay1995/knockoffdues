"use client";
import React, { useState, useEffect } from 'react';

import PermissionSetting from "@/components/permission/PermissionSetting";
import PageLoader from '@/components/ui/loading/PageLoader';
export default function PermissionPage() {
    const [Roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modules, setModules] = useState({});
    const [rolePermissions, setRolePermissions] = useState({});

    const fetchRoles = async () => {
        try {

            const [rolesRes,permissionsRes] = await Promise.all([
                 fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/active-list`, { credentials: "include" }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/permissions`, { credentials: 'include' }),
                //  fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/permissions/seeds`, {
                //     method: "POST",
                //     credentials: "include",
                //     headers: {
                //         "Content-Type": "application/json"
                //     },
                //     body: JSON.stringify({})
                // })
            ]);

            const [rolesResult,permissionsResult] = await Promise.all([
                 rolesRes.json(),
                permissionsRes.json()
            ]);
            if (permissionsResult.success && permissionsResult.data) {
                setRoles(rolesResult.data.roles.filter((role: any) => role.role !== 'super admin').map(role => role.role));
                setModules(permissionsResult.data.modules);
                setRolePermissions(permissionsResult.data.rolePermissions);
                setIsLoading(false);
            }

            // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/active-list`, {
            //     credentials: 'include',
            // });

            // if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`);

            // const data = await res.json();
            // setRoles(data.data.roles.filter((role: any) => role.role !== 'super admin').map(role => role.role));
            // setIsLoading(false);

        } catch (err) {
            setIsLoading(false);
            console.error('Fetch settings failed', err);
        } finally {

        }
    };
    useEffect(() => {
        fetchRoles();
    }, []);
    //   const roles = ["admin", "employee", "hr"];
    const roles = Roles;
   
    // const modules = {
    //     "dashboard": ["dashboard.view"],
    //     "employee management": ["employee.view", "employee.add", "employee.edit", "employee.delete"],
    //     "gallery management": ["gallery.view", "gallery.add", "gallery.edit", "gallery.delete"],
    //     "setting": ["setting.view", "setting.add", "setting.edit", "setting.delete"]
    // };

    // const rolePermissions = {
    //     admin: ["dashboard.view", "dashboard.edit", "employee.manage", "gallery.view", "gallery.add"],
    //     employee: ["dashboard.view", "gallery.view"],
    //     hr: ["employee.view"],
    //     lead: ["employee.view"]
    // };

    return (<>
        {
            isLoading ? <PageLoader /> : <PermissionSetting
                roles={roles}
                modules={modules}
                rolePermissions={rolePermissions}
            />
        }
    </>);
}


