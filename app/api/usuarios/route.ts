import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try {
    const awsResponse = await fetch('https://6flmoniy8a.execute-api.us-east-1.amazonaws.com/usuarios', {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain;q=0.9,*/*;q=0.8',
      }
    });

    const contentType = awsResponse.headers.get('content-type') || '';
    const status = awsResponse.status;

    if (contentType.includes('application/json')) {
      const data = await awsResponse.json();
      if (!awsResponse.ok) {
        console.error('AWS usuarios error JSON:', { status, data });
        return NextResponse.json({ error: 'AWS retornou erro', status, data }, { status });
      }
      return NextResponse.json(data, { status });
    }

    const text = await awsResponse.text();
    if (!awsResponse.ok) {
      console.error('AWS usuarios error TEXT:', { status, text });
      return NextResponse.json({ error: 'AWS retornou erro', status, message: text }, { status });
    }
    return new NextResponse(text || '', { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (error: any) {
    console.error('Proxy usuarios error:', error);
    const message = error?.message || 'Erro interno';
    return NextResponse.json({ error: 'Erro ao listar usuários', message }, { status: 500 });
  }
} 