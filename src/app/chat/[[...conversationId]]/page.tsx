import { ChatPanel } from '@/components/chat/chat-panel';
import { messages } from '@/lib/data';

export default function ChatPage({ params }: { params: { conversationId: string[] | undefined } }) {
  const conversationId = params.conversationId?.[0];
  const chatMessages = conversationId ? messages[conversationId] || [] : [];

  return <ChatPanel messages={chatMessages} conversationId={conversationId} />;
}
