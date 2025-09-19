"use client";

import { Home, Phone, User, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Resident } from "@/hooks/use-residents";
import { memo } from "react";

interface ResidentCardProps {
  resident: Resident;
}

const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "");
};

const handlePhoneCall = (phoneNumber: string) => {
  window.open(`tel:${phoneNumber}`);
};

const handleWhatsApp = (phoneNumber: string) => {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  window.open(`https://wa.me/${formattedNumber}`, "_blank");
};

export const ResidentCard = memo(function ResidentCard({
  resident,
}: ResidentCardProps) {
  return (
    <Card className="border border-gray-200 hover:shadow-sm py-0 transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-base">
                {resident.house_number}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {resident.name}
            </p>
            {resident.phone_number && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="h-3 w-3" />
                <a
                  href={`tel:${resident.phone_number}`}
                  className="hover:text-green-600 transition-colors"
                >
                  {resident.phone_number}
                </a>
              </div>
            )}
            {resident.positions?.position && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>{resident.positions.position}</span>
              </div>
            )}
          </div>
          {resident.positions && (
            <Badge
              variant="default"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs"
            >
              {resident.positions.position}
            </Badge>
          )}
        </div>

        {/* Action buttons for mobile */}
        {resident.phone_number && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8"
                onClick={() => handlePhoneCall(resident.phone_number!)}
              >
                <Phone className="h-3 w-3 mr-1" />
                Telepon
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleWhatsApp(resident.phone_number!)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
