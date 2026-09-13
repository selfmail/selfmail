# Domain Queue

A redis-based queue for processing new domains. Domains get added to the queue, and after some time processed automatically. 

Checks:
- MX Record that points to a valid Selfmail SMTP Server
- SPF Record that includes the Selfmail SMTP Server
- DMARC Record
- Other valid entries in the DNS records
