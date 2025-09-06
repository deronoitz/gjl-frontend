'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Home, LogOut, DollarSign, CreditCard, Camera, Users, Megaphone, Settings, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Keuangan', href: '/finance', icon: DollarSign },
  { name: 'Pembayaran', href: '/payment', icon: CreditCard },
  { name: 'Galeri', href: '/gallery', icon: Camera },
];

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Keuangan', href: '/finance', icon: DollarSign },
  { name: 'Pembayaran', href: '/payment', icon: CreditCard },
  { name: 'Galeri', href: '/gallery', icon: Camera },
  { name: 'Warga', href: '/admin/users', icon: Users },
  { name: 'Pengumuman', href: '/admin/announcements', icon: Megaphone },
  { name: 'Settings', href: '/admin/settings', icon: Settings }
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const navItems = isAdmin ? adminNavItems : navigationItems;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              {/* <Home className="h-8 w-8 text-blue-600" /> */}
              <Image src="/gjl-logo.png" alt="GJL Logo" className="w-24" width={200} height={200}/>
              {/* <span className="text-xl font-bold">Griya Jannatin Leyangan</span> */}
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant={isAdmin ? 'destructive' : 'secondary'}>
                {isAdmin ? 'Admin' : 'User'}
              </Badge>
              <span className="text-sm font-medium">{user.houseNumber}</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.houseNumber.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Ganti Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <ChangePasswordDialog 
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </nav>
  );
}
