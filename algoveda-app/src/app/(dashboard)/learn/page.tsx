'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import LiveMarketChart from '@/components/learn/LiveMarketChart';

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
  const [subscribed, setSubscribed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

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

    // Check subscription status — starter plan only
    const { data: subs } = await supabase
      .from('user_subscriptions')
      .select('status, plan_id')
      .eq('user_id', u.id)
      .in('status', ['active', 'trialing']);

    let hasPaid = false;
    if (subs && subs.length > 0) {
      // Fetch plan details for matched subs
      const planIds = subs.map((s: any) => s.plan_id);
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('id, slug')
        .in('id', planIds);

      hasPaid = !!(plans && plans.some((p: any) => p.slug === 'starter' || p.slug === 'researcher' || p.slug === 'pro' || p.slug === 'institution'));
    }

    setSubscribed(hasPaid);

    // Get user quiz score from profiles
    const { data: profile } = await supabase.from('profiles').select('quiz_score').eq('id', u.id).single();
    if (profile) {
      setScore(profile.quiz_score || 0);
    }

    await fetchData();
    setLoading(false);
  }

  async function fetchData() {
    const [mods, qs] = await Promise.all([
      supabase.from('learning_modules').select('*').order('order_index'),
      supabase.from('quiz_questions').select('*').order('order_index'),
    ]);
    if (mods.data) setModules(mods.data);
    if (qs.data) setQuestions(qs.data);
  }

  function startQuiz(slug: string) {
    setActiveQuiz(slug);
    setCurrentQ(0);
    setAnswers([]);
    setQuizComplete(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }

  function handleAnswer(answerIdx: number) {
    setSelectedAnswer(answerIdx);
    setShowExplanation(true);
  }

  function nextQuestion() {
    const newAnswers = [...answers, selectedAnswer!];
    setAnswers(newAnswers);

    const moduleQuestions = questions.filter(q => q.module_slug === activeQuiz);
    if (currentQ < moduleQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      calculateScore(newAnswers, moduleQuestions);
    }
  }

  async function calculateScore(allAnswers: number[], moduleQuestions: QuizQuestion[]) {
    let correct = 0;
    allAnswers.forEach((ans, idx) => {
      if (moduleQuestions[idx] && moduleQuestions[idx].correct_answer === ans) correct++;
    });

    const finalScore = Math.min(score + correct, 20);
    setScore(finalScore);
    setQuizComplete(true);

    if (user) {
      await supabase.from('profiles').update({
        quiz_score: finalScore,
        education_unlocked: finalScore >= 15,
      }).eq('id', user.id);
    }
  }

  const moduleQuestions = activeQuiz ? questions.filter(q => q.module_slug === activeQuiz) : [];
  const currentQuestion = moduleQuestions[currentQ];
  const passed = score >= 15;
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? Math.min((score / 20) * 100, 100) : 0;

  if (loading) {
    return (
      <main className="pt-8 px-8 pb-12 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6 mt-8">
          <div className="h-8 bg-stone-200 rounded w-64" />
          <div className="h-4 bg-stone-100 rounded w-96" />
          <div className="grid grid-cols-3 gap-6 mt-8">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-stone-100 rounded-2xl" />)}
          </div>
        </div>
      </main>
    );
  }

  // Locked state — not subscribed
  if (!subscribed) {
    return (
      <main className="pt-8 px-8 pb-12 max-w-6xl mx-auto">
        {/* Header visible to all */}
        <div className="mb-8 relative z-10">
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Education Center</span>
          <h1 className="font-headline text-4xl text-[#00361a] mt-1">Learn Stock Market</h1>
          <p className="text-stone-500 text-sm mt-1">Master investing from basics to advanced</p>
        </div>

        {/* Locked Content Overlay */}
        <div className="relative min-h-[680px]">
          {/* Blurred preview of modules */}
          <div className="filter blur-sm pointer-events-none select-none opacity-50">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {['Stock Market Basics', 'Technical Analysis', 'Fundamental Analysis', 'Risk Management'].map((title, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 mb-3" />
                  <h3 className="font-headline text-lg text-[#00361a] mb-2">{title}</h3>
                  <p className="text-stone-500 text-xs mb-4">5 quiz questions · 10 min</p>
                  <div className="w-full py-2 bg-[#1A4D2E] rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Lock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl border border-amber-200">
              {/* Animated lock */}
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
                  <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#1A4D2E] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                </div>
              </div>

              <h2 className="font-headline text-3xl text-[#00361a] mb-3">
                Your Knowledge Vault Awaits
              </h2>
              <p className="text-stone-500 font-body text-sm mb-2">
                This is premium educational content locked behind our
              </p>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 mb-6">
                <span className="text-2xl font-data font-black text-amber-700">₹2</span>
                <span className="text-amber-600 font-ui font-bold text-sm">Starter Plan</span>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 mb-6 text-left">
                <p className="text-xs font-ui font-bold uppercase tracking-wider text-stone-500 mb-3">What you unlock:</p>
                <ul className="space-y-2.5">
                  {[
                    { icon: 'menu_book', text: 'Complete A-Z Stock Market Course (4 modules)' },
                    { icon: 'psychology', text: '20-Question AI-Powered Assessment Quiz' },
                    { icon: 'currency_rupee', text: '₹1,00,000 Paper Trading Account' },
                    { icon: 'workspace_premium', text: 'Certificate of Completion' },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px] text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      <span className="text-sm font-body text-stone-700">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/pricing"
                className="block w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-ui font-bold text-base hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 mb-3"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                  Unlock Now · Only ₹2
                </span>
              </Link>
              <p className="text-xs text-stone-400 font-body">Secured by Razorpay · One-time payment · Instant access</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-8 px-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Education Center</span>
          <h1 className="font-headline text-4xl text-[#00361a] mt-1">Learn Stock Market</h1>
          <p className="text-stone-500 text-sm mt-1">Master investing from basics to advanced. Score 15/20+ to unlock ₹1 Lakh Paper Trading!</p>
        </div>
        <Link 
          href="/learn/handbook"
          className="flex items-center gap-2 px-6 py-3 bg-[#00361a] text-white rounded-xl font-ui font-bold hover:bg-[#1A4D2E] shadow-lg shadow-emerald-900/20 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          Read Complete Handbook
        </Link>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl p-6 shadow-card mb-8 border border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-ui font-bold text-stone-700">Your Progress</h2>
          <div className={`px-4 py-2 rounded-xl font-bold text-sm ${passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {passed ? '✅ Paper Trading Unlocked!' : `🔒 ${15 - score} more to unlock`}
          </div>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-3 mb-2 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${passed ? 'bg-emerald-500' : 'bg-[#1A4D2E]'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500 font-data">
          <span>Score: <strong className="text-stone-700">{score}/20</strong></span>
          <span>{passed ? '🎉 Goal reached!' : `Goal: 15/20`}</span>
        </div>
      </div>

      <LiveMarketChart />

      {/* Learning Modules */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {modules.map((mod, i) => {
          const modQs = questions.filter(q => q.module_slug === mod.slug);
          const icons = ['menu_book', 'bar_chart', 'analytics', 'shield'];
          const colors = ['emerald', 'blue', 'amber', 'purple'];
          const colorMap: Record<string, string> = {
            emerald: 'bg-emerald-100 text-emerald-600',
            blue: 'bg-blue-100 text-blue-600',
            amber: 'bg-amber-100 text-amber-600',
            purple: 'bg-purple-100 text-purple-600',
          };
          const c = colorMap[colors[i % colors.length]] ?? 'bg-stone-100 text-stone-600';
          return (
            <div key={mod.slug} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all border border-stone-100 card-hover-lift">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icons[i % icons.length]}</span>
              </div>
              <h3 className="font-headline text-lg text-[#00361a] mb-1">{mod.title}</h3>
              <p className="text-stone-500 text-xs mb-1">{mod.description}</p>
              <p className="text-stone-400 text-[10px] font-data mb-4">{modQs.length} questions · ~10 min</p>
              <button
                onClick={() => startQuiz(mod.slug)}
                className="w-full py-2.5 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold text-sm hover:bg-[#143D24] transition-all btn-press"
              >
                Take Quiz
              </button>
            </div>
          );
        })}
      </div>

      {/* If passed — Paper Trading CTA */}
      {passed && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl flex items-center justify-between mb-8">
          <div>
            <h3 className="font-headline text-2xl mb-1">🎉 You passed! ₹1,00,000 is ready</h3>
            <p className="text-emerald-100 text-sm">Your paper trading portfolio with ₹1 lakh virtual capital is activated</p>
          </div>
          <Link href="/paper-trade" className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-ui font-bold hover:bg-emerald-50 transition-all whitespace-nowrap ml-6">
            Start Trading →
          </Link>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuiz && currentQuestion && !quizComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-2xl text-[#00361a]">{modules.find(m => m.slug === activeQuiz)?.title}</h2>
              <button onClick={() => setActiveQuiz(null)} className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-stone-500 mb-2">
                <span>Question {currentQ + 1} of {moduleQuestions.length}</span>
                <span className={`uppercase px-2 py-0.5 rounded font-bold ${currentQuestion.difficulty === 'hard' ? 'bg-red-100 text-red-700' : currentQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2">
                <div
                  className="bg-[#1A4D2E] h-2 rounded-full transition-all"
                  style={{ width: `${((currentQ + 1) / moduleQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <h3 className="font-ui text-lg font-bold text-stone-800 mb-6">{currentQuestion.question}</h3>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                let btnClass = 'border-stone-200 hover:border-[#1A4D2E] hover:bg-[#1A4D2E]/5';
                if (showExplanation) {
                  if (idx === currentQuestion.correct_answer) btnClass = 'border-emerald-500 bg-emerald-50';
                  else if (idx === selectedAnswer && idx !== currentQuestion.correct_answer) btnClass = 'border-red-400 bg-red-50';
                  else btnClass = 'border-stone-100 opacity-60';
                } else if (selectedAnswer === idx) {
                  btnClass = 'border-[#1A4D2E] bg-[#1A4D2E]/5';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !showExplanation && handleAnswer(idx)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-body text-sm ${btnClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${showExplanation && idx === currentQuestion.correct_answer ? 'bg-emerald-500 text-white' : showExplanation && idx === selectedAnswer ? 'bg-red-400 text-white' : 'bg-stone-100 text-stone-600'}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className={`mt-4 p-4 rounded-xl text-sm ${selectedAnswer === currentQuestion.correct_answer ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                <p className="font-bold mb-1">{selectedAnswer === currentQuestion.correct_answer ? '✅ Correct!' : '❌ Incorrect'}</p>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}

            {showExplanation && (
              <button
                onClick={nextQuestion}
                className="mt-6 w-full py-3 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24] transition-all"
              >
                {currentQ < moduleQuestions.length - 1 ? 'Next Question →' : 'See Results'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Complete Modal */}
      {quizComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
            <h2 className="font-headline text-3xl text-[#00361a] mb-2">{passed ? 'Congratulations!' : 'Keep Learning!'}</h2>
            <p className="text-xl font-data font-bold mb-1">Total Score: {score}/20</p>
            <p className="text-stone-500 text-sm mb-6">
              {passed
                ? 'You have unlocked ₹1 Lakh Paper Trading! Start practicing now.'
                : `You need ${15 - score} more correct answers to unlock Paper Trading.`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setActiveQuiz(null); setQuizComplete(false); }}
                className="px-6 py-3 bg-stone-100 rounded-xl font-ui font-bold hover:bg-stone-200 transition-all text-stone-700"
              >
                Back to Modules
              </button>
              {passed && (
                <Link
                  href="/paper-trade"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-ui font-bold hover:bg-emerald-700 transition-all"
                >
                  Start Paper Trading →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
