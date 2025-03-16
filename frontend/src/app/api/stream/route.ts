import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get('url');
  const username = searchParams.get('username');
  const password = searchParams.get('password');
  const authType = searchParams.get('authType');

  if (!url) {
    return NextResponse.json({ error: 'Camera URL is required' }, { status: 400 });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      auth: username && password ? {
        username,
        password,
        ...(authType === 'digest' ? { type: 'digest' } : {})
      } : undefined
    });

    return new Response(response.data, {
      headers: {
        'Content-Type': response.headers['content-type'] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    const err = error as any;
    return NextResponse.json({ 
      error: err.message 
    }, { 
      status: err.response?.status || 500 
    });
  }
}