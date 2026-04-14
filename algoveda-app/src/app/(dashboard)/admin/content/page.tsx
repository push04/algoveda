'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LearningModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  order_index: number;
  content?: any;
}

interface QuizQuestion {
  id: string;
  module_slug: string;
  question: string;
  options: any;
  correct_answer: number;
  explanation: string;
  difficulty: string;
}

const TOPICS = [
  'Stock Market Basics',
  'Types of Orders',
  'Reading Charts',
  'Technical Indicators',
  'Fundamental Analysis',
  'Risk Management',
  'Candlestick Patterns',
  'Moving Averages',
  'RSI Indicator',
  'MACD Indicator',
];

export default function AdminContentPage() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('Stock Market Basics');
  const [count, setCount] = useState(5);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    setIsAdmin(profile?.is_admin || false);

    if (profile?.is_admin) {
      const [mods, qs] = await Promise.all([
        supabase.from('learning_modules').select('*').order('order_index'),
        supabase.from('quiz_questions').select('*').order('difficulty'),
      ]);
      if (mods.data) setModules(mods.data);
      if (qs.data) setQuestions(qs.data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const generateModule = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'module', topic }),
      });
      const data = await res.json();
      if (data.error) showToast(data.error, false);
      else { showToast('Module generated!'); fetchData(); }
    } catch (e: any) { showToast(e.message, false); }
    setGenerating(false);
  };

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'questions', topic, count }),
      });
      const data = await res.json();
      if (data.error) showToast(data.error, false);
      else { showToast(`${data.questions?.length || 0} questions generated!`); fetchData(); }
    } catch (e: any) { showToast(e.message, false); }
    setGenerating(false);
  };

  const deleteModule = async (id: string) => {
    try {
      await supabase.from('learning_modules').delete().eq('id', id);
      showToast('Module deleted');
      fetchData();
    } catch (e: any) { showToast(e.message, false); }
  };

  const deleteQuestion = async (id: string) => {
    try {
      await supabase.from('quiz_questions').delete().eq('id', id);
      showToast('Question deleted');
      fetchData();
    } catch (e: any) { showToast(e.message, false); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="text-red-600 font-ui">Admin access only</div></div>;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body p-8">
      <div className="max-w-6xl mx-auto">
        {toast && <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl ${toast.ok ? 'bg-green-600' : 'bg-red-600'} text-white font-ui text-sm animate-fadeIn`}>{toast.msg}</div>}

        <div className="mb-8">
          <h1 className="font-headline text-3xl text-primary">Content Generator</h1>
          <p className="text-stone-500">Generate learning modules and quizzes</p>
        </div>

        {/* Generator Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="font-ui text-lg mb-4">Generate Learning Module</h2>
            <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-3 border rounded-lg mb-4">
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={generateModule} disabled={generating} className="w-full py-3 bg-primary text-white rounded-lg font-ui hover:bg-primary/90 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Module with AI'}
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="font-ui text-lg mb-4">Generate Quiz Questions</h2>
            <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-3 border rounded-lg mb-3">
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value) || 5)} className="w-full p-3 border rounded-lg mb-4" placeholder="Number of questions" />
            <button onClick={generateQuestions} disabled={generating} className="w-full py-3 bg-secondary text-white rounded-lg font-ui hover:bg-secondary/90 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Questions with AI'}
            </button>
          </div>
        </div>

        {/* Existing Modules */}
        <div className="bg-white rounded-xl shadow-card mb-8">
          <div className="p-4 border-b"><h2 className="font-ui text-lg">Learning Modules ({modules.length})</h2></div>
          <div className="max-h-64 overflow-y-auto">
            {modules.length === 0 ? <div className="p-8 text-center text-stone-400">No modules yet</div> : (
              <table className="w-full">
                <tbody>
                  {modules.map(m => (
                    <tr key={m.id} className="border-b">
                      <td className="p-4">{m.title}</td>
                      <td className="p-4 text-stone-500 text-sm">{m.description}</td>
                      <td className="p-4 text-right"><button onClick={() => deleteModule(m.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Existing Questions */}
        <div className="bg-white rounded-xl shadow-card">
          <div className="p-4 border-b"><h2 className="font-ui text-lg">Quiz Questions ({questions.length})</h2></div>
          <div className="max-h-64 overflow-y-auto">
            {questions.length === 0 ? <div className="p-8 text-center text-stone-400">No questions yet</div> : (
              <table className="w-full">
                <tbody>
                  {questions.slice(0, 20).map(q => (
                    <tr key={q.id} className="border-b">
                      <td className="p-4 max-w-md truncate">{q.question}</td>
                      <td className="p-4 text-xs uppercase px-2 py-1 bg-stone-100 rounded">{q.difficulty}</td>
                      <td className="p-4 text-right"><button onClick={() => deleteQuestion(q.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}