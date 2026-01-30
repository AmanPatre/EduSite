import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { roadmapId } = await req.json();

        if (!roadmapId) {
            return NextResponse.json({ error: "Roadmap ID is required" }, { status: 400 });
        }

        // Verify ownership
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { roadmaps: true }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const roadmap = user.roadmaps.find((r: any) => r.id === roadmapId);

        if (!roadmap) {
            return NextResponse.json({ error: "Roadmap not found or unauthorized" }, { status: 404 });
        }

        await prisma.roadmap.delete({
            where: { id: roadmapId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting roadmap:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
