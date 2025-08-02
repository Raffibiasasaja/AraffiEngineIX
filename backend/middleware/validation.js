const Joi = require('joi');

/**
 * Validation Middleware
 * Uses Joi for request validation
 */

/**
 * Generic validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'params', 'query')
 * @returns {Function} Middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Replace the request property with the validated value
    req[property] = value;
    next();
  };
};

/**
 * User registration validation schema
 */
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required'
    }),
  
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      'any.required': 'Password is required'
    }),
  
  role: Joi.string()
    .valid('customer', 'admin', 'owner')
    .default('customer')
    .messages({
      'any.only': 'Role must be one of: customer, admin, owner'
    })
});

/**
 * User login validation schema
 */
const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

/**
 * Menu item validation schema
 */
const menuItemSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Menu item name is required',
      'string.max': 'Menu item name cannot exceed 100 characters',
      'any.required': 'Menu item name is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  price: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.integer': 'Price must be a whole number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  
  available: Joi.boolean()
    .default(true)
});

/**
 * Order validation schema
 */
const orderSchema = Joi.object({
  tableNumber: Joi.string()
    .trim()
    .pattern(/^[1-9]\d*$/)
    .required()
    .messages({
      'string.pattern.base': 'Table number must be a positive number',
      'any.required': 'Table number is required'
    }),
  
  menu: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      'string.min': 'Menu item is required',
      'any.required': 'Menu item is required'
    }),
  
  note: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Note cannot exceed 500 characters'
    })
});

/**
 * Order update validation schema
 */
const orderUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('Pending', 'In Progress', 'Completed')
    .messages({
      'any.only': 'Status must be one of: Pending, In Progress, Completed'
    }),
  
  note: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Note cannot exceed 500 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Query parameters validation schema for orders
 */
const orderQuerySchema = Joi.object({
  status: Joi.string()
    .valid('Pending', 'In Progress', 'Completed')
    .messages({
      'any.only': 'Status must be one of: Pending, In Progress, Completed'
    }),
  
  tableNumber: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .messages({
      'string.pattern.base': 'Table number must be a positive number'
    }),
  
  menu: Joi.string()
    .trim(),
  
  startDate: Joi.date()
    .iso()
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .messages({
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'End date must be after or equal to start date'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'Page must be a whole number',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .messages({
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  sortBy: Joi.string()
    .valid('timestamp', 'tableNumber', 'menu', 'status')
    .default('timestamp')
    .messages({
      'any.only': 'Sort by must be one of: timestamp, tableNumber, menu, status'
    }),
  
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC')
    .messages({
      'any.only': 'Sort order must be either ASC or DESC'
    })
});

/**
 * Date range validation schema
 */
const dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'Start date is required'
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'End date must be after or equal to start date',
      'any.required': 'End date is required'
    })
});

/**
 * ID parameter validation schema
 */
const idParamSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.guid': 'ID must be a valid UUID',
      'any.required': 'ID is required'
    })
});

// Export validation middlewares
module.exports = {
  validate,
  
  // User validations
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  
  // Menu item validations
  validateMenuItem: validate(menuItemSchema),
  validateMenuItemUpdate: validate(menuItemSchema.fork(['name', 'price'], (schema) => schema.optional())),
  
  // Order validations
  validateOrder: validate(orderSchema),
  validateOrderUpdate: validate(orderUpdateSchema),
  validateOrderQuery: validate(orderQuerySchema, 'query'),
  
  // Parameter validations
  validateIdParam: validate(idParamSchema, 'params'),
  
  // Date range validation
  validateDateRange: validate(dateRangeSchema, 'query'),
  
  // Custom validation for table number in params
  validateTableParam: validate(
    Joi.object({
      tableNumber: Joi.string()
        .pattern(/^[1-9]\d*$/)
        .required()
        .messages({
          'string.pattern.base': 'Table number must be a positive number',
          'any.required': 'Table number is required'
        })
    }),
    'params'
  )
};