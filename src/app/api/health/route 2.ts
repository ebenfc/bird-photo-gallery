import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

interface CheckResult {
  status: 'pass' | 'fail';
  responseTime?: number;
  message?: string;
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: CheckResult;
    haikubox: CheckResult;
  };
}

// Track server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * GET /api/health - Health check endpoint
 * Returns system health status with individual service checks
 */
export async function GET() {
  const checks: HealthCheck['checks'] = {
    database: await checkDatabase(),
    haikubox: await checkHaikubox()
  };

  // Determine overall status
  const allPassed = Object.values(checks).every(c => c.status === 'pass');
  const allFailed = Object.values(checks).every(c => c.status === 'fail');

  let status: HealthCheck['status'];
  if (allPassed) {
    status = 'healthy';
  } else if (allFailed) {
    status = 'unhealthy';
  } else {
    status = 'degraded';
  }

  const health: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    uptime: (Date.now() - serverStartTime) / 1000, // seconds
    version: process.env.npm_package_version || '0.1.0',
    checks
  };

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();

  try {
    // Simple query to check database connectivity
    await db.execute(sql`SELECT 1`);

    return {
      status: 'pass',
      responseTime: Date.now() - start
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return {
      status: 'fail',
      message,
      responseTime: Date.now() - start
    };
  }
}

/**
 * Check Haikubox API connectivity
 */
async function checkHaikubox(): Promise<CheckResult> {
  const start = Date.now();
  const serial = process.env.HAIKUBOX_SERIAL;

  if (!serial) {
    return {
      status: 'fail',
      message: 'HAIKUBOX_SERIAL not configured',
      responseTime: 0
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://api.haikubox.com/haikubox/${serial}`,
      {
        signal: controller.signal,
        cache: 'no-store'
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        status: 'fail',
        message: `HTTP ${response.status}`,
        responseTime: Date.now() - start
      };
    }

    return {
      status: 'pass',
      responseTime: Date.now() - start
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Haikubox error';
    return {
      status: 'fail',
      message: message.includes('abort') ? 'Request timeout' : message,
      responseTime: Date.now() - start
    };
  }
}
