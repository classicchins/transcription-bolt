import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarProvider";
import { cn } from "@/lib/utils";

interface SidebarTriggerProps {
  className?: string;
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("lg:hidden", className)}
      onClick={toggle}
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}