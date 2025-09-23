**Selfmail**

The open-source and privacy first email provider for your company. A simple and easy-to-use interface, custom addresses, own domains, a free starting plan and more in the first version coming soon.

**Documentation**

*Selfhosting*

Selfmail is easy to selfhost, you need a vps with access to port 25 and 587 (some providers may block these ports, due to spam abusing). You can clone the repo:

```bash
git clone https://github.com/selfmail/selfmail
```

Make sure to have docker and docker-compose installed. After that, just hit

```bash
docker-compose up -d
```

to start the production server. The following ports are getting exposed:

- 25 (Incoming SMTP traffic)
- 587 (Outbound SMTP traffic)
- 3000 (Api)
- 3001 (Dashboard)

