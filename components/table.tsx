"use client";
import React, { useEffect, useState } from "react";
import { Trash2, ExternalLink } from "lucide-react";
import { deleteUrl } from "@/actions/deleteurls";
import { getAllUrls } from "@/actions/getallurls";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
  TableFooter, // Added this import
} from "@/components/ui/table";

import { Button } from "./ui/button";

// Define the shape of your Prisma data
interface UrlData {
  id: number;
  original: string;
  short: string;
  visitCount: number;
  createdAt: string;
  lastVisited: string | null;
}

// Raw shape returned from getAllUrls which may include Date objects
interface RawUrl {
  id: number;
  original: string;
  short: string;
  visitCount: number;
  createdAt: string | Date;
  lastVisited: string | Date | null;
}

// 1. Defined the Component Function
function UrlTable() {
  // 2. Initialized State
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Optional: Good for UX

  // 3. Fetch from API route (server-only Prisma stays on server)
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const data: RawUrl[] = await getAllUrls();

        const formattedData: UrlData[] = data.map((item) => ({
          id: item.id,
          original: item.original,
          short: item.short,
          visitCount: item.visitCount,
          createdAt:
            item.createdAt instanceof Date
              ? item.createdAt.toISOString()
              : String(item.createdAt),
          lastVisited:
            item.lastVisited instanceof Date
              ? item.lastVisited.toISOString()
              : (item.lastVisited as string | null),
        }));

        setUrls(formattedData);
      } catch (error) {
        console.error("Failed to fetch URLs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete ID: ${id}?`)) return;
    try {
      await deleteUrl(id);
      // Refresh the URLs list to show updated sequential IDs
      const data: RawUrl[] = await getAllUrls();
      const formattedData: UrlData[] = data.map((item) => ({
        id: item.id,
        original: item.original,
        short: item.short,
        visitCount: item.visitCount,
        createdAt:
          item.createdAt instanceof Date
            ? item.createdAt.toISOString()
            : String(item.createdAt),
        lastVisited:
          item.lastVisited instanceof Date
            ? item.lastVisited.toISOString()
            : (item.lastVisited as string | null),
      }));
      setUrls(formattedData);
    } catch (error) {
      console.error("Failed to delete URL:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-[#F7F1DE] rounded-xl shadow-sm border mt-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">URL Dashboard</h2>
          <p className="text-muted-foreground text-gray-500">
            Manage your shortened links and view analytics.
          </p>
        </div>
      </div>

      <div className="rounded-md border font-mono">
        <Table>
          <TableCaption>A list of your shortened URLs.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead className="w-[120px]">Short Code</TableHead>
              <TableHead className="text-center">Visits</TableHead>
              <TableHead>Last Visited</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : urls.length > 0 ? (
              urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell className="font-medium text-gray-600">
                    {url.id}
                  </TableCell>
                  <TableCell className="max-w-[250px]" title={url.original}>
                    <div className="flex items-center gap-2">
                      <span className="truncate block">{url.original}</span>
                      <a
                        href={url.original}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate block">{url.short}</span>
                      <a
                        href={`http://localhost:3000/${url.short}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    {url.visitCount}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(url.lastVisited)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(url.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(url.id)}
                      title="Delete URL"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  No URLs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* 4. Corrected Footer Nesting */}
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>Total Active URLs</TableCell>
              <TableCell className="text-right">{urls.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

// Default export for the preview to render
export default function Datatable() {
  return <UrlTable />;
}
