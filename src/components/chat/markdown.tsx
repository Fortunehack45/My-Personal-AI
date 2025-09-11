'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        pre: ({ node, ...props }) => <div className="relative group">{props.children}</div>,
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeText = String(children).replace(/\n$/, '');
          
          return match ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(codeText)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {codeText}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-muted/50 text-foreground font-mono rounded px-1.5 py-1 text-sm" {...props}>
              {children}
            </code>
          );
        },
        table: ({node, ...props}) => <div className="overflow-x-auto"><table className="w-full" {...props} /></div>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
