# C4 Model - Deployment Architecture

## Plain English Summary

This document shows how AIOS actually runs in the real world. It covers where each piece lives: the mobile app runs on users' phones (iOS or Android), the backend API runs on a server (like Replit, AWS, or a self-hosted machine), and the database runs alongside the API or on a separate database server. We also show the development environment where developers work on the code locally. Think of it as a map showing the physical (or virtual) locations of all the software components when they're actually running.

## Technical Detail

### Production Deployment Diagram

```mermaid
graph TB
    subgraph "User Devices"
        iOS[iPhone/iPad<br/>iOS 13+<br/>----<br/>AIOS Mobile App<br/>React Native bundle]
        Android[Android Phone/Tablet<br/>Android 10+<br/>----<br/>AIOS Mobile App<br/>React Native bundle]
    end
    
    subgraph "Application Server (Node.js)"
        AppServer[Application Server<br/>Node.js 18+<br/>----<br/>Express API<br/>Port 5000]
        StaticFiles[Static Assets<br/>----<br/>Expo web build<br/>Images, fonts]
    end
    
    subgraph "Database Server"
        PostgreSQL[(PostgreSQL 14+<br/>----<br/>Primary database<br/>Port 5432)]
        PGBackup[(Backup Storage<br/>----<br/>Daily backups<br/>Point-in-time recovery)]
    end
    
    subgraph "External Services"
        EmailSMTP[Email Servers<br/>SMTP/IMAP<br/>Port 587/993]
        CloudStorage[Cloud Storage<br/>S3/equivalent<br/>Photos, attachments]
    end
    
    iOS -->|HTTPS<br/>REST API<br/>443| AppServer
    Android -->|HTTPS<br/>REST API<br/>443| AppServer
    
    AppServer -->|SQL<br/>Drizzle ORM<br/>5432| PostgreSQL
    AppServer -.->|Future<br/>SMTP| EmailSMTP
    AppServer -.->|Future<br/>HTTPS| CloudStorage
    
    PostgreSQL -->|Backup job<br/>pg_dump| PGBackup
    
    style iOS fill:#50E3C2,stroke:#2E8B7A,stroke-width:2px
    style Android fill:#50E3C2,stroke:#2E8B7A,stroke-width:2px
    style AppServer fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style StaticFiles fill:#F5A623,stroke:#C77E0A,stroke-width:2px
    style PostgreSQL fill:#7ED321,stroke:#5FA319,stroke-width:3px,color:#fff
    style PGBackup fill:#7ED321,stroke:#5FA319,stroke-width:2px,color:#fff
    style EmailSMTP fill:#E8E8E8,stroke:#999,stroke-width:2px
    style CloudStorage fill:#E8E8E8,stroke:#999,stroke-width:2px
```

### Development Environment Diagram

```mermaid
graph TB
    subgraph "Developer Machine"
        DevEnv[Development Environment<br/>macOS/Linux/Windows<br/>----<br/>VS Code, Git<br/>Node.js 18+]
        
        ExpoServer[Expo Dev Server<br/>Metro bundler<br/>----<br/>Port 8081<br/>Hot reload enabled]
        
        LocalAPI[Local API Server<br/>tsx watch mode<br/>----<br/>Port 5000<br/>Auto-restart on changes]
        
        LocalDB[(Local PostgreSQL<br/>or Docker container<br/>----<br/>Port 5432)]
        
        DevEnv --> ExpoServer
        DevEnv --> LocalAPI
        LocalAPI --> LocalDB
    end
    
    subgraph "Test Devices"
        iOSSim[iOS Simulator<br/>Xcode]
        AndroidEmu[Android Emulator<br/>Android Studio]
        PhysicalDevice[Physical Device<br/>Connected or<br/>same network]
    end
    
    ExpoServer -->|Expo Go app<br/>or Dev Client<br/>LAN/USB| iOSSim
    ExpoServer -->|Expo Go app<br/>or Dev Client<br/>LAN/USB| AndroidEmu
    ExpoServer -->|Expo Go app<br/>or Dev Client<br/>LAN/USB| PhysicalDevice
    
    iOSSim -->|HTTP<br/>localhost:5000| LocalAPI
    AndroidEmu -->|HTTP<br/>10.0.2.2:5000| LocalAPI
    PhysicalDevice -->|HTTP<br/>192.168.x.x:5000| LocalAPI
    
    style DevEnv fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style ExpoServer fill:#F5A623,stroke:#C77E0A,stroke-width:2px
    style LocalAPI fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style LocalDB fill:#7ED321,stroke:#5FA319,stroke-width:2px,color:#fff
    style iOSSim fill:#50E3C2,stroke:#2E8B7A,stroke-width:2px
    style AndroidEmu fill:#50E3C2,stroke:#2E8B7A,stroke-width:2px
    style PhysicalDevice fill:#50E3C2,stroke:#2E8B7A,stroke-width:2px
```

### Deployment Details

---

## Production Deployment

### User Devices

#### iOS Devices (iPhone/iPad)

**Requirements:**
- iOS 13.0 or later
- Internet connection (WiFi or cellular)
- ~100 MB storage for app
- Camera, contacts, photo library permissions

**App Distribution:**
- App Store (production)
- TestFlight (beta testing)
- Enterprise distribution (internal)

**App Installation:**
```
1. User downloads from App Store
2. iOS extracts and installs app bundle
3. App requests permissions (camera, contacts, etc.)
4. User opens app
5. App loads from local storage
```

**Runtime Environment:**
- JavaScriptCore (iOS JS engine)
- Native modules bridged via React Native
- AsyncStorage → iOS UserDefaults
- File system → iOS Documents directory

**Network Configuration:**
- HTTPS to production API endpoint
- Certificate pinning (recommended)
- Handles cellular and WiFi transitions
- Offline mode via AsyncStorage cache

#### Android Devices

**Requirements:**
- Android 10 (API 29) or later
- Internet connection (WiFi or cellular)
- ~100 MB storage for app
- Camera, contacts, storage permissions

**App Distribution:**
- Google Play Store (production)
- Internal testing track (beta)
- APK sideloading (internal)

**App Installation:**
```
1. User downloads from Play Store
2. Android installs APK
3. App requests permissions at runtime
4. User opens app
5. App loads from local storage
```

**Runtime Environment:**
- Hermes JS engine (or JSC)
- Native modules bridged via React Native
- AsyncStorage → Android SharedPreferences
- File system → Android app-specific storage

**Network Configuration:**
- HTTPS to production API endpoint
- Respects Android network security config
- Handles network changes
- Offline mode via AsyncStorage cache

### Application Server

**Infrastructure Options:**

#### Option 1: Replit (Current Development)
```
Platform: Replit (Linux container)
Node.js: v18+
Process: Persistent Node process
Port: 5000 (mapped externally)
Domain: *.replit.dev (or custom)
SSL: Automatic (Replit-provided)
Database: External PostgreSQL or Replit DB
```

**Pros:**
- Zero infrastructure management
- Automatic HTTPS
- Easy deployment (git push)
- Built-in environment variables

**Cons:**
- Resource limits
- Cold starts on free tier
- Less control over infrastructure

#### Option 2: Cloud Platform (AWS, GCP, Azure)
```
Platform: AWS EC2 / GCP Compute / Azure VM
OS: Ubuntu 22.04 LTS
Node.js: v18+ (via nvm or package manager)
Process Manager: PM2 or systemd
Port: 5000 (behind reverse proxy)
Reverse Proxy: Nginx or Caddy
SSL: Let's Encrypt via Certbot
Database: Managed PostgreSQL (RDS/Cloud SQL/Azure DB)
```

**Deployment:**
```bash
# On server
git pull origin main
npm install --production
npm run server:build
pm2 restart aios-api
```

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.aios.example.com;

    ssl_certificate /etc/letsencrypt/live/api.aios.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.aios.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Option 3: Container Orchestration (Docker/Kubernetes)
```
Platform: Kubernetes cluster (EKS, GKE, AKS) or Docker Swarm
Container: aios-api:latest (Node.js + app)
Replicas: 2-3 (for HA)
Load Balancer: Cloud LB or Ingress controller
Database: Managed PostgreSQL
Monitoring: Prometheus + Grafana
```

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run server:build
EXPOSE 5000
CMD ["npm", "run", "server:prod"]
```

**Kubernetes Deployment (example):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aios-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aios-api
  template:
    metadata:
      labels:
        app: aios-api
    spec:
      containers:
      - name: api
        image: aios-api:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: aios-secrets
              key: database-url
```

### Database Server

**Production Configuration:**

#### Managed PostgreSQL (Recommended)
```
Provider: AWS RDS, GCP Cloud SQL, Azure Database, or Supabase
Version: PostgreSQL 14 or later
Instance Type: t3.small (or equivalent) for <1000 users
Storage: 20 GB SSD, auto-scaling enabled
Backups: Automated daily, 7-day retention
Multi-AZ: Yes (for high availability)
Encryption: At rest and in transit
```

**Connection:**
```
DATABASE_URL=postgresql://username:password@db.example.com:5432/aios?sslmode=require
```

**Security:**
- SSL/TLS required
- Firewall rules: Allow only app server IPs
- Strong password or IAM authentication
- Principle of least privilege (dedicated user)

#### Self-Hosted PostgreSQL
```
OS: Ubuntu 22.04 LTS
PostgreSQL: 14+ (via apt)
Configuration: /etc/postgresql/14/main/postgresql.conf
Data Directory: /var/lib/postgresql/14/main
Port: 5432 (not exposed publicly)
```

**Setup:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE aios;
CREATE USER aios_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE aios TO aios_user;

# Configure pg_hba.conf for app server access
# /etc/postgresql/14/main/pg_hba.conf
# host    aios    aios_user    10.0.1.0/24    scram-sha-256

sudo systemctl restart postgresql
```

**Backup Strategy:**
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR=/backups/postgresql
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U aios_user -h localhost aios | gzip > $BACKUP_DIR/aios_$DATE.sql.gz

# Retention: Keep 7 daily, 4 weekly, 12 monthly
find $BACKUP_DIR -name "aios_*.sql.gz" -mtime +7 -delete
```

### Monitoring & Logging

**Application Monitoring:**
- Health check endpoint: `GET /status`
- Metrics: Request count, response time, error rate
- Tools: New Relic, Datadog, or custom Prometheus

**Database Monitoring:**
- Connection pool usage
- Query performance
- Disk space, IOPS
- Tools: pgAdmin, DataGrip, or cloud provider tools

**Logging:**
```javascript
// server/index.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

**Log Aggregation:**
- CloudWatch Logs (AWS)
- Stackdriver (GCP)
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Papertrail or Logtail

---

## Development Environment

### Developer Machine Setup

**Prerequisites:**
```bash
# 1. Install Node.js 18+
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 2. Install Git
# (macOS: Xcode Command Line Tools)
xcode-select --install
# (Linux)
sudo apt install git

# 3. Clone repository
git clone https://github.com/your-org/aios.git
cd aios

# 4. Install dependencies
npm install

# 5. Setup environment variables
cp .env.example .env
# Edit .env with local database URL
```

**Environment Variables (`.env`):**
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/aios_dev

# JWT Secret (development only)
JWT_SECRET=dev_secret_change_in_production

# API Port
PORT=5000

# Expo
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### Local Database Setup

**Option 1: Native PostgreSQL**
```bash
# macOS (Homebrew)
brew install postgresql@14
brew services start postgresql@14
createdb aios_dev

# Linux (Ubuntu)
sudo apt install postgresql
sudo -u postgres createdb aios_dev

# Create schema
npm run db:push
```

**Option 2: Docker**
```bash
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: aios_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# Start database
docker-compose up -d

# Initialize schema
npm run db:push
```

### Running Development Servers

**Terminal 1: Backend API**
```bash
npm run server:dev
# Output:
# Server running on port 5000
# Database connected
```

**Terminal 2: Expo Dev Server**
```bash
npm run start
# Or for Expo Go:
npm run expo:dev

# Output:
# › Metro waiting on exp://192.168.1.100:8081
# › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**Terminal 3: TypeScript Watching (Optional)**
```bash
npm run check:types -- --watch
```

### Testing on Devices

#### iOS Simulator (macOS only)
```bash
# Install Xcode from Mac App Store
# Open Simulator
open -a Simulator

# In Expo dev server terminal, press 'i'
# Or:
npm run start
# Then press 'i' when prompted
```

#### Android Emulator
```bash
# Install Android Studio
# Create AVD (Android Virtual Device)

# Start emulator
~/Library/Android/sdk/emulator/emulator -avd Pixel_4_API_30

# In Expo dev server terminal, press 'a'
# Or:
npm run start
# Then press 'a' when prompted
```

#### Physical Device (Expo Go)
```bash
# 1. Install Expo Go from App Store (iOS) or Play Store (Android)
# 2. Ensure device on same WiFi as dev machine
# 3. Scan QR code from Expo dev server terminal
# 4. App loads and connects to local API
```

**Network Configuration:**
- iOS Simulator: Uses `localhost:5000`
- Android Emulator: Uses `10.0.2.2:5000` (emulator loopback)
- Physical Device: Uses `192.168.x.x:5000` (LAN IP)

**Troubleshooting:**
```bash
# Check local network IP
# macOS/Linux:
ifconfig | grep "inet "
# Windows:
ipconfig

# Update EXPO_PUBLIC_API_URL if needed
export EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
npm run start
```

### Development Workflow

```
1. Create feature branch: git checkout -b feature/new-feature
2. Make changes to client/ or server/
3. Changes hot-reload in Expo (client) or auto-restart (server via tsx)
4. Test on simulator/emulator
5. Run tests: npm test
6. Check types: npm run check:types
7. Lint: npm run lint
8. Commit: git commit -m "Add new feature"
9. Push: git push origin feature/new-feature
10. Create PR on GitHub
```

## Assumptions

1. **Single region deployment**: No multi-region or CDN distribution (yet)
2. **Vertical scaling**: Scale by upgrading server instance, not horizontal scaling (yet)
3. **Single database instance**: No read replicas or sharding
4. **HTTPS in production**: All production deployments use SSL/TLS
5. **HTTP in development**: Local development uses unencrypted HTTP
6. **Same-origin API**: Mobile app and API on same domain or CORS configured
7. **Managed database preferred**: Production uses cloud provider's managed PostgreSQL
8. **No CI/CD pipeline**: Manual deployment process (can be improved)
9. **Environment variables for config**: No config files, all via environment variables
10. **Mobile app updates via stores**: No over-the-air (OTA) updates configured

## Failure Modes

### Server Hardware Failure

**Problem**: Physical or virtual server hosting API crashes or becomes unresponsive.

**Impact:**
- API unavailable
- Users cannot sync data
- New logins fail
- App works offline only

**Symptoms:**
- HTTP timeout errors
- "Cannot connect to server"
- Health check fails

**Mitigation:**
- Use managed platform with auto-restart (Replit, cloud platform)
- Multi-instance deployment (load balancer + 2+ instances)
- Health checks with automatic failover
- Monitoring alerts

**Recovery:**
- Automatic: Platform restarts instance
- Manual: SSH in and restart service
- Fallback: Deploy to backup server

### Database Server Failure

**Problem**: PostgreSQL server crashes, disk failure, or data corruption.

**Impact:**
- Complete service outage
- Data potentially lost if no backups
- Long recovery time

**Symptoms:**
- API returns 500 errors
- Database connection errors in logs
- Cannot read/write any data

**Mitigation:**
- Automated backups (daily, retained 7-30 days)
- Multi-AZ deployment (cloud managed DB)
- Replication (primary + standby)
- Regular backup testing

**Recovery:**
1. Attempt to restart database service
2. If corruption, restore from latest backup
3. Replay transaction logs (point-in-time recovery)
4. Notify users of potential data loss window

**RTO (Recovery Time Objective):** 1-4 hours  
**RPO (Recovery Point Objective):** Up to 24 hours (daily backups)

### Network Partition

**Problem**: Network connectivity lost between app server and database server.

**Impact:**
- API can't read/write data
- Users see errors
- Service effectively down

**Symptoms:**
- Database connection timeouts
- "Cannot connect to database" logs
- API health check fails

**Mitigation:**
- Place app server and database in same VPC/network
- Use private networking (not public internet)
- Connection pooling with retry logic
- Monitor network latency

**Recovery:**
- Network infrastructure typically recovers automatically
- Check firewall rules
- Verify security groups allow traffic

### SSL Certificate Expiration

**Problem**: HTTPS certificate expires.

**Impact:**
- Mobile apps cannot connect (certificate validation fails)
- Users see "insecure connection" errors
- Service effectively down for mobile users

**Symptoms:**
- SSL handshake errors
- "Certificate expired" in logs/browser
- Mobile app network requests fail

**Mitigation:**
- Use automatic renewal (Let's Encrypt, cloud provider)
- Set expiration alerts (30, 7, 1 days before)
- Monitor certificate validity daily

**Recovery:**
- Renew certificate immediately
- Restart web server (Nginx, Caddy)
- Test from mobile devices

### Out of Disk Space

**Problem**: Server or database runs out of disk space.

**Impact:**
- Cannot write logs
- Cannot write to database
- App crashes or errors

**Symptoms:**
- "No space left on device" errors
- Write operations fail
- Log files stop growing

**Mitigation:**
- Set disk space alerts (80%, 90% usage)
- Log rotation (delete old logs)
- Database cleanup (archived data)
- Auto-scaling storage (cloud managed disk)

**Recovery:**
1. Delete old log files
2. Clean up temp files
3. Archive old database data
4. Expand disk size

### Cold Start Latency

**Problem**: After inactivity, first request takes very long (serverless/Replit).

**Impact:**
- Poor user experience
- Perceived as "app broken"
- Timeout errors

**Symptoms:**
- First request after idle period takes 10-30 seconds
- Subsequent requests fast

**Mitigation:**
- Keep-alive ping (health check every 5 minutes)
- Warm-up requests on deploy
- Use dedicated server (not serverless)
- Display loading indicator in app

**Recovery:**
- Wait for cold start to complete
- Retry request
- Subsequent requests will be fast

### Version Incompatibility

**Problem**: Mobile app version doesn't match API version.

**Impact:**
- API errors
- Data validation failures
- Missing features or broken UI

**Symptoms:**
- Schema validation errors (Zod)
- Unexpected API responses
- "Unsupported version" errors

**Mitigation:**
- API versioning (/api/v1/, /api/v2/)
- Backward compatibility for N-1 version
- Forced update mechanism in app
- Gradual rollout of breaking changes

**Recovery:**
- Users update mobile app from store
- Server maintains backward compatibility during transition
- Clear communication about required updates

## How to Verify

### Production Deployment

```bash
# 1. Check API is accessible
curl https://api.aios.example.com/status
# Expected: {"status":"ok","timestamp":"..."}

# 2. Verify SSL certificate
openssl s_client -connect api.aios.example.com:443 -servername api.aios.example.com < /dev/null 2>/dev/null | openssl x509 -noout -dates

# 3. Test authentication flow
curl -X POST https://api.aios.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# 4. Check database connectivity (from app server)
psql $DATABASE_URL -c "SELECT NOW();"

# 5. Verify HTTPS redirect
curl -I http://api.aios.example.com
# Should return 301/302 to https://

# 6. Check logs
tail -f /var/log/aios/combined.log
# Or cloud logging dashboard
```

### Development Environment

```bash
# 1. Verify Node.js version
node --version  # Should be 18+

# 2. Check dependencies installed
ls node_modules/ | wc -l  # Should be many

# 3. Verify database is running
psql -h localhost -U postgres -d aios_dev -c "SELECT 1;"

# 4. Start backend and check health
npm run server:dev &
sleep 3
curl http://localhost:5000/status
kill %1

# 5. Start Expo dev server
npm run start &
sleep 10
curl http://localhost:8081/status
kill %1

# 6. Check environment variables
cat .env | grep -v "^#"

# 7. Verify schema is up to date
npm run db:push
# Should say "No schema changes"
```

### Mobile App Deployment

```bash
# 1. Build production app (iOS)
eas build --platform ios --profile production

# 2. Build production app (Android)
eas build --platform android --profile production

# 3. Submit to App Store (iOS)
eas submit --platform ios

# 4. Submit to Play Store (Android)
eas submit --platform android

# 5. Verify app connects to production API
# (Manual test on physical device after install)
```

### Database Backup Verification

```bash
# 1. Check last backup timestamp
ls -lh /backups/postgresql/ | tail -1

# 2. Test restore (to separate database)
gunzip -c /backups/postgresql/aios_20250117.sql.gz | psql -h localhost -U postgres -d aios_test

# 3. Verify data integrity
psql -h localhost -U postgres -d aios_test -c "SELECT COUNT(*) FROM users;"

# 4. Cleanup test database
dropdb aios_test
```

### Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API endpoint (1000 requests, 10 concurrent)
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  https://api.aios.example.com/api/notes

# Results to check:
# - Requests per second (should be >100 for simple endpoints)
# - Failed requests (should be 0)
# - 95th percentile latency (should be <500ms)
```

### Monitoring Checks

```bash
# 1. Verify health check endpoint responds
curl https://api.aios.example.com/status

# 2. Check database connections
# (Cloud provider dashboard or pg_stat_activity)

# 3. Review error logs
grep -i error /var/log/aios/error.log | tail -20

# 4. Check disk space
df -h

# 5. Check memory usage
free -h

# 6. Check CPU usage
top -bn1 | head -20
```

## Related Documentation

- [System Context](./system_context.md) - High-level system overview
- [Container Diagram](./container.md) - Application architecture
- [Component Diagram](./component.md) - Internal component structure
- [C4 Overview](./README.md) - How to read C4 diagrams
- [SECURITY.md](/SECURITY.md) - Security policies and practices
- [CONTRIBUTING.md](/CONTRIBUTING.md) - Development workflow
- [../../technical/deployment.md](../../technical/deployment.md) - Detailed deployment guide (if exists)

## References

- Expo Deployment: https://docs.expo.dev/distribution/introduction/
- Express Production Best Practices: https://expressjs.com/en/advanced/best-practice-production.html
- PostgreSQL High Availability: https://www.postgresql.org/docs/current/high-availability.html
- AWS RDS Best Practices: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html
- Docker Multi-stage Builds: https://docs.docker.com/build/building/multi-stage/
- Kubernetes Deployments: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
