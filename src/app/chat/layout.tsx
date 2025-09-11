import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/chat/user-nav';
import { ConversationList } from '@/components/chat/conversation-list';
import { ContextPanel } from '@/components/chat/context-panel';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SheetTitle } from '@/components/ui/sheet';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <Sidebar>
          <SheetTitle className="sr-only">Sidebar</SheetTitle>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <div className="space-y-2 p-2">
                <Button className="w-full justify-start font-headline" asChild>
                    <Link href="/chat">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Conversation
                    </Link>
                </Button>
                <form>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8" />
                  </div>
                </form>
            </div>
            <ConversationList />
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col md:pl-[var(--sidebar-width-icon)] lg:pl-[var(--sidebar-width)]">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              {/* Title can be dynamic based on conversation */}
              <h1 className="font-headline font-semibold text-lg">New Conversation</h1>
            </div>
            <UserNav />
          </header>
          <div className="flex flex-1">
            <SidebarInset className="flex-1">
              {children}
            </SidebarInset>
            <aside className="hidden w-96 border-l bg-background lg:block">
              <ContextPanel />
            </aside>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
