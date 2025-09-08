'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { Phone } from 'lucide-react';

interface ChangePhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePhoneDialog({ open, onOpenChange }: ChangePhoneDialogProps) {
  const { changePhoneNumber, user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setPhoneNumber('');
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setMessage({ type: 'error', text: 'Nomor handphone tidak boleh kosong' });
      return;
    }

    // Basic validation for Indonesian phone numbers
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setMessage({ 
        type: 'error', 
        text: 'Format nomor handphone tidak valid. Contoh yang benar: 08123456789, 62812345678, +62812345678' 
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await changePhoneNumber(phoneNumber.trim());
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          resetForm();
          onOpenChange(false);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengganti nomor handphone' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    } else {
      // Pre-fill current phone number if available
      setPhoneNumber(user?.phoneNumber ? user.phoneNumber.replace(/^62/, '0') : '');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Ganti Nomor Handphone
          </DialogTitle>
          <DialogDescription>
            Masukkan nomor handphone baru. Nomor handphone akan dinormalisasi ke format Indonesia (+62).
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.text}
              </Alert>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Nomor Handphone</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08123456789"
                required
              />
              <p className="text-xs text-muted-foreground">
                Format yang didukung: 08123456789, 62812345678, atau +62812345678
              </p>
            </div>

            {user?.phoneNumber && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Nomor saat ini:</p>
                <p className="font-medium">{user.phoneNumber.replace(/^62/, '+62 ')}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Ganti Nomor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
