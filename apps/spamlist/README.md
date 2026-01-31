# Spamlist

Intern used Spamlist to identify spam fast. We are using a Redis database for quick actions inside the SMTP server and a PostgreSQL database as single base of truth. Inngest is used for jobs to manage the Redis database.

This uses a different PostgreSQL Database than the rest of the project.