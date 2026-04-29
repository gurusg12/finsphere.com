import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
export default async function Root() {
  const u = await getSessionUser();
  redirect(u ? "/dashboard" : "/login");
}
