import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export async function POST(req: Request) {

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, roadmap } = await req.json();

    // Find user ID (assuming you look up by email, or session has ID)
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    // Create Roadmap

    const newRoadmap = await prisma.roadmap.create({
        data: {
            userId: user.id,
            topic: topic,
            content: roadmap, // Prisma handles JSON automatically
            status: "active"
        }
    });
    return NextResponse.json(newRoadmap);
}