import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { VideoProps } from '@/types/video';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const props: VideoProps = await req.json();

  const entryPoint = path.join(process.cwd(), 'src', 'remotion', 'index.ts');
  const publicDir = path.join(process.cwd(), 'public');
  const outDir = path.join(process.cwd(), 'public', 'renders');

  const { mkdir } = await import('fs/promises');
  await mkdir(outDir, { recursive: true });

  const outputFile = path.join(outDir, `output-${Date.now()}.mp4`);

  try {
    const bundled = await bundle({ entryPoint, publicDir });

    const inputProps = props as unknown as Record<string, unknown>;

    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'VideoComposition',
      inputProps,
    });

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputFile,
      inputProps,
    });

    const filename = path.basename(outputFile);
    return NextResponse.json({ url: `/renders/${filename}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
