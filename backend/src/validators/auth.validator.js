import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication Validation Schemas
 * Provides server-side validation for auth endpoints
 */

// ========== AUTH SCHEMAS ==========

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be less than 20 characters',
      'any.required': 'Username is required',
    }),
  fullName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name must be less than 50 characters',
      'any.required': 'Full name is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password is too long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please enter a valid email address',
    }),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
}).or('email', 'username').messages({
  'object.missing': 'Email or username is required',
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
    }),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string()
    .min(6)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required',
    }),
});

// ========== VALIDATION MIDDLEWARE ==========

/**
 * Creates a validation middleware for the given schema
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: errorMessages.join(', '),
        errors: errorMessages,
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  validate,
};
