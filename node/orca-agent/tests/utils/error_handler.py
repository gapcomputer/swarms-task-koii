import enum
import json
import traceback
from typing import Dict, Any, Optional, Callable
from datetime import datetime

class ErrorSeverity(enum.Enum):
    """Error Severity Levels"""
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'

class ErrorCategory(enum.Enum):
    """Error Categories for Consistent Classification"""
    CONFIGURATION = 'CONFIGURATION'
    NETWORK = 'NETWORK'
    DEPENDENCY = 'DEPENDENCY'
    RUNTIME = 'RUNTIME'
    VALIDATION = 'VALIDATION'

class TestScriptError(Exception):
    """Custom Error Class for Standardized Error Handling"""
    
    def __init__(
        self, 
        message: str, 
        category: ErrorCategory = ErrorCategory.RUNTIME,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        context: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.category = category
        self.severity = severity
        self.context = context or {}
        self.timestamp = datetime.now().isoformat()
        self.stack_trace = traceback.format_exc()

    def to_structured_error(self) -> Dict[str, Any]:
        """Convert error to a structured format"""
        return {
            'message': str(self),
            'category': self.category.value,
            'severity': self.severity.value,
            'context': self.context,
            'timestamp': self.timestamp,
            'stack_trace': self.stack_trace
        }

    def log(self, custom_logger: Optional[Callable[[Dict[str, Any]], None]] = None):
        """Log the error with optional custom logging function"""
        structured_error = self.to_structured_error()
        
        if custom_logger:
            custom_logger(structured_error)
        else:
            print(json.dumps(structured_error, indent=2))

class ErrorHandler:
    """Error handling utility functions"""
    
    @staticmethod
    def create(
        message: str, 
        category: ErrorCategory = ErrorCategory.RUNTIME,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        context: Optional[Dict[str, Any]] = None
    ) -> TestScriptError:
        """Create a standardized error"""
        return TestScriptError(message, category, severity, context)

    @staticmethod
    async def safe_execute(
        fn: Callable[[], Any], 
        error_handler: Optional[Callable[[TestScriptError], None]] = None
    ) -> Optional[Any]:
        """Safely execute a function with error handling"""
        try:
            return await fn()
        except Exception as error:
            if isinstance(error, TestScriptError):
                test_error = error
            else:
                test_error = TestScriptError(
                    str(error), 
                    ErrorCategory.RUNTIME, 
                    ErrorSeverity.HIGH
                )
            
            if error_handler:
                error_handler(test_error)
            else:
                test_error.log()
            
            return None