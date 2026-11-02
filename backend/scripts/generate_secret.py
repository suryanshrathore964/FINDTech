#!/usr/bin/env python3
"""Print a secure SECRET_KEY for production JWT signing."""
from app.config import generate_secret_key

if __name__ == "__main__":
    print(generate_secret_key())
