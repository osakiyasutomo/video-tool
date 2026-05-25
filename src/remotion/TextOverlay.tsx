import React from 'react';
import { interpolate, Easing, useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
  main: string;
  sub?: string;
  position?: 'bottom' | 'center';
  mainSize?: number;
  subSize?: number;
  enterFrame?: number;
}

export const TextOverlay: React.FC<Props> = ({
  main, sub, position = 'bottom',
  mainSize = 64, subSize = 32, enterFrame = 8,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const EXIT = durationInFrames - 12;

  const opacity = interpolate(frame, [enterFrame, enterFrame + 18, EXIT, EXIT + 12], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [enterFrame, enterFrame + 22], [24, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      justifyContent: position === 'bottom' ? 'flex-end' : 'center',
      alignItems: 'center',
      padding: position === 'bottom' ? '0 0 72px 0' : '0',
      opacity, transform: `translateY(${y}px)`, pointerEvents: 'none',
    }}>
      <div style={{
        fontSize: mainSize, fontWeight: 700, color: '#fff',
        textShadow: '0 2px 16px rgba(0,0,0,0.55)', textAlign: 'center',
        lineHeight: 1.25, letterSpacing: '0.03em',
        marginBottom: sub ? 14 : 0, whiteSpace: 'pre-line',
      }}>{main}</div>
      {sub && (
        <div style={{
          fontSize: subSize, fontWeight: 400, color: '#eee',
          textShadow: '0 1px 8px rgba(0,0,0,0.5)', textAlign: 'center',
          letterSpacing: '0.04em', opacity: 0.88,
        }}>{sub}</div>
      )}
    </div>
  );
};
