export interface SceneConfig {
  id: string;
  durationInSeconds: number;
  text?: string;
  subText?: string;
  imageSrc?: string;      // public/ からの相対パス例: 'uploads/scene1.jpg'
  placeholder?: string;   // AIが生成する素材の説明
  hideText?: boolean;     // テキストオーバーレイを非表示
}

export interface VideoProps {
  scenes: SceneConfig[];
  fps: number;
  width: number;
  height: number;
  bgmSrc?: string;
  bgmVolume: number;
  logoSrc?: string;
}

export const DEFAULT_VIDEO_PROPS: VideoProps = {
  scenes: [],
  fps: 30,
  width: 1920,
  height: 1080,
  bgmVolume: 0.28,
};
