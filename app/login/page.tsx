import { redirect } from "next/navigation";
import { LoginScreen } from "@/features/auth/components/login-screen";
import { getLoginNotice } from "@/features/auth/domain/login-notice";
import { getAuthenticatedUserId } from "@/features/auth/services/server-auth";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const userId = await getAuthenticatedUserId();

  if (userId) {
    redirect("/caja");
  }

  const { notice: requestedNotice } = await searchParams;
  const notice = getLoginNotice(requestedNotice);

  return <LoginScreen notice={notice} />;
}
