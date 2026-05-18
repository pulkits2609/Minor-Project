import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pulkitworks.info";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      method: "GET",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to load dashboard data" },
      { status: 502 }
    );
  }
}
