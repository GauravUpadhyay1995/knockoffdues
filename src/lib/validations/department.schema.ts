import Joi from "joi";

// Schema for a single department
export const singleDepartmentSchema = Joi.object({
  department: Joi.string().trim().required().messages({
    "string.empty": "Department Name cannot be empty",
    "any.required": "Department Name is required",
  }),
  isActive: Joi.boolean().optional().default(true).messages({
    "boolean.base": "isActive must be a boolean value",
  }),
});

// Wrapper schema that allows either a single object or an array of objects
export const createDepartmentSchema = Joi.alternatives().try(
  singleDepartmentSchema,
  Joi.array().items(singleDepartmentSchema).min(1)
);

