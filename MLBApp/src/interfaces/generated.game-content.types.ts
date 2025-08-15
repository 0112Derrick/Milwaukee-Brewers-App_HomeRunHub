// Generated from https://statsapi.mlb.com/api/v1/game/776755/content
export interface GameContentResponse {
  copyright: string;
  editorial: Editorial;
  gameNotes: GameNotes;
  highlights: GameContentResponseHighlights;
  link: string;
  media: GameContentResponseMedia;
  summary: Summary;
}

export interface Editorial {
  articles: { items?: AnyImageNode[] } | null;
  preview: GameNotes;
  recap: Recap;
  wrap: GameNotes;
}

export interface GameNotes {
  mlb: RecapMlb;
}

export interface Recap {
  mlb: RecapMlb;
}

export interface RecapMlb {
  blurb: string;
  body: string;
  contributors: Contributor[];
  date: Date;
  headline: string;
  image: Image;
  keywordsAll: Keywords[];
  keywordsDisplay: any[];
  media: MediaElement;
  photo: Image;
  seoKeywords: string;
  seoTitle: string;
  slug: string;
  state: State;
  type: string;
  url: string;
}

export interface Contributor {
  name: string;
}

export interface Image {
  altText: null | string;
  cuts: Cut[];
  templateUrl: string;
  title: string;
}

export interface Cut {
  aspectRatio: AspectRatio;
  at2x: string;
  at3x: string;
  height: number;
  src: string;
  width: number;
}

export type AspectRatio = "16:9" | "4:3" | "64:27" | "1:1" | string;

export interface Keywords {
  displayName: string;
  type?: KeywordsAllType;
  value: string;
}

export type KeywordsAllType =
  | "customentity.contributor"
  | "taxonomy"
  | "game"
  | "game_pk"
  | "team"
  | "bodyParagraphCount"
  | "season"
  | "player"
  | "player_id"
  | "team_id"
  | "mlbtax"
  | "subject";

export interface MediaElement {
  blurb: string;
  date: Date;
  description?: string;
  duration: string;
  guid?: string;
  headline: string;
  id: string;
  image: Image;
  keywordsAll: Keywords[];
  keywordsDisplay: Keywords[];
  mediaPlaybackId: string;
  mediaPlaybackUrl: string;
  noIndex: boolean;
  playbacks: Playback[];
  seoTitle: string;
  slug: string;
  state: State;
  title: string;
  type: MediaType;
}

export interface Playback {
  height: string;
  name: Name;
  url: string;
  width: string;
}

export type Name =
  | "mp4Avc"
  | "hlsCloud"
  | "HTTP_CLOUD_WIRED"
  | "HTTP_CLOUD_WIRED_60"
  | "trickplay"
  | "highBit"
  | "portrait_mp4Avc"
  | "portrait_hlsCloud";

export type State = "A";

export type MediaType = "video";

export interface GameContentResponseHighlights {
  gameCenter: null;
  highlights: LiveClass;
  live: LiveClass;
  milestone: null;
  scoreboard: null;
  scoreboardPreview: LiveClass;
}

export interface LiveClass {
  items: MediaElement[];
}

export interface GameContentResponseMedia {
  enhancedGame: boolean;
  epgAlternate: EpgAlternate[];
  featuredMedia: FeaturedMedia;
  freeGame: boolean;
  milestones: null;
  previewStory: PreviewStory;
}

export interface EpgAlternate {
  items: MediaElement[];
  title: string;
}

export interface FeaturedMedia {
  id: string;
}

export interface PreviewStory {
  items: MlbElement[];
  mlb: MlbElement;
}

export interface MlbElement {
  dapiURL: string;
  keywordsAll: any[];
  keywordsDisplay: any[];
  state: State;
}

export interface Summary {
  hasHighlightsVideo: boolean;
  hasPreviewArticle: boolean;
  hasRecapArticle: boolean;
  hasWrapArticle: boolean;
}

export type PickStrategy = "similar" | "varied";

export interface GetImagesOptions {
  strategy?: PickStrategy; // default: "similar"
  count?: number; // default: 1
  preferAspectRatios?: AspectRatio[]; // e.g. ["16:9","4:3"]
  minWidth?: number; // e.g. 800
  minHeight?: number; // e.g. 450
  includeRetina?: boolean; // include at2x/at3x in result
}

export interface PickedImage {
  src: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  at2x?: string;
  at3x?: string;
}

export type VariantImgs = "cuts" | "different";

export type AnyImageNode =
  | {
      image?: {
        templateUrl?: string;
        cuts?: { src?: string; width?: number; height?: number }[];
      } | null;
    }
  | null
  | undefined;
