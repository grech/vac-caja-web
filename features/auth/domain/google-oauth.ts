const CALLBACK_PATH = "/auth/callback";
const POST_LOGIN_PATH = "/caja";

export function buildGoogleOAuthRedirectTo(origin: string): string {
  const url = new URL(CALLBACK_PATH, origin);
  url.searchParams.set("next", POST_LOGIN_PATH);

  return url.toString();
}
