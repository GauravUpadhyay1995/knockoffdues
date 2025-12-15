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


// ---------------------- Extract Modules ----------------------
const extractModules = (rolePermissionsList: any[]) => {
    const modules = {};

    rolePermissionsList.forEach(roleDoc => {
        (roleDoc.permissions || []).forEach((perm: string) => {
            if (!perm.includes(".")) return;

            const [moduleName] = perm.split(".");

            if (!modules[moduleName]) modules[moduleName] = [];
            if (!modules[moduleName].includes(perm)) modules[moduleName].push(perm);
        });
    });

    return modules;
};


// ------------------------------ GET ------------------------------
export const GET = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    try {
        let rolesDocs = await Permission.find().select("role permissions updatedAt");

        // Auto-seed if empty
        if (rolesDocs.length === 0) {
            await seedDefaultPermissions();
            rolesDocs = await Permission.find().select("role permissions updatedAt");
        }

        const rolePermissions = {};
        rolesDocs.forEach(doc => {
            rolePermissions[doc.role] = doc.permissions;
        });

        const modules = extractModules(rolesDocs);

        return NextResponse.json({
            success: true,
            data: {
                roles: rolesDocs.map(r => r.role),
                rolePermissions,
                modules
            }
        });

    } catch (error) {
        console.error("Get permissions error:", error);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch permissions"
        });
    }
});


// ------------------------------ DELETE ------------------------------
export const DELETE = verifyAdmin(asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    try {
        const body = await req.json();
        const role = String(body.role || "").toLowerCase().trim();

        if (!role) {
            return NextResponse.json(
                { success: false, message: "Role is required" },
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

        await db.ref("permissions").child(role).remove();

        await db.ref("permissions/global").set({
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


// ------------------------------ PUT ------------------------------
export const PUT = verifyAdmin(asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const body = await req.json();
    if (!body || typeof body !== "object") {
        return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
    }

    const roles = Object.keys(body);
    const allCollectedPermissions = new Set<string>();

    // Update each role
    for (let role of roles) {
        const perms = (body[role] || []).map((p: string) => p.toLowerCase().trim());
        const roleLower = role.toLowerCase();

        await Permission.findOneAndUpdate(
            { role: roleLower },
            { permissions: perms, updatedBy: null },
            { upsert: true, new: true }
        );

        perms.forEach(p => allCollectedPermissions.add(p));

        await syncRolePermissionsToFirebase(roleLower, perms);
    }

    // 🔥 FIX: Always rebuild from DB to keep super admin correct
    const allDocs = await Permission.find().select("permissions");
    allDocs.forEach(doc => {
        (doc.permissions || []).forEach(p => allCollectedPermissions.add(p));
    });

    await syncSuperAdminAllPermissions(Array.from(allCollectedPermissions));

    return NextResponse.json({
        success: true,
        message: "Permissions updated & synced to Firebase"
    });
}));
