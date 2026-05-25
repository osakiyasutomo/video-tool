'use client';
import React, { useMemo } from 'react';
import { Player } from '@remotion/player';
import { VideoComposition } from '@/remotion/Composition';
import { VideoProps } from '@/types/video';

const TRANSITION_FRAMES = 15;

export default function VideoPlayer({ props }: { props: VideoProps }) {
  const durationInFrames = useMemo(() => {
    const total = props.scenes.reduce((s, sc) => s + sc.durationInSeconds, 0);
    const transitions = Math.max(0, props.scenes.length - 1) * (TRANSITION_FRAMES / props.fps);
    return Math.max(30, Math.round((total + transitions) * props.fps));
  }, [props.scenes, props.fps]);

  if (props.scenes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        シーンがありません
      </div>
    );
  }

  return (
    <Player
      component={VideoComposition as any} // eslint-disable-line @typescript-eslint/no-explicit-any
      inputProps={props as any}
      durationInFrames={durationInFrames}
      compositionWidth={props.width}
      compositionHeight={props.height}
      fps={props.fps}
      style={{ width: '100%', height: '100%' }}
      controls
    />
  );
}
