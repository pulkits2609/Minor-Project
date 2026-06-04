import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pulkitworks.info";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authHeader = request.headers.get("authorization");

  try {
    const { id } = await context.params;
    const response = await fetch(`${API_BASE_URL}/api/incidents/${id}`, {
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
      { message: "Unable to load incident details" },
      { status: 502 },
    );
  }
}
