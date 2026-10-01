import { PushNotificationManager } from '@/components/admin/PushNotificationManager';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <PushNotificationManager />
      {children}
    </div>
  );
}
