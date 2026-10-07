/**
 * Visit context for the chat: the page the visitor chats from, plus how this visit started
 * (landing page, external referrer, UTM tags). The first page view of a tab records the start in
 * sessionStorage, so a visitor who lands from a campaign and opens the chat three pages later is
 * still credited to it. Only host + path of the referrer leave the browser; the server re-validates.
 */
import { cleanPath, cleanReferrer, cleanUtm, writeChatContext, type ChatContext } from "../../lib/chat-session-context";

const VISIT_KEY = "dewee.chat.visit";

type Visit = Pick<ChatContext, "landing" | "referrer" | "utmSource" | "utmMedium" | "utmCampaign">;

function firstTouch(): Visit {
  const q = new URLSearchParams(location.search);
  return {
    landing: cleanPath(location.pathname),
    referrer: cleanReferrer(document.referrer, location.hostname.replace(/^www\./, "")),
    utmSource: cleanUtm(q.get("utm_source")),
    utmMedium: cleanUtm(q.get("utm_medium")),
    utmCampaign: cleanUtm(q.get("utm_campaign")),
  };
}

/** Call on every page load: remembers the first page view of this tab's visit. */
export function rememberVisit(): void {
  try {
    if (!sessionStorage.getItem(VISIT_KEY)) sessionStorage.setItem(VISIT_KEY, JSON.stringify(firstTouch()));
  } catch { /* storage off: visitContext falls back to this page */ }
}

/** Query string (leading "&", or "") carrying the visit context for the chat WebSocket URL. */
export function visitContextQuery(): string {
  let visit: Visit;
  try {
    visit = JSON.parse(sessionStorage.getItem(VISIT_KEY) || "null") ?? firstTouch();
  } catch {
    visit = firstTouch();
  }
  const params = new URLSearchParams();
  writeChatContext(params, { ...visit, page: cleanPath(location.pathname) });
  const query = params.toString();
  return query ? `&${query}` : "";
}
