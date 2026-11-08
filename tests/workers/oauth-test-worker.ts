export { OAuthAuthority } from "../../src/lib/server/oauth/oauth-authority";

export default {
  fetch() { return new Response("OAuth authority test worker"); },
};
