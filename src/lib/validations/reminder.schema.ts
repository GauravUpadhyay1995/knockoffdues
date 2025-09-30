import Joi from 'joi';

export const createReminderSchema = Joi.object({
  vendorName: Joi.string().required(),
  senderReceiver: Joi.string().required(),
  amount: Joi.number().required(),
  vendorAddress: Joi.string().allow(''),
  billingDate: Joi.date().required(),
  reminderType: Joi.string()
    .valid( 'BEFORE_DAYS', 'WEEKLY')
    .required(),
  beforeDays: Joi.number().when('reminderType', {
    is: 'BEFORE_DAYS',
    then: Joi.number().required().min(0).max(30),
    otherwise: Joi.number().optional(),
  }),
  timeOfDay: Joi.string().required(),
  paymentStatus: Joi.string().valid('PAID', 'PENDING').optional(),
  vendorStatus: Joi.boolean().optional(),
  paymentMonth: Joi.string().optional().allow(''), // matches modal input
  description: Joi.string().optional().allow(''),
  
});



