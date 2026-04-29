import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({ children }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-bgmain">{children}</main>
      </div>
    </div>
  );
}
