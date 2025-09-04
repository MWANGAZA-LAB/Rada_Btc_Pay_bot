import Joi from 'joi';
import { config } from '../config';
import { ServiceType, PaymentData } from '../types';

export const phoneNumberSchema = Joi.string()
  .pattern(config.validation.phoneNumberRegex)
  .required()
  .messages({
    'string.pattern.base': 'Please enter a valid Kenyan phone number (e.g., 0712345678)',
    'any.required': 'Phone number is required',
  });

export const amountSchema = Joi.number()
  .min(config.validation.minAmount)
  .max(config.validation.maxAmount)
  .required()
  .messages({
    'number.min': `Minimum amount is KES ${config.validation.minAmount}`,
    'number.max': `Maximum amount is KES ${config.validation.maxAmount}`,
    'any.required': 'Amount is required',
  });

export const paybillSchema = Joi.string()
  .pattern(config.validation.paybillRegex)
  .required()
  .messages({
    'string.pattern.base': 'Please enter a valid paybill number (5-7 digits)',
    'any.required': 'Paybill number is required',
  });

export const tillSchema = Joi.string()
  .pattern(config.validation.tillRegex)
  .required()
  .messages({
    'string.pattern.base': 'Please enter a valid till number (5-7 digits)',
    'any.required': 'Till number is required',
  });

export const accountNumberSchema = Joi.string()
  .min(1)
  .max(20)
  .required()
  .messages({
    'string.min': 'Account number cannot be empty',
    'string.max': 'Account number is too long',
    'any.required': 'Account number is required',
  });

export const serviceTypeSchema = Joi.string()
  .valid('airtime', 'paybill', 'goods', 'send_money', 'pochi', 'qr_scan')
  .required();

export const validationSchemas = {
  airtime: Joi.object({
    phoneNumber: phoneNumberSchema,
    amount: amountSchema,
  }),
  
  paybill: Joi.object({
    paybillNumber: paybillSchema,
    accountNumber: accountNumberSchema,
    amount: amountSchema,
  }),
  
  goods: Joi.object({
    tillNumber: tillSchema,
    amount: amountSchema,
  }),
  
  send_money: Joi.object({
    phoneNumber: phoneNumberSchema,
    amount: amountSchema,
  }),
  
  pochi: Joi.object({
    phoneNumber: phoneNumberSchema,
    amount: amountSchema,
  }),
  
  qr_scan: Joi.object({
    qrData: Joi.string().min(1).required(),
    amount: amountSchema,
  }),
};

export function validatePaymentData(service: ServiceType, data: Partial<PaymentData>): { isValid: boolean; error?: string; validatedData?: PaymentData } {
  const schema = validationSchemas[service];
  if (!schema) {
    return { isValid: false, error: 'Invalid service type' };
  }

  const { error, value } = schema.validate(data);
  if (error) {
    return { isValid: false, error: error.details[0]?.message || 'Validation error' };
  }

  return { 
    isValid: true, 
    validatedData: { 
      service, 
      ...value 
    } as PaymentData 
  };
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to standard format (254XXXXXXXXX)
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned;
  }
  
  return cleaned;
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatSats(sats: number): string {
  return `${sats.toLocaleString()} sats`;
}
