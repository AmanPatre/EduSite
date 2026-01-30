import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roadmapId, stepIndex, topic } = await req.json();

    // Fetch User to get ID
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.roadmap.update({
        where: { id: roadmapId },
        data: { currentStep: stepIndex + 1 }
    });

    await prisma.activity.create({
        data: {
            userId: user.id,
            action: "COMPLETED_STEP",
            topic: topic || "General",
            metadata: { stepIndex }
        }
    });

    return NextResponse.json({ success: true });
}
