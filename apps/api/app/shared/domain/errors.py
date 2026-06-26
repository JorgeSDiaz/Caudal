"""Shared domain errors."""

from __future__ import annotations


class DomainValidationError(ValueError):
    """A value violates a domain rule. Subclasses ValueError so callers that catch
    ValueError keep working; the HTTP layer maps it to 422 Unprocessable Entity."""
