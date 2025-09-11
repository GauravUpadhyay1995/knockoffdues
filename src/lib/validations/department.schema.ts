// lib/validations/user.schema.ts
import Joi from 'joi';

export const createDepartmentSchema = Joi.object({

    department: Joi.string().required().messages({
         'string.empty': 'Department Name cannot be empty',
    'any.required': 'Department Name is required'
    }),
    isActive: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'isActive must be a boolean value'
    }),

});
