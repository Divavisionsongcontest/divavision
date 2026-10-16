
import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  SESSION_COOKIE,
  SESSION_DURATION,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password =
      typeof body.password === "string" ? body.password : "";

    if (
      !process.env.ADMIN_PASSWORD ||
      !process.env.ADMIN_SESSION_SECRET ||
      process.env.ADMIN_SESSION_SECRET.length < 32
    ) {
      return NextResponse.json(
        { error: "Admin ayarları yapılandırılmamış." },
        { status: 500 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Şifre yanlış." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set(
      SESSION_COOKIE,
      createAdminSessionToken(),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION / 1000,
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Giriş isteği işlenemedi." },
      { status: 400 }
    );
  }
}
