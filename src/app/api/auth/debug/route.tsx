import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  
  return NextResponse.json({
    fullUrl: request.url,
    searchParams: Object.fromEntries(url.searchParams),
    hash: url.hash,
    headers: Object.fromEntries(request.headers)
  });
}