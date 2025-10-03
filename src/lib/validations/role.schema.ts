import Joi from "joi";

// Schema for a single department
export const singleRoleSchema = Joi.object({
    role: Joi.string().trim().required().messages({
        "string.empty": "Role Name cannot be empty",
        "any.required": "Role Name is required",
    }),
    isActive: Joi.boolean().optional().default(true).messages({
        "boolean.base": "isActive must be a boolean value",
    }),
});

// Wrapper schema that allows either a single object or an array of objects
export const createRoleSchema = Joi.alternatives().try(
    singleRoleSchema,
    Joi.array().items(singleRoleSchema).min(1)
);

