import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pulkitworks.info";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const authHeader = request.headers.get("authorization");

  try {
    const body = await request.json();
    const response = await fetch(
      `${API_BASE_URL}/api/incidents/${params.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to update incident status" },
      { status: 502 },
    );
  }
}
