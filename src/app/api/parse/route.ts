import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { script } = await req.json();
  if (!script?.trim()) return NextResponse.json({ error: '台本が空です' }, { status: 400 });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [{
      role: 'system',
      content: '動画台本を解析してJSONで返すアシスタントです。',
    }, {
      role: 'user',
      content: `以下の動画台本を解析して、シーン情報をJSONで返してください。

台本:
${script}

以下のJSON形式で返してください:
{
  "scenes": [
    {
      "id": "scene1",
      "durationInSeconds": 数値,
      "text": "画面に表示するメインテキスト（短く簡潔に）",
      "subText": "サブテキスト（任意、なければnull）",
      "placeholder": "ここに使う映像・画像の説明"
    }
  ]
}

ルール:
- 台本に記載された各シーン・カットを1つのsceneとして抽出する
- durationInSecondsは台本の時間指定から取得（例：「0〜3秒」なら3）
- textは台本のテロップ・キャッチコピーをそのまま使う
- placeholderは「どんな映像・画像が必要か」の説明
- idはscene1, scene2...と連番にする`,
    }],
  });

  const content = response.choices[0].message.content;
  if (!content) return NextResponse.json({ error: '解析失敗' }, { status: 500 });

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: '解析結果のパースに失敗しました', raw: content }, { status: 500 });
  }
}
