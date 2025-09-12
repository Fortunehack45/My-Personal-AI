import { Timestamp } from "firebase/firestore";

export type Conversation = {
  id: string;
  title: string;
  createdAt: Timestamp;
  userId: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Timestamp;
  status?: 'thinking';
};

export type Feedback = {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  messageContent: string;
  rating: 'like' | 'dislike';
  reason?: string;
  submittedAt: Timestamp;
}

export const conversations: Conversation[] = [
  { id: '1', title: 'Explaining Recursion', createdAt: Timestamp.now(), userId: 'mock' },
  { id: '2', title: 'Plan a trip to Japan', createdAt: Timestamp.now(), userId: 'mock' },
  { id: '3', title: 'Creative story about a sparrow', createdAt: Timestamp.now(), userId: 'mock' },
  { id: '4', title: 'Fix my React component', createdAt: Timestamp.now(), userId: 'mock' },
];

export const messages: { [key: string]: Message[] } = {
  '1': [
    { id: '1-1', role: 'user', content: "Explain recursion like I'm 12", createdAt: Timestamp.now() },
    {
      id: '1-2',
      role: 'assistant',
      content:
        "Imagine you have a big box of chocolates and you want to find the one with a golden ticket. You open the box, but inside there's another, smaller box. So you open that one, and guess what? Another even smaller box! You keep opening smaller and smaller boxes until you find the golden ticket. Recursion is like that: a big problem contains a smaller version of the same problem. You solve the smallest one, and that helps you solve the bigger ones!",
      createdAt: Timestamp.now(),
    },
  ],
  '2': [{ id: '2-1', role: 'user', content: 'Help me plan a 10-day trip to Japan for spring.', createdAt: Timestamp.now() }],
  '3': [{ id: '3-1', role: 'user', content: 'Write a short, creative story about a brave little sparrow.', createdAt: Timestamp.now() }],
  '4_': [{ id: '4-1', role: 'user', content: 'Why is my React component re-rendering so much?', createdAt: Timestamp.now() }],
};
