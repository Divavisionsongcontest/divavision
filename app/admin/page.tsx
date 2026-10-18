import { cookies } from "next/headers";
import AdminLogin from "./LoginTemp";
import AdminDashboard from "./AdminDashboard";
import { isValidAdminSession, SESSION_COOKIE } from "@/lib/admin-auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!isValidAdminSession(token)) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
