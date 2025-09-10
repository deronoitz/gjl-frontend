'use client';

import { useState } from 'react';
import { useUsers, User } from '@/hooks/use-users-admin';
import { usePositions } from '@/hooks/use-positions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Loader2, Home, Calendar, ShieldCheck, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AdminUsersPage() {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const { positions, loading: positionsLoading, error: positionsError } = usePositions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    houseNumber: '',
    name: '',
    phoneNumber: '',
    position_id: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.houseNumber || !formData.name) {
      setMessage('Nomor rumah dan nama harus diisi');
      return;
    }

    if (!editingUser && !formData.password) {
      setMessage('Password harus diisi untuk user baru');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingUser) {
        // Update existing user
        await updateUser(editingUser.id, {
          houseNumber: formData.houseNumber,
          name: formData.name,
          phoneNumber: formData.phoneNumber || undefined,
          position_id: formData.position_id || undefined,
          password: formData.password || undefined,
          role: formData.role
        });
        setMessage('User berhasil diupdate');
      } else {
        // Add new user
        await createUser({
          houseNumber: formData.houseNumber,
          name: formData.name,
          phoneNumber: formData.phoneNumber || undefined,
          position_id: formData.position_id || undefined,
          password: formData.password,
          role: formData.role
        });
        setMessage('User berhasil ditambahkan');
      }

      // Reset form
      setFormData({ houseNumber: '', name: '', phoneNumber: '', position_id: '', password: '', role: 'user' });
      setEditingUser(null);
      setIsDialogOpen(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      houseNumber: user.house_number,
      name: user.name,
      phoneNumber: user.phone_number || '',
      position_id: user.position_id || '',
      password: '',
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        await deleteUser(userId);
        setMessage('User berhasil dihapus');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Gagal menghapus user');
      }
    }
  };

  const resetDialog = () => {
    setFormData({ houseNumber: '', name: '', phoneNumber: '', position_id: '', password: '', role: 'user' });
    setEditingUser(null);
    setMessage('');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="space-y-3">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              Kelola Warga
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Kelola warga dan admin yang memiliki akses ke sistem.
            </p>
          </div>
          
          {isMobile ? (
            <Drawer open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetDialog();
            }}>
              <DrawerTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah User
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle className="text-lg">
                    {editingUser ? 'Edit User' : 'Tambah User Baru'}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="max-h-[70vh] overflow-y-auto px-1">
                  <form id="user-form" onSubmit={handleSubmit} className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Label htmlFor="houseNumber" className="text-sm font-medium">Nomor Rumah</Label>
                      <Input
                        id="houseNumber"
                        value={formData.houseNumber}
                        onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                        placeholder="Contoh: A-01"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Nama</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nama lengkap"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">Nomor Handphone</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="Contoh: +62-812-3456-7890"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-sm font-medium">Jabatan</Label>
                      {positionsError && (
                        <div className="text-xs text-red-500 mb-1">Error loading positions: {positionsError}</div>
                      )}
                      <select
                        id="position"
                        value={formData.position_id}
                        onChange={(e) => {
                          const selectedPositionId = e.target.value;
                          setFormData({ 
                            ...formData, 
                            position_id: selectedPositionId
                          });
                        }}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        disabled={positionsLoading}
                      >
                        <option value="">Pilih Jabatan (opsional)</option>
                        {positions.map((position) => (
                          <option key={position.id} value={position.id}>
                            {position.position}
                          </option>
                        ))}
                      </select>
                      {positionsLoading && (
                        <div className="text-xs text-gray-500">Loading positions...</div>
                      )}
                      <div className="text-xs text-gray-400">Positions loaded: {positions.length}</div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password {editingUser && <span className="text-xs text-muted-foreground">(kosongkan jika tidak ingin mengubah)</span>}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    {message && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertDescription className="text-sm">{message}</AlertDescription>
                      </Alert>
                    )}
                  </form>
                </div>
                <DrawerFooter className="pt-4 border-t bg-background">
                  <div className="flex flex-col space-y-2">
                    <Button type="submit" size="lg" form="user-form" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (editingUser ? 'Update' : 'Tambah')}
                    </Button>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetDialog();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah User
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-2 md:mx-0 w-[calc(100vw-1rem)] md:w-full max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">
                    {editingUser ? 'Edit User' : 'Tambah User Baru'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="houseNumber" className="text-sm font-medium">Nomor Rumah</Label>
                    <Input
                      id="houseNumber"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                      placeholder="Contoh: A-01"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Nama</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama lengkap"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium">Nomor Handphone</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="Contoh: +62-812-3456-7890"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium">Jabatan</Label>
                    {positionsError && (
                      <div className="text-xs text-red-500 mb-1">Error loading positions: {positionsError}</div>
                    )}
                    <select
                      id="position"
                      value={formData.position_id}
                      onChange={(e) => {
                        const selectedPositionId = e.target.value;
                        setFormData({ 
                          ...formData, 
                          position_id: selectedPositionId
                        });
                      }}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      disabled={positionsLoading}
                    >
                      <option value="">Pilih Jabatan (opsional)</option>
                      {positions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.position}
                        </option>
                      ))}
                    </select>
                    {positionsLoading && (
                      <div className="text-xs text-gray-500">Loading positions...</div>
                    )}
                    <div className="text-xs text-gray-400">Positions loaded: {positions.length}</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password {editingUser && <span className="text-xs text-muted-foreground">(kosongkan jika tidak ingin mengubah)</span>}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {message && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertDescription className="text-sm">{message}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-col-reverse md:flex-row justify-end space-y-2 space-y-reverse md:space-y-0 md:space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11">
                      Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="h-11">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (editingUser ? 'Update' : 'Tambah')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {(message || error) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-sm">{message || error}</AlertDescription>
        </Alert>
      )}

      {/* Mobile Card Layout / Desktop Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 md:pb-0">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            Daftar Warga ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 md:px-6">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3 px-4 pb-4">
                {users.map((user) => (
                  <Card key={user.id} className="border border-gray-200 hover:shadow-sm py-0 transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-base">{user.house_number}</span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">{user.name}</p>
                          {user.phone_number && (
                            <p className="text-xs text-gray-500">📞 {user.phone_number}</p>
                          )}
                          {user.positions?.position && (
                            <p className="text-xs text-gray-500">🏛️ {user.positions.position}</p>
                          )}
                        </div>
                        <Badge 
                          variant={user.role === 'admin' ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {user.role === 'admin' ? (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <UserIcon className="h-3 w-3 mr-1" />
                              User
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(user.created_at), 'dd MMM yyyy', { locale: id })}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-muted-foreground">Belum ada user terdaftar</p>
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Rumah</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>No. Handphone</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.house_number}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.phone_number || '-'}</TableCell>
                        <TableCell>{user.positions?.position || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), 'dd MMM yyyy', { locale: id })}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
