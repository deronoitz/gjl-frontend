import ProtectedRoute from "@/components/ProtectedRoute";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
