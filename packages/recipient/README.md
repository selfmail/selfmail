# @selfmail/recipient

Perform edits to redis database in order to change recipients. The smtp server will use the redis database to determine which addresses exists in the system and which ones are valid, for example with catch-all addresses. This package is not used by the smtp server, instead by queues to edit the redis database.
