import { NextResponse } from "next/server";
import { resolveSafeNextPath } from "../../../features/auth/domain/safe-redirect";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = resolveSafeNextPath(searchParams.get("next"));
  const oauthErrorRedirect = `${origin}/login?notice=oauth-error`;

  if (!code) {
    return NextResponse.redirect(oauthErrorRedirect);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(oauthErrorRedirect);
    }
  } catch {
    return NextResponse.redirect(oauthErrorRedirect);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
