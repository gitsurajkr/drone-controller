import time
import logging
from enum import Enum
from typing import Callable, Any, Optional

class CircuitBreakerState(Enum):
    CLOSED = "CLOSED"    
    OPEN = "OPEN"         
    HALF_OPEN = "HALF_OPEN"  # Testing if service recovered

class CircuitBreaker:
    """Simple circuit breaker implementation to prevent cascading failures"""
    
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout: float = 60.0,
        expected_exception: type = Exception,
        name: str = "CircuitBreaker"
    ):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.expected_exception = expected_exception
        self.name = name
        
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.state = CircuitBreakerState.CLOSED
        
        self.logger = logging.getLogger(f"circuit_breaker.{name}")
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        
        if self.state == CircuitBreakerState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitBreakerState.HALF_OPEN
                self.logger.info(f"{self.name}: Moving to HALF_OPEN state")
            else:
                raise Exception(f"Circuit breaker {self.name} is OPEN - service unavailable")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
            
        except self.expected_exception as e:
            self._on_failure()
            raise e
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to attempt reset"""
        if self.last_failure_time is None:
            return True
        return time.time() - self.last_failure_time >= self.timeout
    
    def _on_success(self):
        """Handle successful call"""
        if self.state == CircuitBreakerState.HALF_OPEN:
            self.logger.info(f"{self.name}: Service recovered, moving to CLOSED state")
            self.state = CircuitBreakerState.CLOSED
        
        self.failure_count = 0
        self.last_failure_time = None
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            if self.state != CircuitBreakerState.OPEN:
                self.logger.warning(
                    f"{self.name}: Failure threshold reached ({self.failure_count}), "
                    f"opening circuit breaker"
                )
                self.state = CircuitBreakerState.OPEN
    
    def get_state(self) -> dict:
        """Get current circuit breaker state"""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "failure_threshold": self.failure_threshold,
            "last_failure_time": self.last_failure_time,
            "timeout": self.timeout
        }
    
    def reset(self):
        """Manually reset circuit breaker"""
        self.logger.info(f"{self.name}: Manually resetting circuit breaker")
        self.state = CircuitBreakerState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None

class CircuitBreakerRegistry:
    """Registry to manage multiple circuit breakers"""
    
    def __init__(self):
        self.breakers: dict[str, CircuitBreaker] = {}
    
    def get_breaker(self, name: str) -> Optional[CircuitBreaker]:
        """Get circuit breaker by name"""
        return self.breakers.get(name)
    
    def register_breaker(self, breaker: CircuitBreaker):
        """Register a new circuit breaker"""
        self.breakers[breaker.name] = breaker
    
    def get_all_states(self) -> dict:
        """Get states of all registered circuit breakers"""
        return {name: breaker.get_state() for name, breaker in self.breakers.items()}
    
    def reset_all(self):
        """Reset all circuit breakers"""
        for breaker in self.breakers.values():
            breaker.reset()

circuit_breaker_registry = CircuitBreakerRegistry()