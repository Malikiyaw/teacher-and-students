'use client';

import { useState } from 'react';
import { TOOL_STACKS } from '@/lib/data';

type QuizAnswers = { goal?: string; budget?: string; level?: string };

const TOOL_URLS: Record<string, string> = {
  'ChatGPT': 'https://chat.openai.com',
  'ChatGPT Free': 'https://chat.openai.com',
  'Claude': 'https://claude.ai',
  'Claude Free': 'https://claude.ai',
  'Claude Pro': 'https://claude.ai',
  'Claude Code': 'https://claude.ai/code',
  'Claude Code Free': 'https://claude.ai/code',
  'Claude Code Max': 'https://claude.ai/code',
  'Claude Team': 'https://claude.ai',
  'Claude API': 'https://docs.anthropic.com',
  'Cursor': 'https://cursor.com',
  'Cursor Free': 'https://cursor.com',
  'Cursor Pro': 'https://cursor.com',
  'Cursor Business': 'https://cursor.com',
  'GitHub Copilot Free': 'https://github.com/features/copilot',
  'GitHub Copilot': 'https://github.com/features/copilot',
  'GitHub Copilot Pro': 'https://github.com/features/copilot',
  'GitHub Copilot Max': 'https://github.com/features/copilot',
  'GitHub Copilot Business': 'https://github.com/features/copilot',
  'Supabase': 'https://supabase.com',
  'Supabase Free': 'https://supabase.com',
  'Supabase Pro': 'https://supabase.com',
  'Vercel': 'https://vercel.com',
  'Vercel Free': 'https://vercel.com',
  'Vercel Pro': 'https://vercel.com',
  'Perplexity': 'https://perplexity.ai',
  'Perplexity Free': 'https://perplexity.ai',
  'Figma': 'https://figma.com',
  'Figma Free': 'https://figma.com',
  'Figma Pro': 'https://figma.com',
  'Canva': 'https://canva.com',
  'Canva Free': 'https://canva.com',
  'Canva Pro': 'https://canva.com',
  'Midjourney': 'https://midjourney.com',
  'Grammarly': 'https://grammarly.com',
  'Grammarly Free': 'https://grammarly.com',
  'Grammarly Premium': 'https://grammarly.com',
  'Notion': 'https://notion.so',
  'Jasper': 'https://jasper.ai',
  'Surfer SEO': 'https://surferseo.com',
  'Descript': 'https://descript.com',
  'Otter.ai Free': 'https://otter.ai',
  'Full Stack': 'https://vercel.com',
  'Full Stack Free': 'https://vercel.com',
};

export function ToolFinder() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const select = (key: keyof QuizAnswers, value: string) => {
    setSelectedOption(value);
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setTimeout(() => {
      setSelectedOption(null);
      if (step < 3) setStep(step + 1);
      else setStep(4);
    }, 400);
  };

  const back = () => {
    if (step === 2) {
      const { goal, ...rest } = answers;
      setAnswers(rest);
      setStep(1);
    } else if (step === 3) {
      const { budget, ...rest } = answers;
      setAnswers(rest);
      setStep(2);
    }
  };

  const reset = () => {
    setAnswers({});
    setStep(1);
    setSelectedOption(null);
  };

  const stack = step === 4
    ? TOOL_STACKS[answers.goal || 'developer']?.[answers.budget || 'free']?.[answers.level || 'beginner'] || []
    : [];

  const descriptions: Record<string, Record<string, string>> = {
    writer: { free: "Essential tools for content creation on a budget", low: "Professional writing tools", mid: "Premium content creation stack", high: "Enterprise-grade writing toolkit" },
    developer: { free: "Start building with free AI coding tools", low: "Level up with affordable AI", mid: "Professional developer AI stack", high: "Full-power development toolkit" },
    founder: { free: "Launch your startup with free tools", low: "Build your MVP affordably", mid: "Scale with a serious toolkit", high: "No limits founder stack" },
    designer: { free: "Design with free AI-powered tools", low: "Professional design on a budget", mid: "Premium design toolkit", high: "Enterprise creative suite" }
  };

  return (
    <section id="tool-finder" className="py-24 lg:py-36 bg-ink">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">03</p>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-4xl lg:text-5xl text-surface tracking-tight mb-4">Find Your Stack</h2>
          <p className="text-lg text-surface/40 max-w-xl">Three questions. One personalized toolkit recommendation.</p>
        </div>
        <div className="max-w-3xl">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 border border-surface/20 rounded-lg flex items-center justify-center font-[family-name:var(--font-serif)] text-xl text-surface/60">1</span>
                <h3 className="font-[family-name:var(--font-serif)] text-2xl text-surface">What&apos;s your goal?</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'writer', label: 'Writer / Creator', desc: 'Blog posts, scripts, content' },
                  { value: 'developer', label: 'Developer', desc: 'Code, apps, tools' },
                  { value: 'founder', label: 'Solo Founder', desc: 'Startup, MVP, business' },
                  { value: 'designer', label: 'Designer', desc: 'UI/UX, graphics, branding' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => select('goal', opt.value)} className={`quiz-option text-left p-5 rounded-lg border transition-all duration-300 ${selectedOption === opt.value ? 'selected border-accent' : 'border-surface/10 hover:border-accent'}`}>
                    <div className="font-medium text-surface mb-1">{opt.label}</div>
                    <div className="text-sm text-surface/40">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 border border-surface/20 rounded-lg flex items-center justify-center font-[family-name:var(--font-serif)] text-xl text-surface/60">2</span>
                <h3 className="font-[family-name:var(--font-serif)] text-2xl text-surface">What&apos;s your budget?</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'free', label: '$0 / Free', desc: 'Only free tools' },
                  { value: 'low', label: '$1-50/mo', desc: 'A few subscriptions' },
                  { value: 'mid', label: '$50-200/mo', desc: 'Serious toolkit' },
                  { value: 'high', label: '$200+/mo', desc: 'No limits' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => select('budget', opt.value)} className={`quiz-option text-left p-5 rounded-lg border transition-all duration-300 ${selectedOption === opt.value ? 'selected border-accent' : 'border-surface/10 hover:border-accent'}`}>
                    <div className="font-medium text-surface mb-1">{opt.label}</div>
                    <div className="text-sm text-surface/40">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={back} className="mt-6 text-sm text-surface/40 hover:text-surface transition-colors duration-300">&larr; Back</button>
            </div>
          )}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 border border-surface/20 rounded-lg flex items-center justify-center font-[family-name:var(--font-serif)] text-xl text-surface/60">3</span>
                <h3 className="font-[family-name:var(--font-serif)] text-2xl text-surface">Your skill level?</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'Just getting started' },
                  { value: 'intermediate', label: 'Intermediate', desc: 'Use AI daily' },
                  { value: 'advanced', label: 'Advanced', desc: 'Power user' },
                  { value: 'expert', label: 'Expert', desc: 'Build with AI APIs' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => select('level', opt.value)} className={`quiz-option text-left p-5 rounded-lg border transition-all duration-300 ${selectedOption === opt.value ? 'selected border-accent' : 'border-surface/10 hover:border-accent'}`}>
                    <div className="font-medium text-surface mb-1">{opt.label}</div>
                    <div className="text-sm text-surface/40">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={back} className="mt-6 text-sm text-surface/40 hover:text-surface transition-colors duration-300">&larr; Back</button>
            </div>
          )}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <h3 className="font-[family-name:var(--font-serif)] text-2xl text-surface">Your AI Stack</h3>
              </div>
              <p className="text-surface/40 mb-8">{descriptions[answers.goal || 'developer']?.[answers.budget || 'free'] || 'Your personalized AI toolkit'}</p>
              <div className="space-y-3">
                {stack.map((t, i) => {
                  const url = TOOL_URLS[t.name];
                  const Wrapper = url ? 'a' : 'div';
                  const wrapperProps = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};
                  return (
                    <Wrapper key={i} {...wrapperProps} className="tool-card flex items-center gap-4 p-4 rounded-lg border border-surface/10 hover:border-accent transition-all duration-300">
                      <div className="w-10 h-10 bg-surface/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-surface/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-surface text-sm">{t.name}</div>
                        <div className="text-xs text-surface/35 truncate">{t.desc}</div>
                      </div>
                      <span className="text-xs font-medium text-accent flex-shrink-0">{t.price}</span>
                    </Wrapper>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={back} className="flex-1 py-4 rounded-lg border border-surface/10 text-surface/60 font-medium hover:border-accent hover:text-surface transition-all duration-300">&larr; Back</button>
                <button onClick={reset} className="flex-1 py-4 rounded-lg bg-accent text-surface font-medium hover:bg-accent/90 transition-all duration-300">Start Over</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
