'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [houseNumber, setHouseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!houseNumber || !password) {
      setError('Nomor rumah dan password harus diisi');
      return;
    }

    const success = await login(houseNumber, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Nomor rumah atau password salah');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Image src="/gjl-logo.png" alt="GJL Logo" className="w-48 mx-auto" width={300} height={100}/>
          <CardDescription className="text-center">
            Masuk dengan nomor rumah dan password Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="houseNumber">Nomor Rumah</Label>
              <Input
                id="houseNumber"
                type="text"
                placeholder="Contoh: A001"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <p><strong>Demo Accounts:</strong></p>
            <p>Admin: A001 / admin123</p>
            <p>User: A002 / user123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
