import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pulkitworks.info:5000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body && body.password != null && typeof body.password !== "string") {
      body.password = String(body.password);
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to authentication server" },
      { status: 502 },
    );
  }
}
