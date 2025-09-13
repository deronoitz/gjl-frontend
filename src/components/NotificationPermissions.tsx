'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, BellOff, Settings, X } from 'lucide-react';
import { NotificationService } from '@/lib/notification-service';
import { useAuth } from '@/contexts/CustomAuthContext';

export default function NotificationPermissions() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show to authenticated users
    if (!user) return;

    const checkNotificationStatus = async () => {
      const supported = NotificationService.isSupported();
      setIsSupported(supported);

      if (supported) {
        const currentPermission = NotificationService.getPermissionStatus();
        setPermission(currentPermission);

        const subscribed = await NotificationService.isSubscribed();
        setIsSubscribed(subscribed);

        // Show prompt if user hasn't been asked yet and notifications are supported
        if (currentPermission === 'default') {
          // Check localStorage to see if user dismissed the prompt
          const dismissed = localStorage.getItem('notification-prompt-dismissed');
          if (!dismissed) {
            setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
          }
        }
      }
    };

    checkNotificationStatus();
  }, [user]);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await NotificationService.subscribe();
      setPermission('granted');
      setIsSubscribed(true);
      setShowDialog(false);
      setShowPrompt(false);
      
      // Show success notification
      await NotificationService.showNotification(
        'Notifikasi Diaktifkan!',
        {
          body: 'Anda akan menerima notifikasi untuk pengumuman baru.',
          icon: '/android-chrome-192x192.png'
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
      
      // Update permission status in case it changed
      const currentPermission = NotificationService.getPermissionStatus();
      setPermission(currentPermission);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await NotificationService.unsubscribe();
      setIsSubscribed(false);
      setShowDialog(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Don't show anything if user is not authenticated or notifications not supported
  if (!user || !isSupported) return null;

  return (
    <>
      {/* Notification prompt banner */}
      {showPrompt && permission === 'default' && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-sm mx-auto md:left-auto md:right-4 md:max-w-md">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <strong>Aktifkan Notifikasi</strong>
                  <p className="mt-1">Dapatkan notifikasi langsung untuk pengumuman penting.</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissPrompt}
                  className="p-1 h-auto text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Mengaktifkan...' : 'Aktifkan'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={dismissPrompt}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Nanti Saja
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Settings button/icon */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            title={isSubscribed ? 'Notifikasi aktif' : 'Pengaturan notifikasi'}
          >
            {isSubscribed ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            {isSubscribed && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Pengaturan Notifikasi
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {permission === 'granted' && isSubscribed ? (
                    <Bell className="h-5 w-5 text-green-600" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      {permission === 'granted' && isSubscribed
                        ? 'Aktif - Anda akan menerima notifikasi'
                        : permission === 'denied'
                        ? 'Diblokir - Ubah di pengaturan browser'
                        : 'Nonaktif - Klik untuk mengaktifkan'
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {permission === 'granted' && isSubscribed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisableNotifications}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Nonaktifkan'}
                    </Button>
                  ) : permission !== 'denied' ? (
                    <Button
                      size="sm"
                      onClick={handleEnableNotifications}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Mengaktifkan...' : 'Aktifkan'}
                    </Button>
                  ) : null}
                </div>
              </div>

              {permission === 'denied' && (
                <Alert>
                  <AlertDescription className="text-sm">
                    Notifikasi diblokir oleh browser. Untuk mengaktifkan:
                    <ol className="mt-2 ml-4 list-decimal space-y-1">
                      <li>Klik ikon kunci/info di address bar</li>
                      <li>Pilih &quot;Notifications&quot; dan ubah ke &quot;Allow&quot;</li>
                      <li>Refresh halaman ini</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Notifikasi akan dikirim untuk pengumuman penting dari administrator.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
