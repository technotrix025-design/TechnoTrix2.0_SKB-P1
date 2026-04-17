# 🛠️ EcoTrack AI - Technical Implementation Guide

## Complete Developer Documentation

---

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack Details](#tech-stack-details)
3. [Database Schema](#database-schema)
4. [API Integration](#api-integration)
5. [AI/ML Components](#aiml-components)
6. [Frontend Architecture](#frontend-architecture)
7. [Deployment Guide](#deployment-guide)
8. [Performance Optimization](#performance-optimization)
9. [Security Best Practices](#security-best-practices)
10. [Testing Strategy](#testing-strategy)

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER INTERFACE                       │
│  React + TypeScript + Tailwind + React Router + Motion  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  API LAYER (Next.js)                     │
│              REST APIs + Server Actions                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌───────────┐  ┌──────────┐  ┌────────────┐
│ PostgreSQL│  │   AI/ML  │  │  External  │
│  Database │  │ Services │  │    APIs    │
│  (Prisma) │  │  GPT-4   │  │  Climatiq  │
└───────────┘  └──────────┘  └────────────┘
```

### Data Flow: Document Ingestion

```
1. User uploads PDF/Image
   ↓
2. Frontend sends to /api/ingest endpoint
   ↓
3. Server calls GPT-4 Vision API
   ↓
4. Extract structured data (kWh, location, vendor)
   ↓
5. Call Climatiq API for emission factors
   ↓
6. Calculate CO₂e = activity × emission factor
   ↓
7. Save to PostgreSQL via Prisma
   ↓
8. Return real-time response to frontend
   ↓
9. Dashboard auto-updates (WebSocket/polling)
```

---

## 💻 Tech Stack Details

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router": "7.13.0",
    "typescript": "5.x",
    "tailwindcss": "4.1.12",
    "motion": "12.23.24",
    "recharts": "2.15.2",
    "lucide-react": "0.487.0",
    "@radix-ui/react-*": "latest",
    "sonner": "2.0.3"
  }
}
```

### Backend Dependencies (Proposed)

```json
{
  "dependencies": {
    "next": "14.x",
    "@prisma/client": "latest",
    "openai": "latest",
    "axios": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "prisma": "latest"
  }
}
```

---

## 🗄️ Database Schema

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// CORE ENTITIES
// ==========================================

model Organization {
  id                String            @id @default(uuid())
  name              String
  industry          String
  headquarters      String
  employeeCount     Int?
  targetNetZeroYear Int?
  fiscalYearEnd     String?
  
  // Relationships
  users             User[]
  facilities        Facility[]
  suppliers         Supplier[]
  emissions         EmissionRecord[]
  reports           Report[]
  targets           EmissionTarget[]
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([name])
}

// ==========================================
// USER MANAGEMENT
// ==========================================

model User {
  id             String       @id @default(uuid())
  email          String       @unique
  passwordHash   String
  name           String
  role           Role         @default(MANAGER)
  department     String?
  
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@index([email])
  @@index([organizationId])
}

enum Role {
  ADMIN
  MANAGER
  AUDITOR
  VIEWER
}

// ==========================================
// FACILITIES (Scope 1 & 2)
// ==========================================

model Facility {
  id             String           @id @default(uuid())
  name           String
  location       String
  address        String?
  type           FacilityType
  size           Float?           // Square meters
  
  organizationId String
  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  emissions      EmissionRecord[]
  
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  @@index([organizationId])
  @@index([type])
}

enum FacilityType {
  MANUFACTURING
  OFFICE
  WAREHOUSE
  DATACENTER
  RETAIL
}

// ==========================================
// SUPPLIERS (Scope 3)
// ==========================================

model Supplier {
  id             String           @id @default(uuid())
  name           String
  category       String
  location       String?
  contactEmail   String?
  website        String?
  
  // ESG Scoring
  esgScore       Int              @default(0)
  environmental  Int              @default(0)
  social         Int              @default(0)
  governance     Int              @default(0)
  
  dataQuality    DataQuality      @default(ESTIMATED)
  certifications String[]
  lastAuditDate  DateTime?
  
  organizationId String
  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  emissions      EmissionRecord[]
  
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  @@index([organizationId])
  @@index([esgScore])
}

enum DataQuality {
  PRIMARY_VERIFIED   // Actual vendor data
  INDUSTRY_AVERAGE   // Climatiq/EPA estimates
  ESTIMATED          // Spend-based guesses
}

// ==========================================
// EMISSION RECORDS (The Ledger)
// ==========================================

model EmissionRecord {
  id               String        @id @default(uuid())
  dateRecorded     DateTime
  scope            ScopeType
  category         String        // e.g., "Purchased Electricity", "Business Travel"
  subcategory      String?
  
  // Input Data
  activityValue    Float         // e.g., 1500
  activityUnit     String        // e.g., "kWh", "liters", "USD"
  
  // Calculated Output
  calculatedCO2e   Float         // Measured in metric tons (tCO₂e)
  emissionFactor   Float         // The factor used
  emissionFactorId String?       // Reference to external database
  dataSource       String        // "Climatiq", "EPA", "DEFRA", etc.
  
  // Document Metadata (for AI ingestion)
  sourceDocument   String?       // Original filename
  extractionMethod String?       // "AI_OCR", "MANUAL", "API"
  confidence       Float?        // AI extraction confidence (0-1)
  
  // Relations
  facilityId       String?
  facility         Facility?     @relation(fields: [facilityId], references: [id], onDelete: SetNull)
  
  supplierId       String?
  supplier         Supplier?     @relation(fields: [supplierId], references: [id], onDelete: SetNull)
  
  organizationId   String
  organization     Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  
  @@index([organizationId])
  @@index([scope])
  @@index([dateRecorded])
  @@index([facilityId])
  @@index([supplierId])
}

enum ScopeType {
  SCOPE_1  // Direct emissions
  SCOPE_2  // Indirect energy
  SCOPE_3  // Value chain
}

// ==========================================
// EMISSION TARGETS
// ==========================================

model EmissionTarget {
  id               String       @id @default(uuid())
  name             String
  targetYear       Int
  baselineYear     Int
  baselineValue    Float        // tCO₂e
  targetValue      Float        // tCO₂e
  reductionPercent Float
  scope            ScopeType?   // null = all scopes
  
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  
  @@index([organizationId])
}

// ==========================================
// REPORTS
// ==========================================

model Report {
  id               String       @id @default(uuid())
  name             String
  reportType       String       // "ESG_SUMMARY", "CARBON_INVENTORY", "COMPLIANCE"
  framework        String       // "GRI", "CSRD", "BRSR", etc.
  period           String       // "Q2 2026", "FY 2025-26"
  status           ReportStatus @default(DRAFT)
  
  fileUrl          String?
  fileSize         Int?         // bytes
  pageCount        Int?
  
  generatedAt      DateTime?
  submittedAt      DateTime?
  
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  
  @@index([organizationId])
  @@index([status])
}

enum ReportStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  SUBMITTED
  APPROVED
}

// ==========================================
// AUDIT TRAIL
// ==========================================

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   // "CREATE", "UPDATE", "DELETE"
  entity    String   // "EmissionRecord", "Supplier", etc.
  entityId  String
  changes   Json     // Store old and new values
  timestamp DateTime @default(now())
  
  @@index([userId])
  @@index([timestamp])
}
```

### Database Migrations

```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed
```

---

## 🔌 API Integration

### Climatiq API Integration

```typescript
// lib/climatiq.ts

import axios from 'axios';

const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;
const CLIMATIQ_BASE_URL = 'https://api.climatiq.io/v1';

interface EmissionRequest {
  activityValue: number;
  activityUnit: string;
  emissionCategory: string;
  region: string;
  year: number;
}

interface EmissionResponse {
  co2e: number;
  emissionFactor: number;
  emissionFactorId: string;
  unit: string;
}

export async function calculateEmissions(
  data: EmissionRequest
): Promise<EmissionResponse> {
  try {
    const response = await axios.post(
      `${CLIMATIQ_BASE_URL}/estimate`,
      {
        emission_factor: {
          activity_id: data.emissionCategory,
          source: 'EPA',
          region: data.region,
          year: data.year,
        },
        parameters: {
          [data.activityUnit]: data.activityValue,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CLIMATIQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      co2e: response.data.co2e,
      emissionFactor: response.data.emission_factor.factor,
      emissionFactorId: response.data.emission_factor.id,
      unit: response.data.co2e_unit,
    };
  } catch (error) {
    console.error('Climatiq API error:', error);
    throw new Error('Failed to calculate emissions');
  }
}

// Example Usage
const result = await calculateEmissions({
  activityValue: 45800,
  activityUnit: 'kWh',
  emissionCategory: 'electricity-energy_source_grid_mix',
  region: 'IN',
  year: 2026,
});
// Returns: { co2e: 38.64, emissionFactor: 0.84, ... }
```

### GPT-4 Vision API for Document Parsing

```typescript
// lib/ai-parser.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedData {
  documentType: string;
  vendor?: string;
  location?: string;
  period?: string;
  energyUsage?: number;
  energyUnit?: string;
  fuelConsumption?: number;
  fuelUnit?: string;
  cost?: number;
  currency?: string;
}

export async function parseDocument(
  imageBase64: string
): Promise<ExtractedData> {
  const prompt = `
You are an expert at extracting data from utility bills and invoices.
Analyze this document and extract the following information in JSON format:

{
  "documentType": "Electricity Invoice" | "Fuel Receipt" | "Supplier Invoice",
  "vendor": "Company name",
  "location": "Facility location",
  "period": "Billing period (e.g., June 2026)",
  "energyUsage": number (if electricity bill),
  "energyUnit": "kWh" | "MWh",
  "fuelConsumption": number (if fuel receipt),
  "fuelUnit": "liters" | "gallons",
  "cost": total cost as number,
  "currency": "INR" | "USD" | "EUR"
}

Return ONLY valid JSON. If a field is not found, use null.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to parse document');
  }
}
```

### Next.js API Route: Document Ingestion

```typescript
// app/api/ingest/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/ai-parser';
import { calculateEmissions } from '@/lib/climatiq';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Step 1: AI Document Parsing
    const extractedData = await parseDocument(base64);

    // Step 2: Calculate Emissions
    let emissionData;
    if (extractedData.energyUsage) {
      emissionData = await calculateEmissions({
        activityValue: extractedData.energyUsage,
        activityUnit: extractedData.energyUnit || 'kWh',
        emissionCategory: 'electricity-energy_source_grid_mix',
        region: 'IN',
        year: new Date().getFullYear(),
      });
    }

    // Step 3: Save to Database
    const record = await prisma.emissionRecord.create({
      data: {
        organizationId,
        dateRecorded: new Date(),
        scope: 'SCOPE_2',
        category: 'Purchased Electricity',
        activityValue: extractedData.energyUsage || 0,
        activityUnit: extractedData.energyUnit || 'kWh',
        calculatedCO2e: emissionData?.co2e || 0,
        emissionFactor: emissionData?.emissionFactor || 0,
        emissionFactorId: emissionData?.emissionFactorId,
        dataSource: 'Climatiq API v1.5',
        sourceDocument: file.name,
        extractionMethod: 'AI_OCR',
        confidence: 0.95,
      },
    });

    return NextResponse.json({
      success: true,
      record,
      extractedData,
      emissionData,
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
```

---

## 🧠 AI/ML Components

### Emission Forecasting Model

```python
# ml/forecasting.py

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

class EmissionForecaster:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    def prepare_data(self, emission_records):
        """Convert emission records to time series features"""
        df = pd.DataFrame(emission_records)
        df['date'] = pd.to_datetime(df['dateRecorded'])
        df = df.set_index('date')
        
        # Feature engineering
        df['month'] = df.index.month
        df['quarter'] = df.index.quarter
        df['dayofweek'] = df.index.dayofweek
        df['lag_1'] = df['calculatedCO2e'].shift(1)
        df['lag_7'] = df['calculatedCO2e'].shift(7)
        df['rolling_mean_7'] = df['calculatedCO2e'].rolling(7).mean()
        
        return df.dropna()
    
    def train(self, historical_data):
        """Train the forecasting model"""
        df = self.prepare_data(historical_data)
        
        X = df[['month', 'quarter', 'dayofweek', 'lag_1', 'lag_7', 'rolling_mean_7']]
        y = df['calculatedCO2e']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        score = self.model.score(X_test, y_test)
        
        return score
    
    def forecast(self, periods=6):
        """Forecast emissions for next N periods"""
        predictions = []
        confidence_intervals = []
        
        for i in range(periods):
            # Predict next value
            pred = self.model.predict(X_next)
            predictions.append(pred[0])
            
            # Calculate confidence interval (simplified)
            std = np.std(predictions)
            lower = pred[0] - 1.96 * std
            upper = pred[0] + 1.96 * std
            confidence_intervals.append((lower, upper))
        
        return {
            'predictions': predictions,
            'confidence_intervals': confidence_intervals
        }
```

### Anomaly Detection

```python
# ml/anomaly_detection.py

from sklearn.ensemble import IsolationForest
import numpy as np

class AnomalyDetector:
    def __init__(self, contamination=0.1):
        self.model = IsolationForest(contamination=contamination, random_state=42)
    
    def fit(self, emission_data):
        """Train anomaly detection model"""
        X = np.array(emission_data).reshape(-1, 1)
        self.model.fit(X)
    
    def detect(self, new_data):
        """Detect if new data point is an anomaly"""
        X = np.array(new_data).reshape(-1, 1)
        predictions = self.model.predict(X)
        
        # -1 = anomaly, 1 = normal
        anomalies = predictions == -1
        
        return {
            'is_anomaly': bool(anomalies[0]),
            'anomaly_score': self.model.score_samples(X)[0]
        }
```

---

## 🎨 Frontend Architecture

### Component Structure

```
src/
├── app/
│   ├── App.tsx                    # Root component
│   ├── routes.tsx                 # Route configuration
│   └── components/
│       ├── Layout.tsx             # Main layout with nav
│       ├── Dashboard.tsx          # Overview page
│       ├── DataIngestion.tsx      # AI upload (KILLER FEATURE)
│       ├── EmissionsTracking.tsx  # Scope 1,2,3 tracking
│       ├── SupplierManagement.tsx # Supplier ESG scores
│       ├── AIInsights.tsx         # Forecasting & recommendations
│       ├── Reports.tsx            # Compliance reporting
│       ├── Settings.tsx           # Configuration
│       ├── HackathonShowcase.tsx  # Project overview
│       └── ui/                    # Reusable UI components
│           ├── button.tsx
│           ├── card.tsx
│           ├── chart.tsx
│           └── ... (40+ components)
└── styles/
    ├── index.css                  # Global styles
    ├── theme.css                  # Design tokens
    └── tailwind.css               # Tailwind imports
```

### State Management (Example with React Context)

```typescript
// contexts/EmissionContext.tsx

import { createContext, useContext, useState, useEffect } from 'react';

interface EmissionData {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
}

interface EmissionContextType {
  emissions: EmissionData | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const EmissionContext = createContext<EmissionContextType | undefined>(undefined);

export function EmissionProvider({ children }: { children: React.ReactNode }) {
  const [emissions, setEmissions] = useState<EmissionData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emissions/summary');
      const data = await response.json();
      setEmissions(data);
    } catch (error) {
      console.error('Failed to fetch emissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <EmissionContext.Provider value={{ emissions, loading, refreshData }}>
      {children}
    </EmissionContext.Provider>
  );
}

export function useEmissions() {
  const context = useContext(EmissionContext);
  if (!context) {
    throw new Error('useEmissions must be used within EmissionProvider');
  }
  return context;
}
```

---

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add CLIMATIQ_API_KEY
vercel env add DATABASE_URL

# Deploy to production
vercel --prod
```

### Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@host:5432/ecotrack"

# AI APIs
OPENAI_API_KEY="sk-..."
CLIMATIQ_API_KEY="..."

# Next.js
NEXT_PUBLIC_APP_URL="https://ecotrack.ai"

# Authentication (NextAuth)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://ecotrack.ai"
```

### Docker Deployment

```dockerfile
# Dockerfile

FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## ⚡ Performance Optimization

### Database Query Optimization

```typescript
// Optimized query with Prisma

// ❌ BAD: N+1 query problem
const records = await prisma.emissionRecord.findMany();
for (const record of records) {
  const facility = await prisma.facility.findUnique({
    where: { id: record.facilityId }
  });
}

// ✅ GOOD: Use include
const records = await prisma.emissionRecord.findMany({
  include: {
    facility: true,
    supplier: true,
  },
  where: {
    dateRecorded: {
      gte: new Date('2026-01-01'),
    },
  },
  orderBy: {
    dateRecorded: 'desc',
  },
  take: 100,
});

// ✅ BETTER: Use select for specific fields
const records = await prisma.emissionRecord.findMany({
  select: {
    id: true,
    calculatedCO2e: true,
    dateRecorded: true,
    facility: {
      select: {
        name: true,
        location: true,
      },
    },
  },
});
```

### Frontend Performance

```typescript
// Use React.memo for expensive components
import { memo } from 'react';

export const EmissionChart = memo(function EmissionChart({ data }) {
  // Chart rendering logic
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});

// Use useMemo for expensive calculations
import { useMemo } from 'react';

function Dashboard() {
  const chartData = useMemo(() => {
    return processEmissionData(rawData);
  }, [rawData]);

  return <Chart data={chartData} />;
}

// Lazy load routes
import { lazy, Suspense } from 'react';

const AIInsights = lazy(() => import('./components/AIInsights'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AIInsights />
    </Suspense>
  );
}
```

---

## 🔐 Security Best Practices

### Input Validation (Zod)

```typescript
import { z } from 'zod';

const EmissionRecordSchema = z.object({
  dateRecorded: z.string().datetime(),
  scope: z.enum(['SCOPE_1', 'SCOPE_2', 'SCOPE_3']),
  activityValue: z.number().positive(),
  activityUnit: z.string().min(1),
  organizationId: z.string().uuid(),
});

// Validate request data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = EmissionRecordSchema.parse(body);
    
    // Proceed with validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
  }
}
```

### Authentication Middleware

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token && request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## ✅ Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/calculateEmissions.test.ts

import { describe, it, expect } from 'vitest';
import { calculateEmissions } from '@/lib/climatiq';

describe('calculateEmissions', () => {
  it('should calculate electricity emissions correctly', async () => {
    const result = await calculateEmissions({
      activityValue: 1000,
      activityUnit: 'kWh',
      emissionCategory: 'electricity',
      region: 'IN',
      year: 2026,
    });

    expect(result.co2e).toBeGreaterThan(0);
    expect(result.emissionFactor).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/api/ingest.test.ts

import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/ingest/route';

describe('POST /api/ingest', () => {
  it('should process uploaded document', async () => {
    const formData = new FormData();
    formData.append('file', mockPDF);
    formData.append('organizationId', 'test-org-id');

    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: formData,
    }));

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.record).toBeDefined();
  });
});
```

---

## 📊 Monitoring & Analytics

### Error Tracking (Sentry)

```typescript
// lib/sentry.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Capture errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### Performance Monitoring

```typescript
// lib/analytics.ts

export function trackEmissionCalculation(duration: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'emission_calculation', {
      event_category: 'performance',
      value: duration,
      event_label: 'calculation_time_ms',
    });
  }
}
```

---

## 🎓 Learning Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Climatiq API Docs](https://docs.climatiq.io)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [GHG Protocol](https://ghgprotocol.org)
- [React Performance](https://react.dev/learn/render-and-commit)

---

**Built with precision for production-ready ESG intelligence** 🚀
