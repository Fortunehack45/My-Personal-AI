'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Conversation } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarMenuSkeleton } from '../ui/sidebar';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { deleteConversation as deleteConversationAction } from '@/lib/firebase-admin';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ConversationList() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingConvoId, setEditingConvoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const currentConversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId;

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const q = query(
        collection(db, 'users', user.uid, 'conversations'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const convos: Conversation[] = [];
        querySnapshot.forEach((doc) => {
          convos.push({ id: doc.id, ...doc.data() } as Conversation);
        });
        setConversations(convos);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching conversations:", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (editingConvoId && inputRef.current) {
        inputRef.current.focus();
    }
  }, [editingConvoId]);


  const handleStartEditing = (convo: Conversation) => {
    setEditingConvoId(convo.id);
    setEditingTitle(convo.title);
  };

  const handleCancelEditing = () => {
    setEditingConvoId(null);
    setEditingTitle('');
  };

  const handleSaveEditing = async () => {
    if (!editingConvoId || !user) return;
    try {
      const convoRef = doc(db, 'users', user.uid, 'conversations', editingConvoId);
      await updateDoc(convoRef, { title: editingTitle });
      toast({
        title: 'Conversation Renamed',
        description: 'The conversation title has been updated.',
      });
    } catch (error) {
      console.error('Error renaming conversation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to rename the conversation.',
      });
    } finally {
      handleCancelEditing();
    }
  };

  const handleDeleteConversation = async (convoId: string) => {
    if (!user) return;
    try {
        await deleteConversationAction({ userId: user.uid, conversationId: convoId });

        toast({
            title: "Conversation Deleted",
            description: "The conversation has been permanently removed.",
        });

        // If the deleted conversation is the current one, navigate away
        if (currentConversationId === convoId) {
            router.replace('/chat');
        }

    } catch (error) {
        console.error('Error deleting conversation:', error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete the conversation.",
        });
    }
  };

  const renderConversationItem = (convo: Conversation) => {
    if (editingConvoId === convo.id) {
        return (
             <div key={convo.id} className="flex items-center gap-1 p-1">
                <Input
                    ref={inputRef}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditing();
                        if (e.key === 'Escape') handleCancelEditing();
                    }}
                    className="h-8 flex-1"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveEditing}><Check className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEditing}><X className="h-4 w-4" /></Button>
            </div>
        )
    }

    return (
        <div key={convo.id} className="group relative">
            <Button
              variant={currentConversationId === convo.id ? 'secondary' : 'ghost'}
              className="w-full justify-start h-9 pr-8"
              asChild
            >
              <Link href={`/chat/${convo.id}`} className="truncate">
                <span className="truncate text-sm font-medium">{convo.title}</span>
              </Link>
            </Button>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStartEditing(convo)}><Edit className="h-4 w-4" /></Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this conversation and all of its messages.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteConversation(convo.id)} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
  }

  if (!user) {
    return null;
  }

  return (
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {isLoading ? (
            <div className="space-y-2">
                <SidebarMenuSkeleton />
                <SidebarMenuSkeleton />
                <SidebarMenuSkeleton />
            </div>
          ) : (
            conversations.map(renderConversationItem)
          )}
        </div>
      </ScrollArea>
  );
}
