import { redirect, notFound } from "next/navigation";
import db from "@/lib/db";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function ShortRedirectPage({ params }: PageProps) {
  const { code } = await params;

  // 1. Find the record first
  // We use findFirst so it works even if 'short' isn't marked @unique in schema yet
  const data = await db.url.findFirst({
    where: {
      short: code,
    },
  });

  // 2. If not found, show 404 immediately
  if (!data) {
    return notFound();
  }

  // 3. Update the stats
  // We use the 'id' from step 1 to ensure we update the exact right row
  await db.url.update({
    where: {
      id: data.id,
    },
    data: {
      visitCount: { increment: 1 }, // Adds 1 to existing count
      lastVisited: new Date(), // Sets to current timestamp
    },
  });

  // 4. Redirect to the original URL
  redirect(data.original);
}
