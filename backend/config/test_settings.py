"""Isolated local test settings; no connection to the configured PostgreSQL server."""

from .settings import *  # noqa: F403

SECRET_KEY = 'nuru-local-tests-only'
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    },
}
