import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    role: {
        type: String,
        required: [true, "Role is required"],
        unique: true,
        trim: true,
        lowercase: true,

    },
    permissions: [{
        type: String,
        required: true,
        trim: true
    }],

    isRemovable: {
        type: Boolean,
        default: true
    },

}, {
    timestamps: true
});

// Index for better query performance
permissionSchema.index({ role: 1 });
permissionSchema.index({ isActive: 1 });

// Static method to get default permissions for a role
permissionSchema.statics.getDefaultPermissions = function (role) {
    const defaultPermissions = {
        "super admin": [
            "employee.create", "employee.read", "employee.update", "employee.delete",
            "settings.read", "settings.update", "settings.delete",

        ],
        "admin": [
            "employee.create", "employee.read", "employee.update", "employee.delete",
            "settings.read", "settings.update",
            "dashboard.view"
        ],
        "employee": [
            "employee.read", "employee.update",
            "dashboard.view"
        ],
        "hr": [
            "employee.create", "employee.read", "employee.update", "employee.delete",
            "settings.read", "settings.update", "settings.delete",
            "dashboard.view",
        ],
    };

    return defaultPermissions[role] || [];
};

export const Permission = mongoose.models.Permission || mongoose.model("Permission", permissionSchema);