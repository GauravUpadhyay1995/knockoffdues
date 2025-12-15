// lib/seedPermissions.ts
import { Permission } from "@/models/Permissions";

export async function seedDefaultPermissions() {
    const defaultRoles = [
        {
            role: "super admin",
            permissions: Permission.getDefaultPermissions("super admin"),
            isRemovable: false
        },
        {
            role: "admin",
            permissions: Permission.getDefaultPermissions("admin"),
            isRemovable: false
        },
        {
            role: "hr",
            permissions: Permission.getDefaultPermissions("hr"),
            isRemovable: false
        },
        {
            role: "employee",
            permissions: Permission.getDefaultPermissions("employee"),
            isRemovable: false
        }
    ];

    const results = {
        created: [],
        updated: [],
        errors: []
    };

    for (const roleData of defaultRoles) {
        try {
            const existing = await Permission.findOne({ role: roleData.role });

            if (existing) {
                const updated = await Permission.findOneAndUpdate(
                    { role: roleData.role },
                    {
                        permissions: roleData.permissions,
                        isActive: true,
                    },
                    { new: true }
                );

                results.updated.push(updated.role);
            } else {
                const created = await Permission.create({
                    ...roleData,
                });

                results.created.push(created.role);
            }
        } catch (error: any) {
            results.errors.push({
                role: roleData.role,
                error: error.message
            });
        }
    }

    return {
        success: true,
        message: "Default roles seeded successfully",
        data: results,
        summary: {
            total: defaultRoles.length,
            created: results.created.length,
            updated: results.updated.length,
            errors: results.errors.length
        }
    };
}
