import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pulkitworks.info";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  try {
    const response = await fetch(`${API_BASE_URL}/api/incidents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to load incidents" },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/incidents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to submit incident report" },
      { status: 502 },
    );
  }
}
