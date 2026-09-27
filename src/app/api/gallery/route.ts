import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Failed to fetch gallery items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, type, cloudinaryUrl, cloudinaryPublicId, thumbnailUrl, category, description } = data;

    if (!title || !cloudinaryUrl) {
      return NextResponse.json({ error: "Title and Image URL are required" }, { status: 400 });
    }

    const newItem = await db.insert(galleryItems).values({
      title,
      type: type || "photo",
      cloudinaryUrl,
      cloudinaryPublicId: cloudinaryPublicId || "manual_upload",
      thumbnailUrl: thumbnailUrl || cloudinaryUrl,
      category: category || "General",
      description: description || null,
    }).returning();

    revalidatePath("/gallery");
    revalidatePath("/");

    return NextResponse.json({ success: true, item: newItem[0] });
  } catch (error) {
    console.error("Failed to insert gallery item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    if (idsParam) {
      const ids = idsParam.split(',').map(Number);
      await db.delete(galleryItems).where(inArray(galleryItems.id, ids));
    } else if (id) {
      await db.delete(galleryItems).where(eq(galleryItems.id, parseInt(id)));
    } else {
      return NextResponse.json({ error: "ID or IDs are required" }, { status: 400 });
    }

    revalidatePath("/gallery");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete gallery item(s):", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

