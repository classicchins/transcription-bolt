import { SidebarProvider } from './SidebarProvider';
import { Sidebar } from './Sidebar';
import { DashboardRoutes } from '../../routes';
import { SidebarTrigger } from './SidebarTrigger';
import { Separator } from '@/components/ui/separator';

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <div className="flex relative">
          <Sidebar />
          <Separator orientation="vertical" className="h-full" />
        </div>
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 px-6">
              <SidebarTrigger className="-ml-3" />
              <Separator orientation="vertical" className="h-4 hidden lg:block" />
            </div>
          </header>
          <main className="flex-1">
            <div className="container py-6">
              <DashboardRoutes />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}