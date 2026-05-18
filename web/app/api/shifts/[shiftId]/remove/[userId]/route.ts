import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pulkitworks.info";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ shiftId: string; userId: string }> }
) {
  try {
    const { shiftId, userId } = await context.params;
    const authHeader = request.headers.get("authorization");
    const response = await fetch(
      `${API_BASE_URL}/api/shifts/${shiftId}/remove/${userId}`,
      {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      }
    );
    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to remove worker from shift" },
      { status: 502 }
    );
  }
}

