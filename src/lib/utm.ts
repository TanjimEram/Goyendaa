/**
 * UTM attribution. proxy.ts copies utm_source / utm_medium / utm_campaign
 * from any landing URL into a first-party cookie (last touch wins), so a
 * lead or a purchase days later still knows whether it came from Facebook,
 * Instagram or a Facebook group. Pure helpers: no server-only imports, so
 * the proxy can use them too.
 */

export const UTM_COOKIE = "gyd_utm";
export const UTM_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface Utm {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export const NO_UTM: Utm = { utm_source: null, utm_medium: null, utm_campaign: null };

const clean = (v: string | null | undefined) => {
  const s = (v ?? "").trim().slice(0, 100);
  return s ? s : null;
};

/** UTM params on a URL, or null when it carries none. */
export function utmFromSearch(params: URLSearchParams): Utm | null {
  const utm: Utm = {
    utm_source: clean(params.get("utm_source")),
    utm_medium: clean(params.get("utm_medium")),
    utm_campaign: clean(params.get("utm_campaign")),
  };
  return utm.utm_source || utm.utm_medium || utm.utm_campaign ? utm : null;
}

/** Parse the cookie; anything malformed reads as "no UTM". */
export function utmFromCookie(value: string | undefined): Utm {
  if (!value) return NO_UTM;
  try {
    const v = JSON.parse(value) as Partial<Utm>;
    return {
      utm_source: clean(v.utm_source),
      utm_medium: clean(v.utm_medium),
      utm_campaign: clean(v.utm_campaign),
    };
  } catch {
    return NO_UTM;
  }
}
