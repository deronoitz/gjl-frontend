"use client";

import { Home, Phone, User, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Resident } from "@/hooks/use-residents";
import { memo } from "react";

interface ResidentTableProps {
  residents: Resident[];
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

const ActionButtons = memo(function ActionButtons({
  phoneNumber,
}: {
  phoneNumber?: string;
}) {
  if (!phoneNumber) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePhoneCall(phoneNumber)}
        aria-label="Telepon"
      >
        <Phone className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => handleWhatsApp(phoneNumber)}
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  );
});

export const ResidentTable = memo(function ResidentTable({
  residents,
}: ResidentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nomor Rumah</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>No. Telepon</TableHead>
          <TableHead>Jabatan</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {residents.map((resident) => (
          <TableRow key={resident.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-gray-600" />
                {resident.house_number}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{resident.name}</span>
              </div>
            </TableCell>
            <TableCell>
              {resident.phone_number ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <a
                    href={`tel:${resident.phone_number}`}
                    className="hover:text-green-600 transition-colors"
                  >
                    {resident.phone_number}
                  </a>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell>
              {resident.positions ? (
                <Badge
                  variant="default"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {resident.positions.position}
                </Badge>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell>
              <ActionButtons phoneNumber={resident.phone_number} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
