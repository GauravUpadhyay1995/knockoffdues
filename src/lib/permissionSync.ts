import { getFirebaseAdmin } from "./firebaseAdmin";

export const syncRolePermissionsToFirebase = async (
    role: string,
    permissions: string[]
) => {
    const { db } = getFirebaseAdmin();

    const safeRole = role.toLowerCase();

    await db.ref(`permissions/${safeRole}`).set({
        permissions,
        updatedAt: Date.now()
    });

    console.log("🔥 Synced to Firebase:", safeRole);
};

export const syncSuperAdminAllPermissions = async (allPermissions: string[]) => {
    const { db } = getFirebaseAdmin();

    await db.ref("permissions/super admin").set({
        permissions: Array.from(new Set(allPermissions)),
        updatedAt: Date.now()
    });

    console.log("🔥 Super admin synced with all permissions.");
};
