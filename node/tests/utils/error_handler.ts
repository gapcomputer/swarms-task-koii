import { v4 as uuidv4 } from 'uuid';
import { ErrorCategory, ErrorSeverity, StructuredError } from './error_constants';

export class TestScriptError extends Error {
  public readonly id: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, any>;
  public readonly timestamp: number;
  public readonly source?: string;

  constructor(
    message: string,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      context?: Record<string, any>;
      source?: string;
    } = {}
  ) {
    super(message);
    this.name = 'TestScriptError';
    this.id = uuidv4();
    this.category = options.category || ErrorCategory.RUNTIME;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.context = options.context;
    this.source = options.source || 'TestScript';
    this.timestamp = Date.now();
  }

  /**
   * Convert error to a standardized structured error format
   */
  toStructuredError(): StructuredError {
    return {
      id: this.id,
      message: this.message,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp,
      context: this.context,
      stackTrace: this.stack,
      source: this.source
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

export class ErrorHandler {
  /**
   * Create a standardized error
   */
  static create(
    message: string,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      context?: Record<string, any>;
      source?: string;
    } = {}
  ): TestScriptError {
    return new TestScriptError(message, options);
  }

  /**
   * Safely execute a function with error handling
   */
  static async safeExecute<T>(
    fn: () => Promise<T>,
    options: {
      errorHandler?: (error: TestScriptError) => void;
      fallbackValue?: T;
    } = {}
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      const testError = error instanceof TestScriptError 
        ? error 
        : this.create(
            error instanceof Error ? error.message : 'Unknown error', 
            { 
              category: ErrorCategory.RUNTIME, 
              severity: ErrorSeverity.HIGH 
            }
          );
      
      if (options.errorHandler) {
        options.errorHandler(testError);
      } else {
        testError.log();
      }
      
      return options.fallbackValue;
    }
  }

  /**
   * Create a log entry for tracking errors
   */
  static logEntry(
    error: TestScriptError | Error | string,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      context?: Record<string, any>;
    } = {}
  ): StructuredError {
    let structuredError: StructuredError;

    if (error instanceof TestScriptError) {
      structuredError = error.toStructuredError();
    } else if (error instanceof Error) {
      const testError = this.create(error.message, {
        category: options.category,
        severity: options.severity,
        context: options.context
      });
      structuredError = testError.toStructuredError();
    } else {
      const testError = this.create(error, {
        category: options.category,
        severity: options.severity,
        context: options.context
      });
      structuredError = testError.toStructuredError();
    }

    return structuredError;
  }
}
