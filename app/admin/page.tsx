import { Suspense } from "react";
import { cookies } from "next/headers";
import AdminLogin from "./LoginTemp";
import AdminDashboard from "./AdminDashboard";
import { isValidAdminSession, SESSION_COOKIE } from "@/lib/admin-auth";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#090614] text-white">
          Yönetici paneli yükleniyor...
        </main>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}

async function AdminPageContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!isValidAdminSession(token)) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
