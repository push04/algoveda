import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export const metadata = {
  title: 'AlgoVeda Handbook',
  description: 'The complete stock market guide.',
};

export default function HandbookPage() {
  const filePath = path.join(process.cwd(), 'src/data/contents.md');
  
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error(e);
    content = '# Error loading handbook\\n\\nPlease try again later.';
  }

  return (
    <main className="pt-24 px-8 pb-32 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/learn"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-[#1A4D2E] transition-colors font-body text-sm mb-6"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Education Center
        </Link>
        <span className="block text-[10px] font-data uppercase tracking-[0.3em] text-[#795900] mb-1">
          Complete Guide
        </span>
        <h1 className="font-headline text-4xl text-[#00361a] border-b border-stone-200 pb-6">
          AlgoVeda Handbook
        </h1>
      </div>
      
      <article className="prose prose-stone prose-emerald max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="font-headline text-4xl text-[#00361a] mt-12 mb-6" {...props} />,
            h2: ({node, ...props}) => <h2 className="font-headline text-3xl text-[#1A4D2E] mt-10 mb-4 pb-2 border-b border-stone-100" {...props} />,
            h3: ({node, ...props}) => <h3 className="font-headline text-xl text-stone-800 mt-8 mb-3" {...props} />,
            p: ({node, ...props}) => <p className="font-body text-stone-600 leading-relaxed mb-4 text-[15px]" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-2 mb-6 text-stone-600 text-[15px] font-body" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-2 mb-6 text-stone-600 text-[15px] font-body" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-amber-400 bg-amber-50 rounded-r-lg px-6 py-4 my-6 text-amber-900 font-body italic shadow-sm" {...props} />
            ),
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-8">
                <table className="min-w-full divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden shadow-sm text-sm" {...props} />
              </div>
            ),
            thead: ({node, ...props}) => <thead className="bg-stone-50" {...props} />,
            th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-ui font-bold text-stone-500 uppercase tracking-wider" {...props} />,
            td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 border-t border-stone-100" {...props} />,
            hr: ({node, ...props}) => <hr className="border-stone-200 my-12" {...props} />,
            code: ({node, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              return !match ? (
                <code className="bg-stone-100 text-[#1A4D2E] px-1.5 py-0.5 rounded font-data text-xs" {...props}>
                  {children}
                </code>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
      
      <div className="mt-16 pt-8 border-t border-stone-200 flex justify-center">
        <Link 
          href="/learn"
          className="px-8 py-4 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24] shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
        >
          Back to Quizzes
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
