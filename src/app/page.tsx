'use client';
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { SceneConfig, VideoProps, DEFAULT_VIDEO_PROPS } from '@/types/video';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false });

type Step = 1 | 2 | 3;

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [script, setScript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [bgmSrc, setBgmSrc] = useState('');
  const [logoSrc, setLogoSrc] = useState('');
  const [rendering, setRendering] = useState(false);
  const [renderUrl, setRenderUrl] = useState('');
  const [error, setError] = useState('');
  const bgmRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const videoProps: VideoProps = {
    ...DEFAULT_VIDEO_PROPS,
    scenes,
    bgmSrc: bgmSrc || undefined,
    logoSrc: logoSrc || undefined,
  };

  const totalSeconds = scenes.reduce((s, sc) => s + sc.durationInSeconds, 0);

  async function parseScript() {
    if (!script.trim()) return;
    setParsing(true);
    setError('');
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '解析失敗');
      setScenes(data.scenes ?? []);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析中にエラーが発生しました');
    } finally {
      setParsing(false);
    }
  }

  async function uploadFile(file: File, sceneId: string): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    form.append('sceneId', sceneId);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    return data.src;
  }

  async function handleImageDrop(sceneId: string, file: File) {
    const src = await uploadFile(file, sceneId);
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, imageSrc: src } : s));
  }

  async function handleRender() {
    setRendering(true);
    setRenderUrl('');
    setError('');
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoProps),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'レンダリング失敗');
      setRenderUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'レンダリング中にエラーが発生しました');
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">動画作成ツール</h1>
            <p className="text-sm text-gray-500">台本を貼り付けて商品PR動画を自動生成</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {([1, 2, 3] as Step[]).map(s => (
              <React.Fragment key={s}>
                <button
                  onClick={() => s < step && setStep(s)}
                  className={`w-8 h-8 rounded-full font-bold transition-colors ${
                    step === s ? 'bg-black text-white' :
                    s < step ? 'bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer' :
                    'bg-gray-100 text-gray-400 cursor-default'
                  }`}
                >{s}</button>
                {s < 3 && <div className={`w-8 h-px ${s < step ? 'bg-gray-400' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">① 台本を貼り付ける</h2>
            <p className="text-sm text-gray-500 mb-4">
              シーン構成・テロップ・時間が書かれた台本をそのまま貼り付けてください。AIが自動でシーンを解析します。
            </p>
            <textarea
              className="w-full h-80 p-4 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-black"
              placeholder={"① 0〜3秒｜フック\n映像：暗い部屋でメイクしづらい女性\nテロップ「そのメイク、暗さで損してない？」\n\n② 3〜8秒｜商品登場\n映像：LEDミラーのライト点灯\nテロップ「プロ級の明るさを毎日のメイクに」"}
              value={script}
              onChange={e => setScript(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={parseScript}
                disabled={parsing || !script.trim()}
                className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {parsing ? '解析中...' : 'AIで解析 →'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">② シーンを編集する</h2>
                <p className="text-sm text-gray-500">{scenes.length}シーン・合計{totalSeconds}秒</p>
              </div>
              <button onClick={() => setStep(3)} className="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                プレビュー・出力 →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <UploadCard label="BGM（任意）" accept="audio/*" current={bgmSrc} inputRef={bgmRef}
                onFile={async f => setBgmSrc(await uploadFile(f, 'bgm'))} />
              <UploadCard label="ブランドロゴ（任意）" accept="image/*" current={logoSrc} inputRef={logoRef}
                onFile={async f => setLogoSrc(await uploadFile(f, 'logo'))} />
            </div>

            <div className="space-y-3">
              {scenes.map((scene, i) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  index={i}
                  onImageDrop={handleImageDrop}
                  onChange={updated => setScenes(prev => prev.map(s => s.id === updated.id ? updated : s))}
                />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">③ プレビュー・MP4出力</h2>
                <p className="text-sm text-gray-500">{scenes.length}シーン・合計{totalSeconds}秒</p>
              </div>
              <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-900">
                ← シーン編集に戻る
              </button>
            </div>

            <div className="bg-black rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
              {scenes.length > 0 ? <VideoPlayer props={videoProps} /> : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">シーンがありません</div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-1">MP4として書き出す</h3>
              <p className="text-sm text-gray-500 mb-4">1920×1080 / 30fps / H.264。約2〜5分かかります。</p>
              <button
                onClick={handleRender}
                disabled={rendering || scenes.length === 0}
                className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {rendering ? '⏳ レンダリング中...' : '🎬 MP4を書き出す'}
              </button>
              {rendering && <p className="mt-3 text-sm text-gray-500">しばらくお待ちください（2〜5分）...</p>}
              {renderUrl && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium mb-2">✅ 完成しました！</p>
                  <a href={renderUrl} download
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                    ⬇ ダウンロード
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SceneCard({ scene, index, onImageDrop, onChange }: {
  scene: SceneConfig; index: number;
  onImageDrop: (id: string, file: File) => void;
  onChange: (s: SceneConfig) => void;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
      <div
        className={`w-32 h-20 flex-shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${dragging ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onImageDrop(scene.id, f); }}
        onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*,video/*'; inp.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) onImageDrop(scene.id, f); }; inp.click(); }}
      >
        {scene.imageSrc
          ? <img src={`/${scene.imageSrc}`} className="w-full h-full object-cover rounded-lg" />
          : <div className="text-center"><div className="text-2xl">📁</div><div className="text-xs text-gray-400 mt-1">ドロップ</div></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-gray-400">SCENE {index + 1}</span>
          <input type="number" min={1} max={30} value={scene.durationInSeconds}
            onChange={e => onChange({ ...scene, durationInSeconds: Number(e.target.value) })}
            className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-black" />
          <span className="text-xs text-gray-400">秒</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="メインテキスト（テロップ）" value={scene.text ?? ''}
            onChange={e => onChange({ ...scene, text: e.target.value })} />
          <button
            onClick={() => onChange({ ...scene, hideText: !scene.hideText })}
            title={scene.hideText ? 'テキストを表示' : 'テキストを非表示'}
            className={`flex-shrink-0 px-2 py-1.5 text-sm rounded-lg border transition-colors ${scene.hideText ? 'bg-gray-200 border-gray-300 text-gray-500' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'}`}
          >
            {scene.hideText ? '非表示' : '表示'}
          </button>
        </div>
        <input className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
          placeholder="サブテキスト（任意）" value={scene.subText ?? ''}
          onChange={e => onChange({ ...scene, subText: e.target.value || undefined })} />
        {scene.placeholder && (
          <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-700 mb-0.5">必要な素材</p>
            <p className="text-xs text-amber-800 leading-relaxed">{scene.placeholder}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadCard({ label, accept, current, inputRef, onFile }: {
  label: string; accept: string; current: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (f: File) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-gray-400 transition-colors"
      onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div className="text-2xl">{accept.includes('audio') ? '🎵' : '🏷️'}</div>
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-400">{current ? '✅ アップロード済み' : 'クリックして選択'}</div>
      </div>
    </div>
  );
}
