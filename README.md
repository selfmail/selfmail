# 📧 Selfmail

<div align="center">
  <strong>The open-source, privacy-first email provider for modern companies</strong>
</div>

<p align="center">
  A complete email infrastructure solution with SMTP services, workspace management, and powerful APIs. 
  Built for businesses that value privacy, control, and simplicity.
</p>

<div align="center">

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/selfmail/selfmail)](https://github.com/selfmail/selfmail/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/selfmail/selfmail)](https://github.com/selfmail/selfmail/issues)

</div>

---

## 🚀 Project Overview

Selfmail is a **privacy-first email provider** designed specifically for companies who want full control over their email infrastructure. Unlike traditional email services, Selfmail gives you complete ownership of your data while providing enterprise-grade features through a modern, intuitive interface.

**Why Selfmail?**
- 🔒 **Privacy-First**: Your emails, your data, your control
- 🏢 **Business-Focused**: Built for teams and organizations
- 🛠️ **Self-Hostable**: Deploy on your own infrastructure
- 🔓 **Open Source**: Transparent, auditable, and community-driven
- 📧 **Full SMTP Stack**: Complete email sending and receiving capabilities

> **Note**: Selfmail is currently in early development (MVP stage) but already provides core email functionality.

## ✨ Key Features

### 📨 **Email Infrastructure**
- **SMTP Server**: Send and receive emails through our robust SMTP implementation
- **Email Relay**: Reliable email delivery with queue management
- **Anti-Spam Protection**: Integrated Rspamd for spam filtering
- **Virus Scanning**: ClamAV integration for email security

### 🏢 **Workspace Management**
- **Team Workspaces**: Create and customize workspaces for your organization
- **Custom Email Addresses**: Generate professional email addresses for your team
- **User Management**: Invite team members and manage permissions
- **Dashboard Interface**: Modern web interface for email management

### 🔧 **Developer Tools**
- **REST API**: Comprehensive API for email operations
- **SMTP API**: Direct SMTP integration for applications
- **Webhook Support**: Real-time notifications and integrations
- **Queue Management**: Reliable background job processing

### 🚀 **Coming Soon**
- **Custom Domains**: Add your own domains to workspaces
- **Advanced Collaboration**: Enhanced team features and sharing
- **Email Templates**: Pre-built templates for common use cases
- **Analytics Dashboard**: Email delivery insights and reporting

## 🏁 Getting Started

### For End Users

1. **Sign up** for a Selfmail account (when available)
2. **Create a workspace** for your organization
3. **Add team members** and assign email addresses
4. **Start sending emails** through the dashboard or API

### For Developers

```bash
# Clone the repository
git clone https://github.com/selfmail/selfmail.git
cd selfmail

# Install dependencies
bun install

# Start development servers
bun run dev
```

**Requirements:**
- Node.js 18+ or Bun runtime
- Docker and Docker Compose
- PostgreSQL database
- Redis for caching and queues

## 🏠 Self-Hosting Guide

> **⚠️ IMPORTANT**: Self-hosting is **NOT RECOMMENDED** for production use at this time. Selfmail is in early development and not yet production-ready. The self-hosting documentation is incomplete and subject to changes.

### Prerequisites

Before self-hosting Selfmail, ensure you have:

- **[Docker](https://docker.com)** and Docker Compose installed
- **Reverse Proxy** (we recommend [Caddy](https://caddyserver.com))
- **[Git](https://git-scm.com/)** for repository management
- **VPS/Server** with the following port access:
  - Port **25** (SMTP inbound)
  - Port **587** (SMTP outbound/submission)  
  - Port **80** (HTTP for certificate generation)
  - Port **443** (HTTPS)

> **Note**: Many hosting providers block ports 25 and 587 due to spam abuse. Contact your provider to enable these ports if they're blocked.

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/selfmail/selfmail.git
   cd selfmail
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

4. **Set up SSL certificates** through your reverse proxy

> **Contributing Opportunity**: We need a comprehensive self-hosting script! Contributions for automation tools are highly welcomed.

## 📚 Documentation

For comprehensive documentation, visit **[docs.selfmail.app](https://docs.selfmail.app)**.

The documentation covers:
- API reference and examples
- Self-hosting detailed guides  
- Architecture overview
- Contributing guidelines
- Troubleshooting and support

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Priority Contributions Needed:
- **Self-hosting automation script** - Help make deployment easier
- **Documentation improvements** - Expand our guides and examples
- **Bug fixes and testing** - Help us improve stability
- **Feature development** - Implement planned features

### Getting Started:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please read our contributing guidelines and ensure your code follows our style standards.

## 🌐 Community and Support

### Get Help:
- 📖 **Documentation**: [docs.selfmail.app](https://docs.selfmail.app)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/selfmail/selfmail/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/selfmail/selfmail/discussions)

### Security:
For security vulnerabilities, please email: **security@selfmail.app**

### Stay Updated:
- ⭐ Star this repository to follow our progress
- 👀 Watch for release notifications
- 📱 Follow us for updates and announcements

## 📄 License

Selfmail is licensed under the **Apache License 2.0**.

```
Copyright 2025 Henri Generlich

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

<div align="center">
  <strong>Made with ❤️ for the open source community</strong><br>
  <sub>Help us build the future of privacy-first email infrastructure</sub>
</div>

