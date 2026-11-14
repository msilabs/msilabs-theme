from dataclasses import dataclass
from typing import Optional


def log_calls(func):
    """Decorator that prints each call."""
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper


@dataclass
class Learner:
    name: str
    score: int = 0
    mentor: Optional[str] = None

    # Line comment
    @log_calls
    def level(self, bonus: float = 1.5) -> str:
        if self.score > 90 and not self.mentor:
            return f"{self.name}: expert"
        elif self.score > 50 or bonus > 2:
            return "intermediate"
        return "beginner"


learners = [Learner("Rafi", 95), Learner("Mim", 40, mentor=None)]
levels = [l.level() for l in learners if l.score >= 0]
print(levels, True, False, None, 3.14)
