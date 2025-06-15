# POLISH - Technical Documentation

## Petrophysical Operations for Log Intelligence, Smoothing and Harmonization

### Version 1.0.0
### Last Updated: December 2024

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Core Processing Algorithms](#core-processing-algorithms)
4. [Security Implementation](#security-implementation)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Performance Specifications](#performance-specifications)
8. [Industry Standards Compliance](#industry-standards-compliance)
9. [Deployment Guide](#deployment-guide)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## System Overview

POLISH is a production-grade, enterprise-level petrophysical data preprocessing platform designed to transform raw LAS (Log ASCII Standard) files into pristine, analysis-ready datasets. The system implements advanced signal processing algorithms, comprehensive quality control, and industry-standard validation procedures.

### Key Features

- **Advanced Signal Processing**: Savitzky-Golay filtering, Hampel spike detection, wavelet denoising
- **Multi-Track Visualization**: Professional well log display with configurable tracks
- **Quality Control**: Comprehensive QC dashboard with statistical analysis
- **Format Conversion**: Support for CSV, Excel, JSON, ASCII, WITSML, SEG-Y
- **Monetization**: Secure payment processing with Stripe integration
- **Enterprise Security**: End-to-end encryption, secure file handling, audit trails

### Technical Stack

**Frontend:**
- React 18.3.1 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Recharts & Plotly.js for visualization
- Lucide React for icons

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- PostgreSQL with Prisma ORM
- Redis for caching and job queues
- Bull for background job processing

**Infrastructure:**
- Docker containerization
- AWS/GCP cloud deployment
- CDN for static assets
- Load balancing with NGINX

---

## Architecture

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Backend       │
│   (React)       │◄──►│   (NGINX)       │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   File Storage  │◄────────────┤
                       │   (S3/Local)    │             │
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │   Database      │◄────────────┤
                       │   (PostgreSQL)  │             │
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │   Cache/Queue   │◄────────────┘
                       │   (Redis)       │
                       └─────────────────┘
```

### Component Architecture

#### Frontend Components

```typescript
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx           // Main navigation and user controls
│   │   └── Sidebar.tsx          // File management and upload
│   ├── Dashboard/
│   │   ├── FileInfo.tsx         // Well metadata display
│   │   └── MultiTrackVisualization.tsx  // Professional log display
│   ├── Processing/
│   │   └── AdvancedProcessingControls.tsx  // Algorithm configuration
│   ├── QC/
│   │   └── ComprehensiveQCDashboard.tsx    // Quality control metrics
│   ├── Export/
│   │   ├── ExportModal.tsx      // Premium export interface
│   │   ├── PaymentModal.tsx     // Stripe payment integration
│   │   └── FormatConverter.tsx  // Multi-format conversion
│   └── Auth/
│       └── AuthModal.tsx        // User authentication
├── store/
│   └── index.ts                 // Zustand state management
├── types/
│   └── index.ts                 // TypeScript type definitions
└── utils/
    ├── lasParser.ts             // Client-side LAS parsing
    └── validation.ts            // Data validation utilities
```

#### Backend Services

```typescript
server/src/
├── routes/
│   ├── auth.ts                  // Authentication endpoints
│   ├── files.ts                 // File upload/management
│   ├── processing.ts            // Data processing jobs
│   ├── export.ts                // Export functionality
│   ├── conversion.ts            // Format conversion
│   └── payment.ts               // Stripe integration
├── services/
│   ├── ProcessingService.ts     // Core processing logic
│   ├── QualityController.ts     // QC analysis
│   ├── ExportService.ts         // File export handling
│   └── PaymentService.ts        // Payment processing
├── utils/
│   ├── processingAlgorithms.ts  // Signal processing algorithms
│   ├── lasParser.ts             // Server-side LAS parsing
│   ├── mnemonicStandardizer.ts  // Curve standardization
│   └── validationEngine.ts     // Physical validation
├── middleware/
│   ├── auth.ts                  // JWT authentication
│   ├── rateLimiter.ts           // API rate limiting
│   └── errorHandler.ts          // Error handling
└── database/
    ├── schema.prisma            // Database schema
    └── migrations/              // Database migrations
```

---

## Core Processing Algorithms

### 1. Savitzky-Golay Filter

**Purpose**: Smooth data while preserving signal features and reducing noise.

**Mathematical Foundation**:
The Savitzky-Golay filter fits a polynomial of degree `n` to a set of `2m+1` data points using least squares fitting.

```typescript
/**
 * Savitzky-Golay Filter Implementation
 * 
 * @param data - Input data array
 * @param windowSize - Size of the smoothing window (must be odd)
 * @param polynomialOrder - Order of the polynomial (typically 2-4)
 * @returns Smoothed data array
 */
private savitzkyGolay(
  data: number[], 
  windowSize: number, 
  polynomialOrder: number
): number[] {
  // Implementation details in processingAlgorithms.ts
}
```

**Applications in Petrophysics**:
- Gamma ray curve smoothing
- Resistivity log enhancement
- Porosity curve noise reduction

**Parameters**:
- Window Size: 5-21 points (odd numbers only)
- Polynomial Order: 2-6 (typically 3)
- Strength: 0.0-1.0 (blending factor)

### 2. Hampel Filter (Spike Detection)

**Purpose**: Detect and remove outliers while preserving geological features.

**Algorithm**:
1. Calculate median and MAD (Median Absolute Deviation) for moving window
2. Identify points exceeding threshold × MAD
3. Replace outliers using selected interpolation method

```typescript
/**
 * Hampel Filter for Spike Detection
 * 
 * @param data - Input data array
 * @param windowSize - Size of the moving window
 * @param threshold - Threshold multiplier for MAD
 * @returns Object with cleaned data and spike indices
 */
private hampelFilter(
  data: number[], 
  windowSize: number, 
  threshold: number
): {
  cleanedData: number[];
  spikeIndices: number[];
}
```

**Threshold Guidelines**:
- Conservative: 3.0 (fewer false positives)
- Standard: 2.5 (balanced approach)
- Aggressive: 2.0 (more spike detection)

### 3. PCHIP Interpolation

**Purpose**: Shape-preserving interpolation for spike replacement.

**Advantages**:
- Preserves monotonicity
- No overshoot
- Maintains physical relationships

### 4. Physical Validation Engine

**Validation Rules**:

```typescript
const physicalRanges = {
  'GR': { min: 0, max: 300 },      // API units
  'NPHI': { min: -0.15, max: 1.0 }, // Porosity fraction
  'RHOB': { min: 1.0, max: 3.5 },   // g/cm³
  'RT': { min: 0.1, max: 10000 },   // ohm-m
  'CALI': { min: 4, max: 20 },      // inches
  'SP': { min: -200, max: 50 },     // mV
  'PEF': { min: 1.0, max: 10.0 }    // barns/electron
};
```

---

## Security Implementation

### 1. File Security

**Client-Side Processing**:
- All LAS files processed locally in browser
- No file uploads to server during processing
- Files remain under user control

**Server-Side Security** (for exports/conversions):
- Encrypted file transfer (HTTPS/TLS 1.3)
- Temporary storage with automatic purging
- Access control with JWT tokens
- File integrity verification

### 2. Data Encryption

**In Transit**:
- TLS 1.3 for all communications
- Certificate pinning for API endpoints
- HSTS headers for HTTPS enforcement

**At Rest**:
- AES-256 encryption for stored files
- Encrypted database connections
- Secure key management with AWS KMS

### 3. Authentication & Authorization

**JWT Implementation**:
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  subscription: 'free' | 'basic' | 'premium' | 'enterprise';
  permissions: string[];
  iat: number;
  exp: number;
}
```

**Rate Limiting**:
- 100 requests per 15 minutes per IP
- Separate limits for authenticated users
- Progressive backoff for repeated violations

### 4. Payment Security

**Stripe Integration**:
- PCI DSS Level 1 compliance
- Tokenized payment processing
- No card data stored on servers
- Webhook signature verification

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "credits": 10
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

### File Processing Endpoints

#### POST /api/processing/process
Process a LAS file with specified algorithms.

**Request Body**:
```json
{
  "fileId": "string",
  "options": {
    "denoise": {
      "enabled": true,
      "method": "savitzky_golay",
      "windowSize": 11,
      "polynomialOrder": 3,
      "strength": 0.7
    },
    "despike": {
      "enabled": true,
      "method": "hampel",
      "threshold": 3.0,
      "windowSize": 7
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "jobId": "string",
  "estimatedTime": 30000
}
```

#### GET /api/processing/status/:jobId
Get processing job status and results.

### Export Endpoints

#### POST /api/export/las
Export processed LAS file (premium feature).

#### POST /api/conversion/convert
Convert LAS file to specified format.

---

## Database Schema

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  credits INTEGER DEFAULT 0,
  subscription VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  storage_path VARCHAR(500),
  processed BOOLEAN DEFAULT FALSE,
  quality_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Processing jobs table
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  options JSONB,
  results JSONB,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_payment_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Performance Specifications

### Processing Performance

**File Size Limits**:
- Client-side: Up to 100MB LAS files
- Server-side: Up to 1GB for premium users
- Batch processing: Up to 50 files simultaneously

**Processing Times** (typical):
- Small file (1-10MB): 5-15 seconds
- Medium file (10-50MB): 15-60 seconds
- Large file (50-100MB): 1-5 minutes

**Memory Usage**:
- Client-side: 2-4x file size in RAM
- Server-side: Optimized streaming processing
- Maximum concurrent jobs: 5 per server instance

### Scalability

**Horizontal Scaling**:
- Stateless API servers
- Redis-based session storage
- Database connection pooling
- CDN for static assets

**Load Balancing**:
- Round-robin distribution
- Health check endpoints
- Graceful shutdown handling
- Auto-scaling based on CPU/memory

---

## Industry Standards Compliance

### LAS File Standards

**Supported Versions**:
- LAS 1.2 (Legacy support)
- LAS 2.0 (Full support)
- LAS 3.0 (Full support)

**Mnemonic Standards**:
- API RP 33 (American Petroleum Institute)
- CWLS (Canadian Well Logging Society)
- Custom mapping support

### Data Quality Standards

**API Recommended Practices**:
- API RP 33: Standard Log Data Format
- API RP 40: Recommended Practices for Core Analysis
- API RP 45: Recommended Practice for Analysis of Oil-Field Waters

**Quality Metrics**:
- Data completeness (>95% for Grade A)
- Noise levels (<5% for premium quality)
- Physical validation (100% compliance)
- Depth consistency (±0.1m tolerance)

### Security Standards

**Compliance**:
- SOC 2 Type II (in progress)
- ISO 27001 (planned)
- GDPR compliance for EU users
- CCPA compliance for California users

---

## Deployment Guide

### Prerequisites

**System Requirements**:
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Docker (optional)
- SSL certificate

### Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/polish
DB_MAX_CONNECTIONS=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Storage
STORAGE_PROVIDER=s3
S3_BUCKET=polish-files
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# Security
BCRYPT_ROUNDS=12
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: polish
      POSTGRES_USER: polish
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:6-alpine
    command: redis-server --requirepass secure_password

volumes:
  postgres_data:
```

### Production Deployment Steps

1. **Server Setup**:
   ```bash
   # Install dependencies
   sudo apt update
   sudo apt install nodejs npm postgresql redis-server nginx
   
   # Clone repository
   git clone https://github.com/your-org/polish.git
   cd polish
   ```

2. **Database Setup**:
   ```bash
   # Create database
   sudo -u postgres createdb polish
   
   # Run migrations
   npm run migrate
   ```

3. **SSL Configuration**:
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Obtain certificate
   sudo certbot --nginx -d your-domain.com
   ```

4. **Process Management**:
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

---

## Monitoring & Maintenance

### Health Monitoring

**Endpoints**:
- `/health` - Basic health check
- `/health/detailed` - Comprehensive system status
- `/metrics` - Prometheus metrics

**Key Metrics**:
- Response time (p95 < 500ms)
- Error rate (< 1%)
- Memory usage (< 80%)
- Database connections (< 80% of pool)

### Logging

**Log Levels**:
- ERROR: System errors, failed requests
- WARN: Performance issues, validation failures
- INFO: User actions, processing completion
- DEBUG: Detailed execution flow

**Log Format**:
```json
{
  "timestamp": "2024-12-07T10:30:00.000Z",
  "level": "INFO",
  "message": "File processing completed",
  "userId": "user_123",
  "fileId": "file_456",
  "processingTime": 15000,
  "qualityScore": 87.5
}
```

### Backup Strategy

**Database Backups**:
- Daily automated backups
- Point-in-time recovery capability
- Cross-region replication for disaster recovery

**File Backups**:
- Versioned storage in S3
- Lifecycle policies for cost optimization
- Regular restore testing

### Performance Optimization

**Database Optimization**:
- Query optimization with EXPLAIN ANALYZE
- Index maintenance and monitoring
- Connection pooling configuration

**Caching Strategy**:
- Redis for session storage
- CDN for static assets
- Application-level caching for expensive operations

---

## Support & Maintenance

### Issue Tracking

**Bug Reports**: Include system information, error logs, and reproduction steps
**Feature Requests**: Provide business justification and technical requirements
**Security Issues**: Report via secure channel with encryption

### Update Procedures

**Regular Updates**:
- Security patches: Within 24 hours
- Bug fixes: Weekly releases
- Feature updates: Monthly releases

**Emergency Procedures**:
- Rollback capability within 5 minutes
- Hot-fix deployment process
- Incident response team activation

---

## Conclusion

POLISH represents a comprehensive solution for petrophysical data preprocessing, combining advanced algorithms with enterprise-grade security and scalability. The system is designed to meet the demanding requirements of the oil and gas industry while providing a user-friendly interface for both technical and non-technical users.

For technical support or additional documentation, please contact the development team or refer to the API documentation at `/api/docs`.

---

**Document Version**: 1.0.0  
**Last Updated**: December 7, 2024  
**Next Review**: March 7, 2025