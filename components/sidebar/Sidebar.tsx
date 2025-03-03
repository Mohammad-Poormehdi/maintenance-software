"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  ChevronLeft, 
  ChevronRight, 
  BarChart2, 
  Wrench,
  Package, 
  Calendar, 
  ShoppingCart, 
  Users,
  Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  isMobile?: boolean;
}

function NavItem({ href, icon, label, isExpanded, isMobile = false }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center p-3 rounded-lg mb-1 transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-accent hover:text-accent-foreground",
        !isExpanded && !isMobile && "justify-center"
      )}
    >
      <div className="flex items-center">
        {!isMobile && icon}
        {(isExpanded || isMobile) && (
          <span className={cn("mr-3 rtl:ml-0 rtl:mr-3", isMobile && "mr-0")}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
}

// Mobile drawer version of navigation
function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  
  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[240px] py-4">
        <div className="px-2 py-4">
          <h1 className="text-xl font-bold mb-6">نرم‌افزار تعمیر و نگهداری</h1>
          
          <div className="space-y-1">
            <NavItem 
              href="/analytics" 
              icon={<BarChart2 size={20} />} 
              label="تحلیل‌ها" 
              isExpanded={true}
              isMobile={true}
            />
            <NavItem 
              href="/equipments" 
              icon={<Wrench size={20} />}
              label="تجهیزات" 
              isExpanded={true}
              isMobile={true}
            />
            <NavItem 
              href="/maintenance-schedule" 
              icon={<Calendar size={20} />} 
              label="برنامه نگهداری" 
              isExpanded={true}
              isMobile={true}
            />
            <NavItem 
              href="/orders" 
              icon={<ShoppingCart size={20} />} 
              label="سفارش‌ها" 
              isExpanded={true}
              isMobile={true}
            />
            <NavItem 
              href="/inventory" 
              icon={<Package size={20} />} 
              label="موجودی" 
              isExpanded={true}
              isMobile={true}
            />
            <NavItem 
              href="/suppliers" 
              icon={<Users size={20} />} 
              label="تامین‌کنندگان" 
              isExpanded={true}
              isMobile={true}
            />
          </div>
          
          <div className="mt-auto pt-6">
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  
  return (
    <>
      {/* Mobile Drawer - Only show on mobile */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">نرم‌افزار تعمیر و نگهداری</h1>
        <MobileNav />
      </div>
      
      {/* Desktop Sidebar - Only shown via SidebarWrapper on md+ screens */}
      <div className="hidden md:flex h-full py-4 flex-col border-l">
        <div className="px-4 flex items-center justify-between mb-6">
          {isExpanded && <h1 className="text-xl font-bold">نرم‌افزار تعمیر و نگهداری</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className={cn(!isExpanded && "mx-auto")}
          >
            {isExpanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        <div className="space-y-1 px-2 flex-1">
          <NavItem 
            href="/analytics" 
            icon={<BarChart2 size={20} />} 
            label="تحلیل‌ها" 
            isExpanded={isExpanded} 
          />
          <NavItem 
            href="/equipments" 
            icon={<Wrench size={20} />}
            label="تجهیزات" 
            isExpanded={isExpanded} 
          />
          <NavItem 
            href="/maintenance-schedule" 
            icon={<Calendar size={20} />} 
            label="برنامه نگهداری" 
            isExpanded={isExpanded} 
          />
          <NavItem 
            href="/orders" 
            icon={<ShoppingCart size={20} />} 
            label="سفارش‌ها" 
            isExpanded={isExpanded} 
          />
          <NavItem 
            href="/inventory" 
            icon={<Package size={20} />} 
            label="موجودی" 
            isExpanded={isExpanded} 
          />
          <NavItem 
            href="/suppliers" 
            icon={<Users size={20} />} 
            label="تامین‌کنندگان" 
            isExpanded={isExpanded} 
          />
        </div>
        
        <div className={cn("mt-auto px-4", !isExpanded && "flex justify-center")}>
          <ThemeToggle compact={!isExpanded} />
        </div>
      </div>
    </>
  );
} 