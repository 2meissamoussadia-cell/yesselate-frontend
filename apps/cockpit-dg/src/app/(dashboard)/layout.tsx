import { CommandHeader } from '@/components/header';
import { ExecutivePanel } from '@/components/controls';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <CommandHeader />
      <main className="p-6 pb-20">{children}</main>
      <ExecutivePanel />
    </div>
  );
}
