import ProtectedRoute from '@/components/ProtectedRoute';

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
