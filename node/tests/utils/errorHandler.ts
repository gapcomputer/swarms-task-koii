// Standardized Error Handling Utility for Test Scripts

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Error Categories for Consistent Classification
 */
export enum ErrorCategory {
  CONFIGURATION = 'CONFIGURATION',
  NETWORK = 'NETWORK',
  DEPENDENCY = 'DEPENDENCY', 
  RUNTIME = 'RUNTIME',
  VALIDATION = 'VALIDATION'
}

/**
 * Structured Error Interface
 */
export interface StructuredError {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  timestamp?: number;
  stackTrace?: string;
}

/**
 * Custom Error Class for Standardized Error Handling
 */
export class TestScriptError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, any>;
  public readonly timestamp: number;

  constructor(
    message: string, 
    category: ErrorCategory = ErrorCategory.RUNTIME,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'TestScriptError';
    this.category = category;
    this.severity = severity;
    this.context = context;
    this.timestamp = Date.now();
  }

  /**
   * Convert error to a structured format
   */
  toStructuredError(): StructuredError {
    return {
      message: this.message,
      category: this.category,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      stackTrace: this.stack
    };
  }

  /**
   * Log the error with optional custom logging function
   */
  log(customLogger?: (error: StructuredError) => void): void {
    const structuredError = this.toStructuredError();
    
    if (customLogger) {
      customLogger(structuredError);
      return;
    }

    console.error(JSON.stringify(structuredError, null, 2));
  }
}

/**
 * Error handling utility functions
 */
export const ErrorHandler = {
  /**
   * Create a standardized error
   */
  create(
    message: string, 
    category?: ErrorCategory, 
    severity?: ErrorSeverity,
    context?: Record<string, any>
  ): TestScriptError {
    return new TestScriptError(message, category, severity, context);
  },

  /**
   * Safely execute a function with error handling
   */
  async safeExecute<T>(
    fn: () => Promise<T>, 
    errorHandler?: (error: TestScriptError) => void
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const testError = error instanceof TestScriptError 
        ? error 
        : this.create(
            error instanceof Error ? error.message : 'Unknown error', 
            ErrorCategory.RUNTIME, 
            ErrorSeverity.HIGH
          );
      
      if (errorHandler) {
        errorHandler(testError);
      } else {
        testError.log();
      }
      
      return null;
    }
  }
};