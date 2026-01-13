import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.GITHUB_TOKEN;

    return NextResponse.json({
        tokenStatus: token ? "Loaded" : "Missing",
        tokenSnippet: token ? token.substring(0, 4) + "..." : "N/A",
    });
}
