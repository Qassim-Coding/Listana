export type PodcastStatus = "toListen" | "listening" | "completed" | "abandoned";
export type PodcastKind = "podcast" | "audiobook";

export interface Podcast {
  id: string;
  title: string;
  host?: string;
  status: PodcastStatus;
  kind?: PodcastKind; // default: "podcast"
  notes?: string;
  lastEpisode?: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

export type PodcastUpdate = Partial<Podcast>;
