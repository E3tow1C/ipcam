import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get('url');
  const username = searchParams.get('username');
  const password = searchParams.get('password');
  const authType = searchParams.get('authType');

  if (!url || !username || !password) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    let response;
    
    if (authType === 'digest') {
      response = await axios.get(url, {
        auth: { username, password },
        responseType: 'stream',
      });
    } else {
      const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
      response = await axios.get(url, {
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
        responseType: 'stream',
      });
    }

    return new Response(response.data, {
      headers: {
        'Content-Type': response.headers['content-type'] || 'multipart/x-mixed-replace',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch camera stream' }, { status: 401 });
  }
}
