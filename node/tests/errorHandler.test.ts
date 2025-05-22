import { describe, it, expect, vi } from 'vitest';
import { 
  ErrorHandler, 
  TestScriptError 
} from './utils/error_handler';
import { ErrorCategory, ErrorSeverity } from './utils/error_constants';

describe('ErrorHandler', () => {
  it('should create a standardized error', () => {
    const error = ErrorHandler.create('Test error', {
      category: ErrorCategory.CONFIGURATION,
      severity: ErrorSeverity.HIGH,
      context: { details: 'Test context' }
    });

    expect(error).toBeInstanceOf(TestScriptError);
    expect(error.message).toBe('Test error');
    expect(error.category).toBe(ErrorCategory.CONFIGURATION);
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.context).toEqual({ details: 'Test context' });
  });

  it('should safely execute a function', async () => {
    const mockFn = vi.fn(() => Promise.resolve('Success'));
    const result = await ErrorHandler.safeExecute(mockFn);
    
    expect(result).toBe('Success');
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('should handle errors during execution', async () => {
    const mockErrorHandler = vi.fn();
    const mockFn = vi.fn(() => {
      throw new Error('Test error');
    });

    const result = await ErrorHandler.safeExecute(
      mockFn, 
      { errorHandler: mockErrorHandler, fallbackValue: 'Fallback' }
    );

    expect(result).toBe('Fallback');
    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockErrorHandler).toHaveBeenCalledOnce();
  });

  it('should convert error to structured format', () => {
    const error = ErrorHandler.create('Structured error test', {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.CRITICAL,
      context: { details: 'Connection failed' }
    });

    const structuredError = error.toStructuredError();

    expect(structuredError).toHaveProperty('id');
    expect(structuredError).toHaveProperty('message', 'Structured error test');
    expect(structuredError).toHaveProperty('category', ErrorCategory.NETWORK);
    expect(structuredError).toHaveProperty('severity', ErrorSeverity.CRITICAL);
    expect(structuredError.context).toEqual({ details: 'Connection failed' });
    expect(structuredError).toHaveProperty('timestamp');
    expect(structuredError).toHaveProperty('stackTrace');
    expect(structuredError).toHaveProperty('source', 'TestScript');
  });

  it('should create a log entry from different error types', () => {
    // Log entry from TestScriptError
    const testScriptError = ErrorHandler.create('Test Script Error');
    const logEntryFromTestScriptError = ErrorHandler.logEntry(testScriptError);
    expect(logEntryFromTestScriptError).toHaveProperty('id');
    expect(logEntryFromTestScriptError.message).toBe('Test Script Error');

    // Log entry from Error
    const standardError = new Error('Standard Error');
    const logEntryFromStandardError = ErrorHandler.logEntry(standardError, {
      category: ErrorCategory.RUNTIME,
      severity: ErrorSeverity.HIGH
    });
    expect(logEntryFromStandardError).toHaveProperty('id');
    expect(logEntryFromStandardError.message).toBe('Standard Error');
    expect(logEntryFromStandardError.category).toBe(ErrorCategory.RUNTIME);
    expect(logEntryFromStandardError.severity).toBe(ErrorSeverity.HIGH);

    // Log entry from string
    const logEntryFromString = ErrorHandler.logEntry('String Error');
    expect(logEntryFromString).toHaveProperty('id');
    expect(logEntryFromString.message).toBe('String Error');
  });
});
