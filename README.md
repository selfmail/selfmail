# Selfmail

The open-source and privacy first email provider for your company. A simple and easy-to-use interface, custom addresses, own domains, a free starting plan and more in the first version coming soon.

**Features**

We have a limit feature set, due to the fact that Selfmail is just an MVP for now. 

- Send and Receive Emails through our SMTP Server
- Create workspaces and customize it
- [soon] Add custom domains for your workspace
- [soon] Collaberate with others in your workspace

## Documentation

If you prefer a web-version of our documentation, you can head over to [docs.selfmail.app](https://docs.selfmail.app).

### Selfhosting

**NOT RECOMMENDED FOR NOW**

We are not recommending selfhosting Selfmail, because we are in an very early stage of development, and not yet production ready. The documentation below for 
selfhosting is also not quite completed. 

> [!NOTE]
> Selfmail does not have an installation script for speeding up the process. Contributions are welcomed for a selfhosting script.

**Prerequisite:**

- [Docker](https://docker.com)
- Docker Compose
- A Reverse Proxy (for example [Caddy](https://caddyserver.com))
- [Git](https://git-scm.com/)


You also need a **Server** (for example an VPS) with access to **port 25** and **port 587**. Both ports are often abused for spamming attacks, please ask your provider, whether they can enable you the ports, if they are blocked. You also need access to port 80, for generating certificates, to send emails.

