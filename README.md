# Selfmail

The open-source and privacy-first email provider for your company. Selfmail offers a simple and easy-to-use interface, custom addresses, own domains, and more. Built with modern technologies like Bun, TypeScript, and Docker, Selfmail provides a complete email solution that you can host yourself.

## 📋 Table of Contents

- [About Selfmail](#about-selfmail)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Selfhosting Guide](#selfhosting-guide)
- [Development Setup](#development-setup)
- [Environment Configuration](#environment-configuration)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 About Selfmail

Selfmail is a comprehensive email platform designed for businesses and organizations who want complete control over their email infrastructure. It provides:

- **Privacy-first approach**: Your data stays on your servers
- **Custom domains**: Use your own domain for email addresses
- **Modern web interface**: Clean, intuitive dashboard for managing emails
- **SMTP server**: Full-featured email server with security features
- **API access**: RESTful API for integration with other services
- **Scalable architecture**: Microservices design for easy scaling

## 🏗️ Architecture Overview

Selfmail consists of several microservices working together:

| Service | Description | Port | Technology |
|---------|-------------|------|------------|
| **API** | Main backend service handling user data and business logic | 3000 | Bun + Elysia |
| **Dashboard** | Web interface for email management | 4173 | React + Vite |
| **SMTP** | Email server for sending/receiving emails | 25, 587 | Custom SMTP server |
| **SMTP-API** | API service for SMTP operations | 4001 | Bun + Elysia |
| **Relay** | Email relay service for routing | 3001 | Bun |
| **Queue** | Message queue processor | - | Bun + Redis |
| **WWW** | Marketing website | 4321 | Astro |
| **Transactional Queue** | Handles transactional emails | - | Bun + Redis |

**External Dependencies:**
- **PostgreSQL**: Primary database
- **Redis**: Caching and message queuing
- **Rspamd**: Spam filtering
- **ClamAV**: Anti-virus scanning

## 📋 Prerequisites

### For Selfhosting (Production)

- **Server**: VPS or dedicated server with root access
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Docker**: Latest version with Docker Compose
- **Reverse Proxy**: [Caddy](https://caddyserver.com), Nginx, or Traefik
- **Domain**: Your own domain with DNS control
- **Ports**: Access to ports 25 (SMTP) and 587 (SMTP submission)
- **SSL Certificates**: Let's Encrypt or custom certificates
- **Minimum Resources**: 2 GB RAM, 2 CPU cores, 20 GB storage

> [!IMPORTANT]
> Many VPS providers block ports 25 and 587 to prevent spam. Contact your provider to ensure these ports are unblocked before proceeding.

### For Development

- **[Bun](https://bun.sh)**: Latest version (JavaScript runtime and package manager)
- **[Node.js](https://nodejs.org)**: v18+ (fallback if Bun unavailable)
- **[Docker](https://docker.com)**: For running databases and services
- **[Git](https://git-scm.com)**: For version control
- **Code Editor**: VS Code recommended with TypeScript support

## 🚀 Selfhosting Guide

> [!NOTE]
> Selfmail does not have an installation script for speeding up the process. Contributions are welcomed for a selfhosting script.

### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Git
sudo apt install git -y

# Reboot to apply changes
sudo reboot
```

### 2. Clone Repository

```bash
git clone https://github.com/selfmail/selfmail.git
cd selfmail
```

### 3. Environment Configuration

```bash
# Copy example environment files
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env
cp apps/smtp/.env.example apps/smtp/.env

# Generate secure passwords and tokens
# Edit each .env file with your configuration
```

### 4. SSL Certificates

Create SSL certificates for your domain:

```bash
# Create certificates directory
mkdir -p certs

# Option 1: Using Let's Encrypt (recommended)
sudo apt install certbot -y
sudo certbot certonly --standalone -d mail.yourdomain.com

# Copy certificates to certs directory
sudo cp /etc/letsencrypt/live/mail.yourdomain.com/fullchain.pem certs/
sudo cp /etc/letsencrypt/live/mail.yourdomain.com/privkey.pem certs/
sudo chown $USER:$USER certs/*

# Option 2: Self-signed certificates (development only)
openssl req -x509 -newkey rsa:4096 -keyout certs/privkey.pem -out certs/fullchain.pem -days 365 -nodes
```

### 5. Database Setup

```bash
# Set up PostgreSQL and Redis
docker run -d \
  --name selfmail-postgres \
  --restart unless-stopped \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=selfmail \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

docker run -d \
  --name selfmail-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine
```

### 6. Deploy Selfmail

```bash
# Build and start all services
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check logs if needed
docker-compose logs -f
```

### 7. Reverse Proxy Setup

Example Caddy configuration (`Caddyfile`):

```caddy
mail.yourdomain.com {
    # Dashboard
    handle /dashboard* {
        reverse_proxy localhost:4173
    }
    
    # API
    handle /api* {
        reverse_proxy localhost:3000
    }
    
    # Default to marketing site
    reverse_proxy localhost:4321
}

# SMTP submission (port 587) - optional web management
smtp.yourdomain.com:587 {
    reverse_proxy localhost:587
}
```

### 8. DNS Configuration

Set up these DNS records for your domain:

```
# A Records
mail.yourdomain.com.     A     YOUR_SERVER_IP
smtp.yourdomain.com.     A     YOUR_SERVER_IP

# MX Record
yourdomain.com.          MX    10 mail.yourdomain.com.

# SPF Record
yourdomain.com.          TXT   "v=spf1 a:mail.yourdomain.com ~all"

# DKIM Record (generate with your SMTP service)
default._domainkey.yourdomain.com. TXT "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"

# DMARC Record
_dmarc.yourdomain.com.   TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

## 🛠️ Development Setup

### 1. Prerequisites Installation

```bash
# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Or install Node.js if Bun is not available
# Download from https://nodejs.org/
```

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/selfmail/selfmail.git
cd selfmail

# Install dependencies
bun install

# Set up environment files
find apps -name ".env.example" -exec sh -c 'cp "$1" "${1%.example}"' _ {} \;
find packages -name ".env.example" -exec sh -c 'cp "$1" "${1%.example}"' _ {} \;
```

### 3. Database Setup (Development)

```bash
# Start PostgreSQL and Redis with Docker
docker run -d --name dev-postgres -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=selfmail -p 5432:5432 postgres:15
docker run -d --name dev-redis -p 6379:6379 redis:7-alpine

# Generate database schema
bun run db:push
```

### 4. Development Commands

```bash
# Start all services in development mode (excludes SMTP services)
bun run dev

# Start only SMTP-related services
bun run dev:smtp

# Start specific apps
turbo -F dashboard dev    # Dashboard only
turbo -F api dev         # API only
turbo -F www dev         # Marketing site only

# Build all applications
bun run build

# Run type checking
bun run check-types

# Lint code
bun run check
```

### 5. Development Ports

| Service | Port | URL |
|---------|------|-----|
| Dashboard | 5173 | http://localhost:5173 |
| API | 3000 | http://localhost:3000 |
| WWW | 4321 | http://localhost:4321 |
| SMTP-API | 4001 | http://localhost:4001 |
| Relay | 4000 | http://localhost:4000 |

## ⚙️ Environment Configuration

### Required Environment Variables

Create `.env` files in each app directory with these variables:

#### API Service (`apps/api/.env`)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/selfmail
REDIS_URL=redis://localhost:6379
ACTIVATE_PAYMENTS=false
ENABLE_S3_UPLOAD=false
ENABLE_DOCKER_VOLUME_UPLOAD=true
```

#### SMTP Service (`apps/smtp/.env`)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/selfmail
REDIS_URL=redis://localhost:6379
CERTIFICATE_PATH=/app/certs
RSPAMD_HOST=localhost
RSPAMD_PORT=11332
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

#### Dashboard (`apps/dashboard/.env`)
```bash
VITE_API_BASE_URL=http://localhost:3000
```

## 📚 Documentation

### Component Documentation

- [API Service](./apps/api/README.md) - Backend API service
- [Dashboard](./apps/dashboard/README.md) - Web interface
- [SMTP Server](./apps/smtp/README.md) - Email server
- [SMTP API](./apps/smtp-api/README.md) - SMTP API service
- [Relay Service](./apps/relay/README.md) - Email routing
- [Queue Service](./apps/queue/README.md) - Message processing

### API Documentation

The API documentation will be available at `http://your-domain/api/docs` when running in production mode.

### Database Schema

Database schema and migrations are managed with Prisma. See `packages/database/` for schema definitions.

## 🔧 Troubleshooting

### Common Issues

#### Port 25/587 Blocked
```bash
# Test if ports are accessible
telnet your-server-ip 25
telnet your-server-ip 587

# Contact your VPS provider if connections fail
```

#### Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
docker exec -it selfmail-postgres psql -U postgres -d selfmail
```

#### SSL Certificate Issues
```bash
# Verify certificate files
ls -la certs/
openssl x509 -in certs/fullchain.pem -text -noout
```

### Service Health Checks

```bash
# Check all services status
docker-compose ps

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f smtp

# Test API health
curl http://localhost:3000/v1/health

# Test SMTP-API health  
curl http://localhost:4001/health
```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats

# Check disk space
df -h

# Monitor logs
tail -f /var/log/syslog | grep selfmail
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and read our code of conduct.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun test`
5. Lint code: `bun run check`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

For additional support and community discussions, visit our [GitHub Discussions](https://github.com/selfmail/selfmail/discussions).

