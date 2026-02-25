"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient"
import { ref, onValue } from "firebase/database";

export function useRealtimePermissions(role: string | null) {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const REALTIME_FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "permissions_local" : "permissions";
    useEffect(() => {
        if (!role) {
            setLoading(false);
            return;
        }


        const rolePath = ref(db, `${REALTIME_FIREBASE_DATABASE_NAME}/${role.toLowerCase()}`);

        // Get the full path correctly
        const fullPath = rolePath.toString();
        console.log("fullPath=", `${fullPath}`)


        const unsubscribe = onValue(
            rolePath,
            (snapshot) => {


                if (snapshot.exists()) {
                    const data = snapshot.val();

                    if (data && data.permissions) {
                        setPermissions(data.permissions);
                        setError(null);
                    } else {
                        setPermissions([]);
                        setError("No permissions property found in data");
                    }
                } else {
                    setPermissions([]);
                    setError(`No data found at path: ${fullPath}`);
                }

                setLoading(false);
            },
            (error) => {


                // Handle specific errors
                if (error.code === 'PERMISSION_DENIED') {
                    setError("Permission denied. Check Firebase database rules.");
                } else if (error.code === 'UNAVAILABLE') {
                    setError("Database unavailable. Check your internet connection.");
                } else {
                    setError(`Firebase error: ${error.message}`);
                }

                setLoading(false);
                setPermissions([]);
            }
        );

        // Add a timeout to detect if nothing happens
        const timeoutId = setTimeout(() => {
            if (loading) {
                setError("Timeout: Firebase not responding. Check connection and database rules.");
                setLoading(false);
            }
        }, 10000);

        return () => {
            console.log("Cleaning up subscription");
            clearTimeout(timeoutId);
            unsubscribe();
        };
    }, [role]);

    return { permissions, loading, error };
}