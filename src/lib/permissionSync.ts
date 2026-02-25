import { getFirebaseAdmin } from "./firebaseAdmin";

export const syncRolePermissionsToFirebase = async (
    role: string,
    permissions: string[]
) => {
    const { db } = getFirebaseAdmin();

    const safeRole = role.toLowerCase();
    const REALTIME_FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "permissions_local" : "permissions";

    await db.ref(`${REALTIME_FIREBASE_DATABASE_NAME}/${safeRole}`).set({
        permissions,
        updatedAt: Date.now()
    });

    console.log("🔥 Synced to Firebase:", safeRole);
};

export const syncSuperAdminAllPermissions = async (allPermissions: string[]) => {
    const { db } = getFirebaseAdmin();
    const REALTIME_FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "permissions_local" : "permissions";

    await db.ref(`${REALTIME_FIREBASE_DATABASE_NAME}/super admin`).set({
        permissions: Array.from(new Set(allPermissions)),
        updatedAt: Date.now()
    });

    console.log("🔥 Super admin synced with all permissions.");
};
