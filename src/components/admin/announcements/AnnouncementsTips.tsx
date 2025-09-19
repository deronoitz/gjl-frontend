"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { memo } from "react";

const tips = [
  "Gunakan judul yang jelas dan mudah dipahami",
  "Tulis informasi yang lengkap dan akurat",
  "Pengumuman terbaru akan muncul di dashboard warga",
];

export const AnnouncementsTips = memo(function AnnouncementsTips() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-gray-600" />
          Tips Pengumuman
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
          <div className="grid gap-1">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
