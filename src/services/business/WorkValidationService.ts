import { logger } from '@/services/core/LoggingService';
import type { WorkData, WorkValidationResult } from '@/types/work';

/**
 * Business service for work opportunity data validation
 * Validates work data against business rules before publishing
 */
export class WorkValidationService {
  /**
   * Validate work opportunity data against business rules
   * 
   * @param data - Partial work data to validate
   * @returns Validation result with errors keyed by field name
   */
  static validateWorkData(
    data: Partial<WorkData>
  ): WorkValidationResult {
    const errors: WorkValidationResult['errors'] = {};

    // Title validation
    if (!data.title || data.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    // Category validation
    if (!data.category) {
      errors.category = 'Category is required';
    }

    // Job type validation
    if (!data.jobType) {
      errors.jobType = 'Job type is required';
    }

    // Duration validation
    if (!data.duration) {
      errors.duration = 'Duration is required';
    }

    // Pay rate validation
    if (data.payRate === undefined || data.payRate === null) {
      errors.payRate = 'Pay rate is required';
    } else if (data.payRate < 0) {
      errors.payRate = 'Pay rate must be a positive number';
    }

    // Currency validation
    if (!data.currency) {
      errors.currency = 'Currency is required';
    }

    // Description validation
    if (!data.description || data.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    // Region validation
    if (!data.region) {
      errors.region = 'Region is required';
    }

    // Country validation
    if (!data.country) {
      errors.country = 'Country is required';
    }

    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      logger.debug('Work validation failed', {
        service: 'WorkValidationService',
        method: 'validateWorkData',
        errorCount: Object.keys(errors).length,
        errors,
      });
    }

    return {
      valid: isValid,
      errors,
    };
  }
}

/**
 * Named export for convenience
 */
export const validateWorkData = 
  WorkValidationService.validateWorkData;
