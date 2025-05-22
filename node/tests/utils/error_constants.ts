/**
 * Standardized Error Categories for Cross-Language Compatibility
 */
export enum ErrorCategory {
  CONFIGURATION = 'CONFIGURATION',
  NETWORK = 'NETWORK',
  DEPENDENCY = 'DEPENDENCY',
  RUNTIME = 'RUNTIME',
  VALIDATION = 'VALIDATION',
  INTEGRATION = 'INTEGRATION',
  PERMISSION = 'PERMISSION'
}

/**
 * Standardized Error Severity Levels
 */
export enum ErrorSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Structured Error Interface for Consistent Reporting
 */
export interface StructuredError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, any>;
  stackTrace?: string;
  source?: string;
}
