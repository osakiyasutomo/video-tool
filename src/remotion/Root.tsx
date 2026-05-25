import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './Composition';
import { DEFAULT_VIDEO_PROPS } from '../types/video';

export const RemotionRoot: React.FC = () => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Composition
      id="VideoComposition"
      component={VideoComposition as any}
      durationInFrames={900}
      fps={DEFAULT_VIDEO_PROPS.fps}
      width={DEFAULT_VIDEO_PROPS.width}
      height={DEFAULT_VIDEO_PROPS.height}
      defaultProps={DEFAULT_VIDEO_PROPS as any}
    />
  );
};
