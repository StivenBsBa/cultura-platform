import { NextResponse } from "next/server";

export const apiError = (message: string, status: number) =>
  NextResponse.json({ error: { message } }, { status });
export const apiValidationError = (
  message: string,
  issues: readonly { path: PropertyKey[]; message: string }[],
) =>
  NextResponse.json(
    {
      error: {
        message,
        fields: Object.fromEntries(
          issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
        ),
      },
    },
    { status: 422 },
  );
export const apiData = <T>(data: T, status = 200) => NextResponse.json({ data }, { status });
export const apiList = <T>(data: T[], page: number, pageSize: number, total: number) =>
  NextResponse.json({
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
