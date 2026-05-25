import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile } from 'remotion';
import { SceneConfig } from '../types/video';
import { TextOverlay } from './TextOverlay';

const FADE = 15;

// プレースホルダー背景（素材未設定時）
const PLACEHOLDER_COLORS = [
  'linear-gradient(135deg,#1a1a2e,#2d2d3d)',
  'linear-gradient(135deg,#0a0a0a,#2a2010)',
  'linear-gradient(135deg,#f5f0e8,#ede5d5)',
  'linear-gradient(135deg,#fff8f0,#fdf0e0)',
  'linear-gradient(135deg,#d0ccc8,#c0bcb8)',
  'linear-gradient(160deg,#ffffff,#f8f2ea)',
];

export const Slide: React.FC<{ scene: SceneConfig; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig(); // eslint-disable-line @typescript-eslint/no-unused-vars

  const opacity = interpolate(
    frame, [0, FADE, durationInFrames - FADE, durationInFrames], [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.ease }
  );

  const bg = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];

  return (
    <AbsoluteFill style={{ opacity }}>
      {scene.imageSrc ? (
        <Img
          src={staticFile(scene.imageSrc)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <AbsoluteFill style={{ background: bg }}>
          {scene.placeholder && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)', fontSize: 28,
              letterSpacing: '0.05em', textAlign: 'center', padding: 40,
            }}>
              {scene.placeholder}
            </div>
          )}
        </AbsoluteFill>
      )}

      {!scene.hideText && (scene.text || scene.subText) && (
        <AbsoluteFill style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)',
        }} />
      )}

      {!scene.hideText && scene.text && (
        <TextOverlay main={scene.text} sub={scene.subText} enterFrame={10} />
      )}
    </AbsoluteFill>
  );
};
