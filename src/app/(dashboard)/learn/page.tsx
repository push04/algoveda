'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  module_slug: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: string;
}

interface LearningModule {
  slug: string;
  title: string;
  description: string;
  order_index: number;
}

export default function LearnPage() {
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) {
      setLoading(false);
      return;
    }
    setUser(u);

    // Check subscription status
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('status, plans:plan_id(slug)')
      .eq('user_id', u.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    const hasStarterPlan = !!(sub?.plans && (sub.plans as any).slug === 'starter');
    setSubscribed(hasStarterPlan);

    // Get user quiz data
    const { data } = await supabase.from('profiles').select('quiz_score').eq('id', u.id).single();
    if (data) {
      setScore(data.quiz_score || 0);
      // Unlocked if subscribed to Starter plan
      setUnlocked(hasStarterPlan);
    }
    fetchData();
  }

  async function fetchData() {
    const [mods, qs] = await Promise.all([
      supabase.from('learning_modules').select('*').order('order_index'),
      supabase.from('quiz_questions').select('*')
    ]);
    if (mods.data) setModules(mods.data);
    if (qs.data) setQuestions(qs.data);
    setLoading(false);
  }

  function startQuiz(slug: string) {
    if (!subscribed) {
      setShowLockModal(true);
      return;
    }
    setActiveQuiz(slug);
    setCurrentQ(0);
    setAnswers([]);
    setQuizComplete(false);
  }

  function submitAnswer(answerIdx: number) {
    const newAnswers = [...answers, answerIdx];
    setAnswers(newAnswers);

    const moduleQuestions = questions.filter(q => q.module_slug === activeQuiz);
    if (currentQ < moduleQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      calculateScore(newAnswers, moduleQuestions);
    }
  }

  async function calculateScore(allAnswers: number[], moduleQuestions: QuizQuestion[]) {
    let correct = 0;
    allAnswers.forEach((ans, idx) => {
      if (moduleQuestions[idx] && moduleQuestions[idx].correct_answer === ans) {
        correct++;
      }
    });
    
    const finalScore = score + correct;
    setScore(finalScore);
    setQuizComplete(true);

    if (user && finalScore >= 15) {
      setUnlocked(true);
      await supabase.from('users').update({ 
        quiz_score: finalScore, 
        education_unlocked: true 
      }).eq('id', user.id);
    } else if (user) {
      await supabase.from('users').update({ quiz_score: finalScore }).eq('id', user.id);
    }
  }

  const moduleQuestions = activeQuiz ? questions.filter(q => q.module_slug === activeQuiz) : [];
  const currentQuestion = moduleQuestions[currentQ];
  const passed = score >= 15;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-4xl text-primary mb-2">Learn Stock Market</h1>
          <p className="text-stone-600">Master investing from basics to advanced. Score 15/20+ to unlock ₹1 Lakh Paper Trading!</p>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-ui text-lg">Your Progress</h2>
            <div className={`px-4 py-2 rounded-lg font-bold ${unlocked ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {unlocked ? '✓ PAPER TRADING UNLOCKED!' : '🔒 Locked'}
            </div>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-4 mb-2">
            <div className="bg-primary h-4 rounded-full transition-all" style={{ width: `${Math.min((score / 20) * 100, 100)}%` }}></div>
          </div>
          <p className="font-ui text-sm text-stone-500">Score: {score}/20 {score >= 15 ? '✅ PASSED' : `(${15 - score} more needed)`}</p>
        </div>

        {/* Learning Modules */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {modules.map(mod => (
            <div key={mod.slug} className="bg-white rounded-xl p-6 shadow-card hover:shadow-elevated transition-all">
              <h3 className="font-headline text-xl text-primary mb-2">{mod.title}</h3>
              <p className="text-stone-600 text-sm mb-4">{mod.description}</p>
              <button 
                onClick={() => startQuiz(mod.slug)}
                className="w-full py-3 bg-primary text-white rounded-lg font-ui hover:bg-primary/90 transition-all"
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>

        {/* Quiz Modal */}
        {activeQuiz && currentQuestion && !quizComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-2xl">Quiz: {modules.find(m => m.slug === activeQuiz)?.title}</h2>
                <button onClick={() => setActiveQuiz(null)} className="text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-stone-500 mb-2">
                  <span>Question {currentQ + 1}/{moduleQuestions.length}</span>
                  <span className="uppercase text-xs px-2 py-1 bg-stone-100 rounded">{currentQuestion.difficulty}</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / moduleQuestions.length) * 100}%` }}></div>
                </div>
              </div>

              <h3 className="font-ui text-xl mb-6">{currentQuestion.question}</h3>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => submitAnswer(idx)}
                    className="w-full text-left p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all font-ui"
                  >
                    <span className="inline-block w-8 h-8 rounded-full bg-stone-100 text-center mr-3">{String.fromCharCode(65 + idx)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Complete */}
        {quizComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
              <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
              <h2 className="font-headline text-3xl mb-2">{passed ? 'Congratulations!' : 'Keep Learning!'}</h2>
              <p className="text-xl mb-4">Your Score: {score}/20</p>
              <p className="text-stone-600 mb-6">
                {passed 
                  ? 'You have unlocked ₹1 Lakh Paper Trading! Go to Paper Trading to start practicing.' 
                  : `You need ${15 - score} more correct answers to unlock Paper Trading.`}
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => { setActiveQuiz(null); setQuizComplete(false); }}
                  className="px-6 py-3 bg-stone-200 rounded-lg font-ui hover:bg-stone-300"
                >
                  Back to Modules
                </button>
                {passed && (
                  <Link href="/paper-trade" className="px-6 py-3 bg-green-600 text-white rounded-lg font-ui hover:bg-green-700">
                    Go to Paper Trading →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lock Modal for non-subscribed users */}
        {showLockModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-amber-600 text-3xl">lock</span>
              </div>
              <h2 className="font-headline text-2xl mb-2">Learning Content Locked</h2>
              <p className="text-stone-600 mb-4">
                Subscribe to the Rs 2 Starter plan to unlock all learning modules and quizzes.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-amber-700">Rs 2</div>
                <div className="text-sm text-amber-600">one-time payment</div>
                <ul className="text-left text-sm mt-3 space-y-1">
                  <li>Complete Stock Market A-Z Course</li>
                  <li>AI-Powered Quiz Generator</li>
                  <li>Unlock Rs 1 Lakh Paper Trading</li>
                </ul>
              </div>
              <Link href="/pricing" className="block w-full py-3 bg-primary text-white rounded-lg font-ui hover:bg-primary/90 mb-3">
                Subscribe Now - Rs 2
              </Link>
              <button onClick={() => setShowLockModal(false)} className="text-stone-500 text-sm">
                Maybe later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}