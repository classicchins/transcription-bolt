import { Link } from 'react-router-dom';
import { FileText, Upload, Users, CreditCard, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserNav } from './UserNav';
import { useSidebar } from './SidebarProvider';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Transcriptions', href: '/dashboard/transcriptions', icon: FileText },
  { name: 'Upload', href: '/dashboard/upload', icon: Upload },
  { name: 'Team', href: '/dashboard/team', icon: Users, disabled: true },
  { name: 'Credits', href: '/dashboard/credits', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const { isOpen } = useSidebar();

  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 flex w-[280px] flex-col bg-background transition-transform duration-300 lg:relative lg:transform-none",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Transcriber</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-3",
                item.disabled && "opacity-50 cursor-not-allowed",
                "hover:bg-muted/50"
              )}
              asChild={!item.disabled}
              disabled={item.disabled}
            >
              {!item.disabled ? (
                <Link to={item.href} className="flex items-center">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="ml-2">{item.name}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs text-muted-foreground">(Soon)</span>
                  )}
                </Link>
              ) : (
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="ml-2">{item.name}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs text-muted-foreground">(Soon)</span>
                  )}
                </div>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <UserNav />
      </div>
    </div>
  );
}