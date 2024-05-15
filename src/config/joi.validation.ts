import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  MONGODB: Joi.required(),
  PORT: Joi.number().default(3005),
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().default(3309),
  MYSQL_USERNAME: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string().required(),
});
