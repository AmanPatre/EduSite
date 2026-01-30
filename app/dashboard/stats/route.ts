import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. Get Activities (for Heatmap)
    const activities = await prisma.activity.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
    });

    // 2. Get Active Roadmaps
    const roadmaps = await prisma.roadmap.findMany({
        where: { userId: user.id, status: "active" }
    });

    return NextResponse.json({ activities, roadmaps });
}