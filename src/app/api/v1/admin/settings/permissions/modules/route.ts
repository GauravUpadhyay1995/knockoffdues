// const { validatePermissionUpdate, validateRole } = require('../middleware/validation');

import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Permission } from "@/models/Permissions";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { seedDefaultPermissions } from "@/lib/permissionSeeding";

// 🔥 Missing import added
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

// Firebase sync helpers
import {
    syncRolePermissionsToFirebase,
    syncSuperAdminAllPermissions
} from "@/lib/permissionSync";


// ------------------------------ DELETE (with module support) ------------------------------
export const DELETE = verifyAdmin(asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    try {
        const body = await req.json();
        const role = String(body.role || "").toLowerCase().trim();
        const moduleName = String(body.module || "").toLowerCase().trim();

        // Check if it's a module deletion request
        if (moduleName) {
            // Module deletion logic
            const allPermissionsDocs = await Permission.find();

            const modulePermissionsToRemove = [];
            const updatedDocs = [];

            allPermissionsDocs.forEach(doc => {
                const modulePerms = (doc.permissions || []).filter((perm: string) => {
                    if (perm.includes(".")) {
                        const [permModule] = perm.split(".");
                        return permModule === moduleName;
                    }
                    return false;
                });

                if (modulePerms.length > 0) {
                    modulePermissionsToRemove.push(...modulePerms);

                    const filteredPerms = doc.permissions.filter((perm: string) => {
                        if (perm.includes(".")) {
                            const [permModule] = perm.split(".");
                            return permModule !== moduleName;
                        }
                        return true;
                    });

                    doc.permissions = filteredPerms;
                    updatedDocs.push(doc);
                }
            });

            if (modulePermissionsToRemove.length === 0) {
                return NextResponse.json(
                    { success: true, message: "No permissions found for this module" },
                    { status: 200 }
                );
            }

            // Update all affected documents
            for (const doc of updatedDocs) {
                await Permission.findOneAndUpdate(
                    { role: doc.role },
                    { permissions: doc.permissions, updatedAt: new Date() },
                    { new: true }
                );

                await syncRolePermissionsToFirebase(doc.role, doc.permissions);
            }

            // Update super admin permissions
            const REALTIME_FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "permissions_local" : "permissions";

            const allDocs = await Permission.find().select(`${REALTIME_FIREBASE_DATABASE_NAME}`);
            const allPermissionsSet = new Set<string>();
            allDocs.forEach(doc => {
                (doc.permissions || []).forEach(p => allPermissionsSet.add(p));
            });

            await syncSuperAdminAllPermissions(Array.from(allPermissionsSet));

            // Firebase global update
            const { db } = getFirebaseAdmin();
            await db.ref(`${REALTIME_FIREBASE_DATABASE_NAME}/global`).set({
                updatedAt: Date.now(),
                event: "module_deleted",
                module: moduleName,
                removedPermissions: modulePermissionsToRemove
            });

            return NextResponse.json({
                success: true,
                message: `Module '${moduleName}' permissions removed from all roles`,
                data: {
                    module: moduleName,
                    removedPermissionsCount: modulePermissionsToRemove.length,
                    affectedRoles: updatedDocs.map(doc => doc.role)
                }
            });
        }

        // Original role deletion logic
        if (!role) {
            return NextResponse.json(
                { success: false, message: "Role or module is required" },
                { status: 400 }
            );
        }

        // Prevent deleting Super Admin
        if (role === "super admin") {
            return NextResponse.json(
                { success: false, message: "Super admin cannot be deleted" },
                { status: 403 }
            );
        }

        const permissionDoc = await Permission.findOne({ role });

        if (!permissionDoc) {
            return NextResponse.json(
                { success: false, message: "Role permissions not found" },
                { status: 404 }
            );
        }

        if (permissionDoc.isRemovable === false) {
            return NextResponse.json(
                { success: false, message: "This role cannot be deleted" },
                { status: 400 }
            );
        }

        const deletedDoc = await Permission.findOneAndDelete({ role });

        // Firebase Sync
        const { db } = getFirebaseAdmin();
        const REALTIME_FIREBASE_DATABASE_NAME = process.env.NEXT_PUBLIC_ENVIROMENT === "development" ? "permissions_local" : "permissions";

        await db.ref(`${REALTIME_FIREBASE_DATABASE_NAME}`).child(role).remove();

        await db.ref(`${REALTIME_FIREBASE_DATABASE_NAME}/global`).set({
            updatedAt: Date.now(),
            event: "role_deleted",
            role,
        });

        return NextResponse.json({
            success: true,
            message: "Role permissions deleted successfully",
            data: deletedDoc
        });

    } catch (error) {
        console.error("Delete permissions error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete permissions" },
            { status: 500 }
        );
    }
}));