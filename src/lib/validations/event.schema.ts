import Joi from 'joi';

export const createEventSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  venue: Joi.string().required().trim(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      mimetype: Joi.string().required(),
      size: Joi.number().required(),
      _id: Joi.string().optional(), // Mongoose will add _id automatically
    })
  ).optional(),
});



export const updateEventSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  venue: Joi.string().trim().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
  isActive: Joi.boolean().optional(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      mimetype: Joi.string().required(),
      size: Joi.number().required(),
      _id: Joi.string().optional(),
    })
  ).optional(),
});
