"use server";
import prisma from "@/lib/db";

export async function getAllUrls() {
  try {
    const urls = await prisma.url.findMany({});
    return urls;
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return [];
  }
}