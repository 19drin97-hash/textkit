import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROMPTS = {
  email: (text: string) => `Verbessere diese E-Mail und mache sie professioneller, klarer und höflicher. Behalte die Kernaussage bei. Antworte nur mit der verbesserten E-Mail:\n\n${text}`,
  text: (text: string) => `Optimiere diesen Text: mache ihn klarer, flüssiger und überzeugender. Korrigiere Grammatik und Stil. Antworte nur mit dem verbesserten Text:\n\n${text}`,
  summary: (text: string) => `Fasse diesen Text in 3-5 prägnanten Sätzen zusammen. Erfasse die wichtigsten Punkte:\n\n${text}`,
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const { tool, text } = await req.json();

    if (!tool || !text || !PROMPTS[tool as keyof typeof PROMPTS]) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
    }

    // Check user plan and usage
    const { data: user } = await supabase
      .from('users')
      .select('plan, daily_requests, last_request_date')
      .eq('clerk_id', userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = user?.last_request_date !== today;
    const dailyRequests = isNewDay ? 0 : (user?.daily_requests || 0);

    // Free plan: 5 requests per day
    if (user?.plan !== 'pro' && dailyRequests >= 5) {
      return NextResponse.json(
        { error: 'Tageslimit erreicht. Upgrade auf Pro für unbegrenzte Anfragen.' },
        { status: 429 }
      );
    }

    // Generate AI response
    const promptFn = PROMPTS[tool as keyof typeof PROMPTS];
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: promptFn(text) }],
    });

    const result = message.content[0].type === 'text' ? message.content[0].text : '';

    // Update usage in Supabase
    await supabase
      .from('users')
      .upsert({
        clerk_id: userId,
        plan: user?.plan || 'free',
        daily_requests: isNewDay ? 1 : dailyRequests + 1,
        last_request_date: today,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
  }
