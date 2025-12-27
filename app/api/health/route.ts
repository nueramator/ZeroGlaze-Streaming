import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Health Check Endpoint
 *
 * Returns the health status of the application and its dependencies.
 * Used for monitoring and uptime checks.
 *
 * @returns JSON response with health status
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  // Check environment variables
  checks.env = {
    status: 'pass',
    configured: {
      supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      solana: !!process.env.SOLANA_RPC_ENDPOINT,
      programId: !!process.env.NEXT_PUBLIC_PROGRAM_ID,
    }
  };

  // Check Supabase connection
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { error } = await supabase
        .from('tokens')
        .select('count')
        .limit(1)
        .single();

      checks.database = {
        status: error ? 'fail' : 'pass',
        message: error ? error.message : 'Connected',
        responseTime: Date.now() - startTime,
      };
    } else {
      checks.database = {
        status: 'warn',
        message: 'Database credentials not configured',
      };
    }
  } catch (error: any) {
    checks.database = {
      status: 'fail',
      message: error.message || 'Database check failed',
      responseTime: Date.now() - startTime,
    };
  }

  // Check Solana RPC
  try {
    if (process.env.SOLANA_RPC_ENDPOINT) {
      const rpcStartTime = Date.now();
      const response = await fetch(process.env.SOLANA_RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth',
        }),
      });

      const data = await response.json();

      checks.solana = {
        status: response.ok && data.result === 'ok' ? 'pass' : 'fail',
        network: process.env.SOLANA_NETWORK || 'unknown',
        endpoint: process.env.SOLANA_RPC_ENDPOINT.replace(/\?.*/g, ''), // Hide API keys
        responseTime: Date.now() - rpcStartTime,
      };
    } else {
      checks.solana = {
        status: 'warn',
        message: 'Solana RPC endpoint not configured',
      };
    }
  } catch (error: any) {
    checks.solana = {
      status: 'fail',
      message: error.message || 'Solana RPC check failed',
    };
  }

  // Determine overall status
  const hasFailures = Object.values(checks).some(
    (check: any) => check.status === 'fail'
  );
  const hasWarnings = Object.values(checks).some(
    (check: any) => check.status === 'warn'
  );

  const overallStatus = hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}
