import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File;
  const sceneId = form.get('sceneId') as string;

  if (!file) return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${sceneId}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ src: `uploads/${filename}` });
}
