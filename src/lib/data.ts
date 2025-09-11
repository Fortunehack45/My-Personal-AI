export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'thinking';
};

export const conversations: Conversation[] = [
  { id: '1', title: 'Explaining Recursion', createdAt: '2 hours ago' },
  { id: '2', title: 'Plan a trip to Japan', createdAt: '1 day ago' },
  { id: '3', title: 'Creative story about a sparrow', createdAt: '3 days ago' },
  { id: '4', title: 'Fix my React component', createdAt: '1 week ago' },
];

export const messages: { [key: string]: Message[] } = {
  '1': [
    { id: '1-1', role: 'user', content: "Explain recursion like I'm 12" },
    {
      id: '1-2',
      role: 'assistant',
      content:
        "Imagine you have a big box of chocolates and you want to find the one with a golden ticket. You open the box, but inside there's another, smaller box. So you open that one, and guess what? Another even smaller box! You keep opening smaller and smaller boxes until you find the golden ticket. Recursion is like that: a big problem contains a smaller version of the same problem. You solve the smallest one, and that helps you solve the bigger ones!",
    },
  ],
  '2': [{ id: '2-1', role: 'user', content: 'Help me plan a 10-day trip to Japan for spring.' }],
  '3': [{ id: '3-1', role: 'user', content: 'Write a short, creative story about a brave little sparrow.' }],
  '4': [{ id: '4-1', role: 'user', content: 'Why is my React component re-rendering so much?' }],
};
