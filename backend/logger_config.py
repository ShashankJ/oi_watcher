"""
Centralized logging configuration for the entire backend.
All backend modules should import and use the logger from this module.
"""
import logging
from logging.handlers import RotatingFileHandler
import os

# Setup logging directory
log_dir = 'logs'
os.makedirs(log_dir, exist_ok=True)

# Create formatter
formatter = logging.Formatter('%(asctime)s %(levelname)s [%(name)s] %(message)s')

# Setup root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)

# Remove any existing handlers to avoid duplicates
if root_logger.handlers:
    root_logger.handlers.clear()

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
root_logger.addHandler(console_handler)

# File handler with rotation (10MB per file, keep 5 backup files)
file_handler = RotatingFileHandler(
    os.path.join(log_dir, 'backend.log'),
    maxBytes=10*1024*1024,  # 10 MB
    backupCount=5
)
file_handler.setFormatter(formatter)
root_logger.addHandler(file_handler)


def get_logger(name):
    """
    Get a logger instance for a specific module.

    Args:
        name: The name of the module (typically __name__)

    Returns:
        Logger instance
    """
    return logging.getLogger(name)

