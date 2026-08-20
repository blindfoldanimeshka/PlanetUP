import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import {
  CalendarDays,
  ChevronsUpDown,
  CreditCard,
  FileText,
  HelpCircle,
  Images,
  LogOut,
  Settings2,
  Sparkles,
  Star,
  Users,
  UsersRound,
} from "lucide-react";

type SectionKey =
  | "settings"
  | "trainers"
  | "subscriptions"
  | "groups"
  | "faq"
  | "testimonials"
  | "lifePosts"
  | "gallery"
  | "submissions";

const SECTIONS: {
  key: SectionKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "settings", title: "Контакты и SEO", icon: Settings2 },
  { key: "trainers", title: "Тренеры", icon: Users },
  { key: "subscriptions", title: "Абонементы", icon: CreditCard },
  { key: "groups", title: "Группы", icon: UsersRound },
  { key: "faq", title: "Вопросы и ответы", icon: HelpCircle },
  { key: "testimonials", title: "Отзывы", icon: Star },
  { key: "lifePosts", title: "Жизнь коллектива", icon: CalendarDays },
  { key: "gallery", title: "Галерея", icon: Images },
  { key: "submissions", title: "Заявки", icon: FileText },
];

function initials(name?: string): string {
  if (!name) return "А";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 1).toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
}

export interface AdminSidebarProps {
  activeSection: string;
  onSelectSection: (section: SectionKey) => void;
  user?: { name: string; email: string; avatar?: string };
  onLogout?: () => void;
  children?: React.ReactNode;
}

export function AdminSidebar({
  activeSection,
  onSelectSection,
  user,
  onLogout,
  children,
}: AdminSidebarProps) {
  const current = SECTIONS.find((s) => s.key === activeSection) ?? SECTIONS[0];

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="[&_[data-slot=sidebar-inner]]:bg-transparent [&_[data-slot=sidebar-container]]:border-r-0"
      >
          <div className="flex h-full w-full flex-col rounded-2xl bg-white/8 backdrop-blur-md border border-white/15 p-0">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Планета UP</span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  Админ
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Панель</SidebarGroupLabel>
              <SidebarMenu>
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <SidebarMenuItem key={s.key}>
                      <SidebarMenuButton
                        tooltip={s.title}
                        isActive={activeSection === s.key}
                        onClick={() => onSelectSection(s.key)}
                      >
                        <Icon className="size-4" />
                        <span>{s.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md p-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:bg-sidebar-accent"
                >
                  <Avatar className="size-8 rounded-md">
                    <AvatarImage
                      src={user?.avatar ?? ""}
                      alt={user?.name ?? "Админ"}
                    />
                    <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                      {initials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.name ?? "Администратор"}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {user?.email ?? "admin@planetaup.ru"}
                    </span>
                  </div>
                  <ChevronsUpDown className="size-4 text-sidebar-foreground/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuLabel>
                  {user?.email ?? "admin@planetaup.ru"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Аккаунт
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="size-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
          </div>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-sidebar-border px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Панель</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{current.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
