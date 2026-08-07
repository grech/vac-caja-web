import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/features/auth/services/server-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = await getAuthenticatedUserId();

  redirect(userId ? "/caja" : "/login");
}
