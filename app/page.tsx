"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getShortUrl } from "@/actions/getshorturl";
import { Quintessential } from "next/font/google";

const quintessential = Quintessential({
  subsets: ["latin"],
  weight: ["400"],
});

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import Datatable from "@/components/table"; // Your provided Datatable component

const formSchema = z.object({
  url: z.string().min(2, {
    message: "URL must be at least 2 characters.",
  }),
});

export default function ProfileForm() {
  const [shortUrl, setshortUrl] = useState("");

  // 1. Add a state to control the table refresh
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  // inside onSubmit in app/page.tsx
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await getShortUrl(values.url);
      if (result.success && result.data) {
        // 2. Increment the refresh key
        setRefreshKey((prevKey) => prevKey + 1);
        setshortUrl(result.data.short);
        toast.success("Short URL generated successfully!");
      } else {
        console.error("Error generating short URL:", result.error);
        toast.error(
          result.error || "Failed to generate short URL. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error generating short URL:", error);
      toast.error("Failed to generate short URL. Please try again.");
    }
  }

  return (
    <div
      className={`flex flex-col justify-center items-center min-h-screen py-10 bg-[#C4A484] ${quintessential.className}`}
    >
      <Card className="w-5/6 lg:w-1/2 mb-10 bg-[#F7F1DE]">
        <CardHeader>
          <CardTitle className="text-5xl m-2 text-center">
            URL Shortener
          </CardTitle>
          <CardDescription className="text-2xl m-2 text-center">
            Make your URL shorter and get more engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter your URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Generate Short URL</Button>
            </form>
          </Form>

          {shortUrl && (
            <div className="mt-6 p-4 bg-secondary rounded-md">
              <h2 className="font-semibold mb-2">Your short URL is:</h2>
              <a
                href={`http://localhost:3000/${shortUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                http://localhost:3000/{shortUrl}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Pass the refreshKey as the 'key' prop. 
         When this number changes, React unmounts and remounts 
         this component, triggering the useEffect fetch again.
      */}
      <Datatable key={refreshKey} />
    </div>
  );
}
