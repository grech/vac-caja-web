import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/features/auth/services/server-auth";
import { MembershipShell } from "@/features/membership/components/membership-shell";

export const dynamic = "force-dynamic";

export default async function CajaPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/login");
  }

  return <MembershipShell />;
}
