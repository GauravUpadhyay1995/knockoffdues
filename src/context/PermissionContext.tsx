"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRealtimePermissions } from "@/hooks/useRealtimePermissions";
import { useAuth } from "@/context/AuthContext"; // your existing auth context

const PermissionContext = createContext({
  permissions: [] as string[],
  loading: true
});

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const { admin } = useAuth();  
  const user= admin;
  const role = user?.role || null;
  console.log("LoggedIn user Role",role)
  const { permissions, loading } = useRealtimePermissions(role);
  

  return (
    <PermissionContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
