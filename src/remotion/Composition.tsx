import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Audio } from '@remotion/media';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { VideoProps } from '../types/video';
import { Slide } from './Slide';

const TRANSITION_FRAMES = 15;

export const VideoComposition: React.FC<VideoProps> = ({ scenes, fps, bgmSrc, bgmVolume, logoSrc }) => {
  const timing = linearTiming({ durationInFrames: TRANSITION_FRAMES });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {bgmSrc && <Audio src={staticFile(bgmSrc)} volume={bgmVolume} />}

      <TransitionSeries>
        {scenes.map((scene, i) => {
          const durationInFrames = scene.durationInSeconds * fps + (i < scenes.length - 1 ? TRANSITION_FRAMES : 0);
          return (
            <React.Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <Slide scene={scene} index={i} />
              </TransitionSeries.Sequence>
              {i < scenes.length - 1 && (
                <TransitionSeries.Transition presentation={fade()} timing={timing} />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {/* ロゴ（右下に常時表示） */}
      {logoSrc && (
        <div style={{ position: 'absolute', bottom: -160, right: 40, opacity: 0.75, zIndex: 10 }}>
          <Img src={staticFile(logoSrc)} style={{ height: 480, width: 'auto' }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
