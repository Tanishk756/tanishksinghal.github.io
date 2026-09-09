import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`article-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, node, ...props }) => (
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink-900 tracking-tight mt-10 mb-4 pb-2 border-b border-paper-300" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, node, ...props }) => (
            <h2 className="text-xl sm:text-2xl font-display font-bold text-ink-900 tracking-tight mt-10 mb-4" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, node, ...props }) => (
            <h3 className="text-lg sm:text-xl font-display font-semibold text-ink-850 tracking-tight mt-8 mb-3" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, node, ...props }) => (
            <h4 className="text-base sm:text-lg font-display font-semibold text-ink-800 tracking-tight mt-6 mb-2" {...props}>
              {children}
            </h4>
          ),
          p: ({ children, node, ...props }) => (
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-5" {...props}>
              {children}
            </p>
          ),
          strong: ({ children, node, ...props }) => (
            <strong className="font-bold text-ink-950" {...props}>
              {children}
            </strong>
          ),
          b: ({ children, node, ...props }) => (
            <b className="font-bold text-ink-950" {...props}>
              {children}
            </b>
          ),
          em: ({ children, node, ...props }) => (
            <em className="italic text-ink-800" {...props}>
              {children}
            </em>
          ),
          i: ({ children, node, ...props }) => (
            <i className="italic text-ink-800" {...props}>
              {children}
            </i>
          ),
          blockquote: ({ children, node, ...props }) => (
            <blockquote className="border-l-[3px] border-ink-400 bg-paper-200/50 pl-5 pr-4 py-3 my-6 text-ink-800 italic font-serifDisplay text-lg sm:text-xl leading-relaxed rounded-r-lg" {...props}>
              {children}
            </blockquote>
          ),
          ul: ({ children, node, ...props }) => (
            <ul className="list-disc list-outside ml-6 space-y-2 mb-5 text-ink-700 font-sans text-base" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, node, ...props }) => (
            <ol className="list-decimal list-outside ml-6 space-y-2 mb-5 text-ink-700 font-sans text-base" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, node, ...props }) => (
            <li className="leading-relaxed pl-1 text-ink-700" {...props}>
              {children}
            </li>
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-0 border-t border-paper-400 my-10" {...props} />
          ),
          a: ({ children, href, node, ...props }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-ink-900 font-medium underline underline-offset-4 decoration-paper-500 hover:decoration-ink-900 transition-colors"
              {...props}
            >
              {children}
            </a>
          ),
          pre: ({ children, node, ...props }) => (
            <pre className="font-mono text-xs sm:text-sm bg-ink-950 text-paper-100 p-5 rounded-xl overflow-x-auto border border-ink-800 my-6 leading-relaxed shadow-sm" {...props}>
              {children}
            </pre>
          ),
          code: ({ className, children, node, ...props }: any) => {
            const isInsidePre = typeof className === 'string' && className.startsWith('language-');
            if (!isInsidePre && !className) {
              return (
                <code className="font-mono text-[13px] bg-paper-200 text-ink-900 px-1.5 py-0.5 rounded border border-paper-300" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
