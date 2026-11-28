/** Stream heights the Mac can be asked for, smoothest first. */
export const STREAM_QUALITIES = [720, 1080, 1440, 2160] as const;

export type StreamQuality = (typeof STREAM_QUALITIES)[number];

export const DEFAULT_STREAM_QUALITY: StreamQuality = 720;

export function qualityLabel(quality: StreamQuality): string {
  return quality === 2160 ? '4K' : `${quality}p`;
}
