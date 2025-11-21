"use server";
import prisma from "@/lib/db";

export async function deleteUrl(ids: number) {
  try {
    // Delete the URL
    await prisma.url.delete({
      where: { id: ids },
    });

    // Get all remaining URLs ordered by current ID
    const remainingUrls = await prisma.url.findMany({
      orderBy: { id: "asc" },
    });

    if (remainingUrls.length === 0) {
      // If no URLs left, reset the sequence to 1
      await prisma.$executeRawUnsafe(
        `SELECT setval('"Url_id_seq"', 1, false);`,
      );
      return { success: true };
    }

    // Step 1: Set all IDs to negative values to avoid conflicts
    await prisma.$transaction(
      remainingUrls.map((url, index) =>
        prisma.url.update({
          where: { id: url.id },
          data: { id: -(index + 1) },
        }),
      ),
    );

    // Step 2: Set all IDs to sequential positive values (1, 2, 3, ...)
    await prisma.$transaction(
      remainingUrls.map((_, index) =>
        prisma.url.update({
          where: { id: -(index + 1) },
          data: { id: index + 1 },
        }),
      ),
    );

    // Step 3: Reset the PostgreSQL sequence to continue from the max ID
    const maxId = remainingUrls.length;
    await prisma.$executeRawUnsafe(
      `SELECT setval('"Url_id_seq"', ${maxId}, true);`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting URL:", error);
    return { success: false, error: "Failed to delete URL" };
  }
}
