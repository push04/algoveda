import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const body = await request.json();
    const { type, topic, count } = body;

    if (!GROQ_API_KEY) return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });

    if (type === 'module') {
      // Generate a learning module with Groq AI
      const prompt = `Create a comprehensive learning module about "${topic}" for stock market education. 
Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{"title":"Module Title","description":"Brief description","content":[{"heading":"Section heading","body":"Educational content about this section"}]}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Groq error' }, { status: 500 });

      const content = data.choices?.[0]?.message?.content;
      if (!content) return NextResponse.json({ error: 'Empty response' }, { status: 500 });

      const parsed = JSON.parse(content);
      
      // Insert module into DB
      const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { data: module, error } = await supabase.from('learning_modules').insert({
        slug,
        title: parsed.title || topic,
        description: parsed.description || '',
        content: JSON.stringify(parsed.content || []),
        order_index: Date.now(),
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ module });
    }

    if (type === 'questions') {
      // Generate quiz questions
      const prompt = `Generate ${count || 5} multiple choice questions about "${topic}" for stock market education.
For each question provide: question text, 4 options (A-D), correct answer index (0-3), brief explanation, difficulty (easy/medium/hard).
Respond ONLY with valid JSON array (no markdown):
[{"question":"...","options":["A","B","C","D"],"correct_answer":0,"explanation":"...","difficulty":"medium"}]`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      const data = await res.json();
      if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Groq error' }, { status: 500 });

      const content = data.choices?.[0]?.message?.content;
      if (!content) return NextResponse.json({ error: 'Empty response' }, { status: 500 });

      const questions = JSON.parse(content);
      
      // Insert questions into DB
      const inserted = [];
      for (const q of questions) {
        const { data: question, error } = await supabase.from('quiz_questions').insert({
          module_slug: topic.toLowerCase().replace(/\s+/g, '-'),
          question: q.question,
          options: JSON.stringify(q.options),
          correct_answer: q.correct_answer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
        }).select().single();
        if (!error && question) inserted.push(question);
      }

      return NextResponse.json({ questions: inserted });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}