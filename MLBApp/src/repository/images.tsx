import {
  Cut,
  GetImagesOptions,
  PickedImage,
  Image,
  GameContentResponse,
  AnyImageNode,
  VariantImgs,
} from "src/interfaces/generated.game-content.types";

export function pickImagesFromCuts(
  cuts: Cut[] | undefined,
  opts: GetImagesOptions = {}
): PickedImage[] {
  if (!cuts?.length) return [];

  const {
    strategy = "similar",
    count = 1,
    preferAspectRatios,
    minWidth = 0,
    minHeight = 0,
    includeRetina = true,
  } = opts;

  // 1) filter by min dimensions
  let pool = cuts.filter((c) => c.width >= minWidth && c.height >= minHeight);

  // 2) optionally bias preferred aspect ratios (stable sort)
  if (preferAspectRatios?.length) {
    const order = new Map(preferAspectRatios.map((r, i) => [r, i]));
    pool = pool.slice().sort((a, b) => {
      const ai = order.has(a.aspectRatio)
        ? (order.get(a.aspectRatio) as number)
        : Infinity;
      const bi = order.has(b.aspectRatio)
        ? (order.get(b.aspectRatio) as number)
        : Infinity;
      return ai - bi || b.width - a.width; // then by width desc
    });
  } else {
    // default: just sort by width desc (highest quality first)
    pool = pool.slice().sort((a, b) => b.width - a.width);
  }

  if (strategy === "similar") {
    // Take the top aspect ratio in pool and keep the biggest N from that ratio
    const topRatio = pool[0]?.aspectRatio;
    const sameRatio = pool
      .filter((c) => c.aspectRatio === topRatio)
      .slice(0, count);
    return sameRatio.map(toPicked(includeRetina));
  }

  // strategy === "varied": try to spread across aspect ratios
  const seen = new Set<string>();
  const varied: Cut[] = [];
  for (const c of pool) {
    if (!seen.has(c.aspectRatio)) {
      varied.push(c);
      seen.add(c.aspectRatio);
      if (varied.length >= count) break;
    }
  }

  // If we still need more, top up with remaining largest
  if (varied.length < count) {
    const fill = pool
      .filter((c) => !varied.includes(c))
      .slice(0, count - varied.length);
    varied.push(...fill);
  }

  return varied.map(toPicked(includeRetina));
}

function toPicked(includeRetina: boolean) {
  return (c: Cut): PickedImage => ({
    src: c.src,
    width: c.width,
    height: c.height,
    aspectRatio: c.aspectRatio,
    ...(includeRetina && c.at2x ? { at2x: c.at2x } : {}),
    ...(includeRetina && c.at3x ? { at3x: c.at3x } : {}),
  });
}

/**
 * Convenience wrapper specialized to the recap image:
 *   getRecapImages(content.editorial?.recap?.mlb?.image, { count: 3, strategy: "varied" })
 */
export function getRecapImages(
  recapImage: Image | undefined,
  opts?: GetImagesOptions
): PickedImage[] {
  return pickImagesFromCuts(recapImage?.cuts, opts);
}

/** Build a URL from MLB's templateUrl by injecting format instructions.
 * Example format: "w_1280,h_720,f_jpg,c_fill,g_auto"
 */
function buildImageUrl(
  templateUrl: string,
  format = "w_1280,h_720,f_jpg,c_fill,g_auto"
) {
  return templateUrl.replace("{formatInstructions}", format);
}

/** Collect image objects from many content branches */
function collectImageNodes(
  gc: GameContentResponse
): { templateUrl?: string; cuts?: { src?: string }[] }[] {
  const pick = (n: AnyImageNode) => (n?.image ? [n.image] : []);

  const fromArray = (arr?: AnyImageNode[]) => (arr ? arr.flatMap(pick) : []);

  const recap = pick(gc.editorial?.recap?.mlb);
  const preview = pick(gc.editorial?.preview?.mlb);
  const articles = fromArray(gc.editorial?.articles?.items);

  const live = fromArray(gc.highlights?.live?.items);
  const hl = fromArray(gc.highlights?.highlights?.items);

  const epg = (gc.media?.epgAlternate ?? []).flatMap((g) => fromArray(g.items));
  //
  return [...recap, ...preview, ...articles, ...live, ...hl, ...epg];
}

/** MAIN: get images either as multiple cuts of the hero image or as different photos across the tree */
export function getImagesFromGameContent(
  gameContent: GameContentResponse | null | undefined,
  {
    limit = 6,
    variant = "different" as VariantImgs,
    size = "w_1280,h_720,f_jpg,c_fill,g_auto",
  } = {}
): string[] {
  if (!gameContent) return [];

  if (variant === "cuts") {
    const img = gameContent.editorial?.recap?.mlb?.image;
    if (!img?.templateUrl || !img.cuts?.length) return [];
    // choose up to `limit` cuts of the *same* photo
    return img.cuts
      .slice(0, limit)
      .map((cut) => cut?.src ?? buildImageUrl(img.templateUrl!, size));
  }

  // variant === "different": gather image nodes, prefer unique templateUrls (distinct photos)
  const nodes = collectImageNodes(gameContent);

  // make unique by templateUrl first; if missing, fall back to first cut src
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const n of nodes) {
    const key = n.templateUrl ?? n.cuts?.[0]?.src;
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);

    // if we have templateUrl, build a consistent-size URL; else use first cut src
    if (n.templateUrl) {
      urls.push(buildImageUrl(n.templateUrl, size));
    } else if (n.cuts?.[0]?.src) {
      urls.push(n.cuts[0].src);
    }

    if (urls.length >= limit) break;
  }

  return urls;
}

export const getVideo = (gameContent: GameContentResponse | null) => {
  if (!gameContent) {
    return "";
  }
  
  const items =
    gameContent?.media?.epgAlternate?.flatMap((item) => item.items ?? []) ?? [];

  const video = items.find((v) => v.playbacks.length);
  return video?.playbacks[0].url ?? "";
};
