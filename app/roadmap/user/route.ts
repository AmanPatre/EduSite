import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // 1. Check for specific ID request
    const { searchParams } = new URL(req.url);
    const roadmapId = searchParams.get('id');

    let savedRoadmap;

    if (roadmapId) {
        savedRoadmap = await prisma.roadmap.findFirst({
            where: {
                id: roadmapId,
                userId: user?.id
            }
        });
    } else {
        // 2. Default: Find latest ACTIVE roadmap
        savedRoadmap = await prisma.roadmap.findFirst({
            where: {
                userId: user?.id,
                status: "active"
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    return NextResponse.json({ roadmap: savedRoadmap });
}