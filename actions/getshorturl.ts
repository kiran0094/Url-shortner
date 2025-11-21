"use server";
import prisma from "@/lib/db";

// Helper: Generate random 6-character string
function generateShortCode(length: number = 6): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function getShortUrl(originalUrl: string) {
  let urlToValidate = originalUrl;

  // 1. Ensure Protocol (http/https) exists
  if (!/^https?:\/\//i.test(urlToValidate)) {
    urlToValidate = "https://" + urlToValidate;
  }

  // 2. Validate URL (Check if website exists and returns 200 OK)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(urlToValidate, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status !== 200) {
      return { success: false, error: `URL is invalid (Status: ${response.status})` };
    }
  } catch (error) {
    console.error("Validation Error:", error);
    return { success: false, error: "URL is invalid or unreachable" };
  }

  // 3. Generate Unique Short Code (Handle Collisions)
  let shortCode = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    shortCode = generateShortCode();
    
    // Check DB for existing code
    const existing = await prisma.url.findUnique({
      where: { short: shortCode }, // Matches your schema field 'short'
    });

    if (!existing) {
      isUnique = true;
    } else {
      attempts++;
    }
  }

  if (!isUnique) {
    return { success: false, error: "Could not generate a unique code. Please try again." };
  }

  // 4. Save to Database
  try {
    const newUrl = await prisma.url.create({
      data: {
        original: urlToValidate,
        short: shortCode,
        lastVisited: new Date(),
      },
    });

    return { success: true, data: newUrl };
    
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to save URL to database" };
  }
}