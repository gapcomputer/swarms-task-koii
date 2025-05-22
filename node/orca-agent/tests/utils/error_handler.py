import enum
import json
import traceback
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Callable, TypeVar, Union

class ErrorCategory(enum.Enum):
    """Standardized Error Categories"""
    CONFIGURATION = 'CONFIGURATION'
    NETWORK = 'NETWORK'
    DEPENDENCY = 'DEPENDENCY'
    RUNTIME = 'RUNTIME'
    VALIDATION = 'VALIDATION'
    INTEGRATION = 'INTEGRATION'
    PERMISSION = 'PERMISSION'

class ErrorSeverity(enum.Enum):
    """Standardized Error Severity Levels"""
    INFO = 'INFO'
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'

class TestScriptError(Exception):
    """Standardized Error Class for Test Scripts"""
    
    def __init__(
        self, 
        message: str, 
        category: ErrorCategory = ErrorCategory.RUNTIME,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        context: Optional[Dict[str, Any]] = None,
        source: Optional[str] = None
    ):
        super().__init__(message)
        self.id = str(uuid.uuid4())
        self.category = category
        self.severity = severity
        self.context = context or {}
        self.source = source or 'TestScript'
        self.timestamp = datetime.now().timestamp()
        self.stack_trace = traceback.format_exc()

    def to_structured_error(self) -> Dict[str, Any]:
        """Convert error to a standardized structured error format"""
        return {
            'id': self.id,
            'message': str(self),
            'category': self.category.value,
            'severity': self.severity.value,
            'timestamp': int(self.timestamp),
            'context': self.context,
            'stackTrace': self.stack_trace,
            'source': self.source
        }

    def log(self, custom_logger: Optional[Callable[[Dict[str, Any]], None]] = None):
        """Log the error with optional custom logging function"""
        structured_error = self.to_structured_error()
        
        if custom_logger:
            custom_logger(structured_error)
        else:
            print(json.dumps(structured_error, indent=2))

class ErrorHandler:
    """Comprehensive Error Handling Utility"""
    
    @staticmethod
    def create(
        message: str, 
        category: ErrorCategory = ErrorCategory.RUNTIME,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        context: Optional[Dict[str, Any]] = None,
        source: Optional[str] = None
    ) -> TestScriptError:
        """Create a standardized error"""
        return TestScriptError(
            message, 
            category=category, 
            severity=severity, 
            context=context,
            source=source
        )

    @staticmethod
    async def safe_execute(
        fn: Callable[[], Any], 
        error_handler: Optional[Callable[[TestScriptError], None]] = None,
        fallback_value: Optional[Any] = None
    ) -> Optional[Any]:
        """Safely execute a function with error handling"""
        try:
            return await fn()
        except Exception as error:
            if isinstance(error, TestScriptError):
                test_error = error
            else:
                test_error = ErrorHandler.create(
                    str(error), 
                    category=ErrorCategory.RUNTIME, 
                    severity=ErrorSeverity.HIGH
                )
            
            if error_handler:
                error_handler(test_error)
            else:
                test_error.log()
            
            return fallback_value

    @staticmethod
    def log_entry(
        error: Union[TestScriptError, Exception, str],
        category: Optional[ErrorCategory] = None,
        severity: Optional[ErrorSeverity] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a log entry for tracking errors"""
        if isinstance(error, TestScriptError):
            structured_error = error.to_structured_error()
        elif isinstance(error, Exception):
            test_error = ErrorHandler.create(
                str(error), 
                category=category or ErrorCategory.RUNTIME,
                severity=severity or ErrorSeverity.MEDIUM,
                context=context
            )
            structured_error = test_error.to_structured_error()
        else:
            test_error = ErrorHandler.create(
                error, 
                category=category or ErrorCategory.RUNTIME,
                severity=severity or ErrorSeverity.MEDIUM,
                context=context
            )
            structured_error = test_error.to_structured_error()

        return structured_error
