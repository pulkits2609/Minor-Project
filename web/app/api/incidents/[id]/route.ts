import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pulkitworks.info";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
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
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const incidents = Array.isArray(data?.data) ? data.data : [];
    const incident = incidents.find((item) => item.id === params.id);

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ status: "success", data: incident });
  } catch {
    return NextResponse.json(
      { message: "Unable to load incident details" },
      { status: 502 },
    );
  }
}
