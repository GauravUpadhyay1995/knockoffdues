import Joi from 'joi';

export const createTaskSchema = Joi.object({
    taskName: Joi.string().required(),
    description: Joi.string().allow(''),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    assignedTo: Joi.array().items(Joi.string().hex().length(24)).optional(),
    assignedBy: Joi.string().required(),
    priority: Joi.string().valid('Low', 'Medium', 'High').required(),
    stage: Joi.string().valid('Pending', 'InProgress', 'Completed').required(),
    isActive: Joi.boolean().default(true),
    createdBy: Joi.string().required(),
    updatedBy: Joi.string().optional(),
}).options({ abortEarly: false });