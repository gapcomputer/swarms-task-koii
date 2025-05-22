import { describe, it, expect, vi } from 'vitest';
import { 
  ErrorHandler, 
  TestScriptError, 
  ErrorCategory, 
  ErrorSeverity 
} from './utils/errorHandler';

describe('ErrorHandler', () => {
  it('should create a standardized error', () => {
    const error = ErrorHandler.create(
      'Test error', 
      ErrorCategory.CONFIGURATION, 
      ErrorSeverity.HIGH
    );

    expect(error).toBeInstanceOf(TestScriptError);
    expect(error.message).toBe('Test error');
    expect(error.category).toBe(ErrorCategory.CONFIGURATION);
    expect(error.severity).toBe(ErrorSeverity.HIGH);
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
      mockErrorHandler
    );

    expect(result).toBeNull();
    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockErrorHandler).toHaveBeenCalledOnce();
  });

  it('should convert error to structured format', () => {
    const error = new TestScriptError(
      'Structured error test', 
      ErrorCategory.NETWORK, 
      ErrorSeverity.CRITICAL,
      { details: 'Connection failed' }
    );

    const structuredError = error.toStructuredError();

    expect(structuredError).toHaveProperty('message', 'Structured error test');
    expect(structuredError).toHaveProperty('category', ErrorCategory.NETWORK);
    expect(structuredError).toHaveProperty('severity', ErrorSeverity.CRITICAL);
    expect(structuredError.context).toEqual({ details: 'Connection failed' });
    expect(structuredError).toHaveProperty('timestamp');
    expect(structuredError).toHaveProperty('stackTrace');
  });
});