import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/chat/user-nav';
import { ConversationList } from '@/components/chat/conversation-list';
import { ContextPanel } from '@/components/chat/context-panel';
import { Button } from '@/components/ui/button';
import { Search, Plus, MessageSquare, Settings2, FileText, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <div className="space-y-2 p-2">
                <Button className="w-full justify-start font-headline bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <Link href="/chat">
                        <Plus className="mr-2 h-4 w-4" />
                        New Conversation
                    </Link>
                </Button>
            </div>
            <ConversationList />
          </SidebarContent>
          <SidebarFooter className='mt-auto'>
            <Separator className="my-2" />
            <div className='p-2 flex flex-col gap-2'>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/memory">
                  <Bot className="mr-2 h-4 w-4" />
                  AI Memory
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/settings">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col md:pl-[var(--sidebar-width-icon)] lg:pl-[calc(var(--sidebar-width)_+_1rem)] transition-[margin-left] duration-200 ease-linear group-data-[state=expanded]/sidebar-wrapper:lg:pl-[calc(var(--sidebar-width)_+_1rem)] group-data-[state=collapsed]/sidebar-wrapper:lg:pl-[calc(var(--sidebar-width-icon)_+_1rem)]">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-20 lg:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className='md:hidden' />
              <h1 className="font-headline font-semibold text-xl lg:text-2xl truncate">New Conversation</h1>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <UserNav />
            </div>

          </header>
          <div className="flex flex-1">
            <SidebarInset className="flex-1 bg-muted/20">
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
