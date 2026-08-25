export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  published_at: string;
  video_url: string;
}

export interface YouTubeLatestResponse {
  channel_id: string;
  videos: VideoItem[];
}

export interface YouTubeLiveResponse {
  is_live: boolean;
  live_video?: VideoItem | null;
}

export type VideoCategory =
  | 'todos'
  | 'presente7'
  | 'sabado'
  | 'domingo'
  | 'quarta'
  | 'semana';
