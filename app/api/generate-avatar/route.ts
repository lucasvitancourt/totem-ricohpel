import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl, prompt } = await req.json();
    if (!imageDataUrl || !prompt) {
      return new NextResponse('Parâmetros inválidos', { status: 400 });
    }

    const apiKey = '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'; // API key hardcoded
    const client = new OpenAI({ apiKey });

    // Converter data URL para Blob
    const base64Data = imageDataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const imageFile = new File([buffer], 'webcam.png', { type: 'image/png' } as any);

    const result = await client.images.edit({
      model: 'gpt-image-1',
      image: imageFile as any,
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'high'
    });

    if (result.data && result.data[0]) {
      const imageData = result.data[0];
      if (imageData.url) {
        return NextResponse.json({ imageUrl: imageData.url });
      } else if (imageData.b64_json) {
        const imageUrl = `data:image/png;base64,${imageData.b64_json}`;
        return NextResponse.json({ imageUrl });
      }
    }

    return new NextResponse('Falha ao gerar imagem', { status: 502 });
  } catch (err: any) {
    console.error('API generate-avatar error:', err);
    const status = err?.status || 500;
    const message = err?.message || 'Erro interno';
    return new NextResponse(`Erro na geração do avatar: ${message}`, { status });
  }
} 