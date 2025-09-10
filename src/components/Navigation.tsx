'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Home, LogOut, DollarSign, CreditCard, Camera, Users, Megaphone, Settings, Lock, Menu, X, ChevronDown, ChevronUp, Network, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import ChangePhoneDialog from '@/components/ChangePhoneDialog';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { 
    name: 'Keuangan', 
    icon: DollarSign,
    subItems: [
      { name: 'Laporan Keuangan', href: '/finance', icon: DollarSign },
      { name: 'Pembayaran', href: '/payment', icon: CreditCard },
    ]
  },
  { name: 'Galeri', href: '/gallery', icon: Camera },
  { 
    name: 'Warga', 
    icon: Users,
    subItems: [
      { name: 'Daftar Warga', href: '/warga', icon: Users },
      { name: 'Struktur Organisasi', href: '/struktur-organisasi', icon: Network },
    ]
  },
];

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { 
    name: 'Keuangan', 
    icon: DollarSign,
    subItems: [
      { name: 'Laporan Keuangan', href: '/finance', icon: DollarSign },
      { name: 'Pembayaran', href: '/payment', icon: CreditCard },
      { name: 'Laporan Iuran', href: '/admin/payment-report', icon: CreditCard },
    ]
  },
  { name: 'Galeri', href: '/gallery', icon: Camera },
  { 
    name: 'Warga', 
    icon: Users,
    subItems: [
      { name: 'Daftar Warga', href: '/warga', icon: Users },
      { name: 'Kelola Warga', href: '/admin/users', icon: Users },
      { name: 'Struktur Organisasi', href: '/struktur-organisasi', icon: Network },
    ]
  },
  { name: 'Pengumuman', href: '/admin/announcements', icon: Megaphone }
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangePhoneOpen, setIsChangePhoneOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState<{[key: string]: boolean}>({});

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileDropdown = (itemName: string) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const isActiveParent = (subItems?: Array<{href: string}>) => {
    if (!subItems) return false;
    return subItems.some(subItem => pathname === subItem.href);
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const navItems = isAdmin ? adminNavItems : navigationItems;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white backdrop-blur-md shadow-md border-b border-white/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Image src="/gjl-logo.png" alt="GJL Logo" className="w-24" width={200} height={200}/>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => {
                  if (item.subItems) {
                    // Render dropdown for items with sub-items
                    return (
                      <DropdownMenu key={item.name}>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                              isActiveParent(item.subItems)
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <span>{item.name}</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {item.subItems.map((subItem) => (
                            <DropdownMenuItem key={subItem.href} asChild>
                              <Link
                                href={subItem.href}
                                className={`flex items-center space-x-2 ${
                                  pathname === subItem.href 
                                    ? 'bg-emerald-50 text-emerald-900' 
                                    : ''
                                }`}
                              >
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.name}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  } else {
                    // Render regular link for items without sub-items
                    return (
                      <Link
                        key={item.href}
                        href={item.href!}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          pathname === item.href
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  }
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Desktop User Info */}
              <div className="hidden md:flex items-center space-x-2">
                <Badge variant={isAdmin ? 'destructive' : 'secondary'}>
                  {isAdmin ? 'Admin' : 'User'}
                </Badge>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="h-8 w-8"
                  aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {/* Desktop Dropdown */}
              <div className="hidden md:block">
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
                    <DropdownMenuItem onClick={() => setIsChangePhoneOpen(true)}>
                      <Phone className="mr-2 h-4 w-4" />
                      <span>Ganti Nomor HP</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
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

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* User Info in Mobile */}
                <div className="flex items-center justify-between px-3 py-3 bg-white/90 backdrop-blur-sm rounded-md mb-3 shadow-sm border border-white/30">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.houseNumber.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                      <Badge 
                        variant={isAdmin ? 'destructive' : 'secondary'}
                        className="w-fit text-xs mt-1"
                      >
                        {isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    
                    if (item.subItems) {
                      // Render dropdown for items with sub-items
                      return (
                        <div key={item.name}>
                          <button
                            onClick={() => toggleMobileDropdown(item.name)}
                            className={`flex items-center justify-between w-full px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                              isActiveParent(item.subItems)
                                ? 'bg-emerald-100/80 text-emerald-900 border-l-4 border-emerald-500'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-white/70'
                            }`}
                          >
                            <div className="flex items-center">
                              <Icon className="mr-3 h-5 w-5" />
                              {item.name}
                            </div>
                            {mobileDropdowns[item.name] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          {mobileDropdowns[item.name] && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.subItems.map((subItem) => {
                                const SubIcon = subItem.icon;
                                return (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                      pathname === subItem.href
                                        ? 'bg-emerald-100/80 text-emerald-900 border-l-4 border-emerald-500'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <SubIcon className="mr-3 h-4 w-4" />
                                    {subItem.name}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Render regular link for items without sub-items
                      return (
                        <Link
                          key={item.href}
                          href={item.href!}
                          className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                            pathname === item.href
                              ? 'bg-emerald-100/80 text-emerald-900 border-l-4 border-emerald-500'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-white/70'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    }
                  })}
                </div>

                {/* Mobile Action Buttons */}
                <div className="border-t pt-3 mt-3 space-y-1">
                  <button
                    onClick={() => {
                      setIsChangePasswordOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/70 transition-colors"
                  >
                    <Lock className="mr-3 h-5 w-5" />
                    Ganti Password
                  </button>
                  <button
                    onClick={() => {
                      setIsChangePhoneOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/70 transition-colors"
                  >
                    <Phone className="mr-3 h-5 w-5" />
                    Ganti Nomor HP
                  </button>
                  {isAdmin && (
                    <Link
                      href="/admin/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center w-full px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/70 transition-colors"
                    >
                      <Settings className="mr-3 h-5 w-5" />
                      Settings
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-3 py-3 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ChangePasswordDialog 
          open={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
        />
        
        <ChangePhoneDialog 
          open={isChangePhoneOpen}
          onOpenChange={setIsChangePhoneOpen}
        />
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
