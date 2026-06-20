export interface Workflow {
  id: number;
  title: string;
  category: string;
  model: string;
  timeSaved: string;
  rating: number;
  reviews: number;
  featured: boolean;
  description: string;
  tags: string[];
}

export interface Showcase {
  id: number;
  title: string;
  tool: string;
  builtIn: string;
  revenue: string;
  description: string;
  tags: string[];
  likes: number;
  featured?: boolean;
}

export interface HubPost {
  id: number;
  type: string;
  title: string;
  content: string;
  author: string;
  likes: number;
  date: string;
  featured?: boolean;
}

export interface Failure {
  id: number;
  category: string;
  title: string;
  description: string;
  ai: string;
  upvotes: number;
  date: string;
}

export interface Tool {
  name: string;
  desc: string;
  price: string;
}

export const WORKFLOWS: Workflow[] = [
  { id: 1, title: "Build a SaaS Landing Page in 15 Minutes", category: "coding", model: "Claude 3.5 Sonnet", timeSaved: "2 hours", rating: 4.8, reviews: 342, featured: true, description: "Complete workflow: from wireframe to production-ready landing page with Tailwind CSS.", tags: ["landing page", "tailwind", "saas"] },
  { id: 2, title: "YouTube Video Script Generator", category: "content", model: "ChatGPT-4o", timeSaved: "3 hours", rating: 4.6, reviews: 218, featured: false, description: "Generate engaging video scripts with hooks, chapters, CTAs, and SEO descriptions.", tags: ["youtube", "script", "content"] },
  { id: 3, title: "Flutter App with Claude Code", category: "coding", model: "Claude Code", timeSaved: "8 hours", rating: 4.9, reviews: 156, featured: true, description: "End-to-end Flutter app: project setup, state management, UI, and API integration.", tags: ["flutter", "mobile", "claude"] },
  { id: 4, title: "Competitor Research Automation", category: "business", model: "Perplexity + Claude", timeSaved: "5 hours", rating: 4.7, reviews: 289, featured: false, description: "Automated competitor analysis: features, pricing, reviews, positioning.", tags: ["research", "business", "automation"] },
  { id: 5, title: "Cursor Rules for React Projects", category: "coding", model: "Cursor", timeSaved: "4 hours", rating: 4.5, reviews: 412, featured: false, description: "Pre-configured Cursor rules for React/Next.js projects.", tags: ["cursor", "react", "rules"] },
  { id: 6, title: "Brand Identity Generator", category: "design", model: "Midjourney + Claude", timeSaved: "6 hours", rating: 4.4, reviews: 178, featured: false, description: "Complete brand identity: logo, colors, typography, style guide.", tags: ["branding", "design", "identity"] },
  { id: 7, title: "SEO Blog Post Pipeline", category: "content", model: "Claude 3.5 Sonnet", timeSaved: "4 hours", rating: 4.7, reviews: 523, featured: true, description: "Keyword research to published post: outline, draft, links, meta, schema.", tags: ["seo", "blog", "content"] },
  { id: 8, title: "Supabase Auth + CRUD Setup", category: "coding", model: "Claude Code", timeSaved: "3 hours", rating: 4.6, reviews: 267, featured: false, description: "Complete auth flow with Supabase: signup, login, reset, CRUD.", tags: ["supabase", "auth", "backend"] },
  { id: 9, title: "Product Photography Editor", category: "design", model: "ChatGPT-4o", timeSaved: "2 hours", rating: 4.3, reviews: 145, featured: false, description: "AI product photo enhancement: background, lighting, styling.", tags: ["photography", "product", "editing"] },
];

export const SHOWCASES: Showcase[] = [
  { id: 1, title: "TaskFlow", tool: "claude", builtIn: "3 days", revenue: "$2,400/mo", description: "Minimal task management app with AI-powered priority sorting. Built with Claude Code from scratch. React, TypeScript, Supabase backend.", tags: ["claude", "productivity", "saas"], likes: 342, featured: true },
  { id: 2, title: "PixelPerfect", tool: "cursor", builtIn: "1 week", revenue: "$800/mo", description: "Browser-based design tool with AI layout suggestions. React + TypeScript.", tags: ["cursor", "design", "tool"], likes: 218 },
  { id: 3, title: "DataViz Dashboard", tool: "chatgpt", builtIn: "2 days", revenue: "Free", description: "Real-time analytics dashboard with interactive charts. ChatGPT for data visualization logic.", tags: ["chatgpt", "dashboard", "analytics"], likes: 156 },
  { id: 4, title: "NomadJobs", tool: "claude", builtIn: "5 days", revenue: "$1,200/mo", description: "Remote job board with AI-matched recommendations. Full-stack Next.js application.", tags: ["claude", "job-board", "nextjs"], likes: 289 },
  { id: 5, title: "CodeReview Bot", tool: "cursor", builtIn: "1 day", revenue: "Free", description: "GitHub bot providing AI code reviews on pull requests.", tags: ["cursor", "github", "automation"], likes: 412 },
  { id: 6, title: "MindMap AI", tool: "chatgpt", builtIn: "4 hours", revenue: "$300/mo", description: "Visual mind mapping tool with AI idea expansion. Drag-and-drop interface.", tags: ["chatgpt", "productivity", "visualization"], likes: 178 },
];

export const HUB_POSTS: HubPost[] = [
  { id: 1, type: "Cursor Rule", title: "My Cursor Rules for Next.js 15", content: "Always use App Router. Prefer Server Components. Use Server Actions for mutations. Never use getServerSideProps.", author: "vibe_coder_42", likes: 89, date: "2 days ago", featured: true },
  { id: 2, type: "Prompt", title: "The Perfect Code Review Prompt", content: "Review this code for: 1) Security vulnerabilities, 2) Performance issues, 3) Accessibility, 4) Error handling. Be specific with line references.", author: "dev_sarah", likes: 156, date: "1 day ago" },
  { id: 3, type: "Claude Setup", title: "Claude Code Project Structure", content: "Use CLAUDE.md with: project overview, tech stack, coding conventions, file structure, and common commands. Keeps context consistent across sessions.", author: "ai_builder", likes: 234, date: "3 days ago" },
  { id: 4, type: "MCP Server", title: "Playwright MCP for Testing", content: "Added Playwright MCP server to Cursor. Now I can write and run E2E tests directly from chat. Config in .cursor/mcp.json.", author: "test_ninja", likes: 67, date: "5 hours ago" },
  { id: 5, type: "Workflow", title: "My Daily AI Coding Workflow", content: "Morning: Claude for planning. Midday: Cursor for coding. Evening: Claude for code review. Each tool plays to its strength.", author: "productive_dev", likes: 178, date: "1 day ago" },
  { id: 6, type: "Cursor Rule", title: "TypeScript Strict Mode Rules", content: "Enforce: no any, prefer type over interface, use branded types for IDs, never use enum (use const objects).", author: "ts_purist", likes: 112, date: "4 days ago" },
];

export const FAILURES: Failure[] = [
  { id: 1, category: "coding", title: "Infinite Recursion Bug", description: "Asked Claude to fix a recursion bug. It added a recursion call inside the fix. Stack overflow in 3... 2... 1...", ai: "Claude 3.5", upvotes: 234, date: "2 days ago" },
  { id: 2, category: "hallucination", title: "Non-existent Package", description: "ChatGPT confidently recommended 'npm install react-super-state-manager'. Package doesn't exist. 20 minutes wasted.", ai: "GPT-4", upvotes: 567, date: "1 day ago" },
  { id: 3, category: "design", title: "The 47-Button Landing Page", description: "Asked AI to design a landing page. It added 47 CTAs. Every section had a button. Conversion rate: 0%.", ai: "Unknown", upvotes: 189, date: "3 days ago" },
  { id: 4, category: "coding", title: "The Self-Deleting Script", description: "AI wrote a cleanup script that deleted its own source code. 'Cleaned up too well.' Now it's gone forever.", ai: "Claude", upvotes: 445, date: "5 days ago" },
  { id: 5, category: "hallucination", title: "Historical Fiction API", description: "Asked for historical dates. AI gave me dates from alternate timelines. Abraham Lincoln apparently invented Twitter.", ai: "GPT-4", upvotes: 892, date: "1 week ago" },
  { id: 6, category: "design", title: "Invisible Login Button", description: "AI optimized contrast so much the login button became invisible. 'Perfectly accessible' - to nobody.", ai: "Unknown", upvotes: 321, date: "4 days ago" },
];

export const TOOL_STACKS: Record<string, Record<string, Record<string, Tool[]>>> = {
  writer: {
    free: {
      beginner: [{ name: "ChatGPT", desc: "Free tier for writing", price: "$0" }, { name: "Grammarly", desc: "Writing assistant", price: "$0" }, { name: "Notion AI", desc: "Note-taking + AI", price: "$0" }],
      intermediate: [{ name: "Claude", desc: "Best for long-form", price: "$0" }, { name: "Perplexity", desc: "Research + writing", price: "$0" }, { name: "Otter.ai", desc: "Transcription", price: "$0" }],
      advanced: [{ name: "Claude Pro", desc: "Deep analysis", price: "$20/mo" }, { name: "Jasper", desc: "Marketing copy", price: "$0" }, { name: "Surfer SEO", desc: "Content optimization", price: "$0" }],
      expert: [{ name: "Claude API", desc: "Custom pipelines", price: "Pay per use" }, { name: "LangChain", desc: "Chain prompts", price: "$0" }, { name: "Zapier AI", desc: "Automation", price: "$0" }]
    },
    low: {
      beginner: [{ name: "Claude Pro", desc: "Best all-around", price: "$20/mo" }, { name: "Canva Pro", desc: "Visual content", price: "$13/mo" }, { name: "Notion", desc: "Organization", price: "$0" }],
      intermediate: [{ name: "Claude Pro", desc: "Writing + analysis", price: "$20/mo" }, { name: "Grammarly Premium", desc: "Advanced editing", price: "$12/mo" }, { name: "Descript", desc: "Video/podcast", price: "$24/mo" }],
      advanced: [{ name: "Claude Team", desc: "Collaboration", price: "$30/mo" }, { name: "Jasper", desc: "Marketing", price: "$49/mo" }, { name: "Surfer SEO", desc: "SEO optimization", price: "$89/mo" }],
      expert: [{ name: "Claude API", desc: "Custom workflows", price: "Pay per use" }, { name: "OpenAI API", desc: "GPT-4 access", price: "Pay per use" }, { name: "Make.com", desc: "Automation", price: "$9/mo" }]
    },
    mid: {
      beginner: [{ name: "Claude Team", desc: "Premium writing", price: "$30/mo" }, { name: "Jasper", desc: "Content creation", price: "$49/mo" }, { name: "Canva Pro", desc: "Design", price: "$13/mo" }],
      intermediate: [{ name: "Claude Team", desc: "Long-form content", price: "$30/mo" }, { name: "Jasper", desc: "Marketing copy", price: "$49/mo" }, { name: "Surfer SEO", desc: "SEO", price: "$89/mo" }],
      advanced: [{ name: "Claude Team", desc: "Deep research", price: "$30/mo" }, { name: "Jasper + Surfer", desc: "Full content stack", price: "$138/mo" }, { name: "Descript", desc: "Multimedia", price: "$24/mo" }],
      expert: [{ name: "Custom API Stack", desc: "Claude + GPT + Gemini", price: "Pay per use" }, { name: "LangChain", desc: "Orchestration", price: "$0" }, { name: "Pinecone", desc: "RAG pipeline", price: "$70/mo" }]
    },
    high: {
      beginner: [{ name: "Claude Team", desc: "Best quality", price: "$30/mo" }, { name: "Jasper Business", desc: "Enterprise content", price: "$125/mo" }, { name: "Full Adobe Suite", desc: "Creative tools", price: "$55/mo" }],
      intermediate: [{ name: "Claude Team", desc: "Core writing", price: "$30/mo" }, { name: "Jasper", desc: "Marketing", price: "$125/mo" }, { name: "Semrush", desc: "SEO + research", price: "$130/mo" }],
      advanced: [{ name: "Multi-model Stack", desc: "Claude + GPT + Gemini", price: "$200/mo" }, { name: "Custom Tools", desc: "Build your own", price: "$100/mo+" }, { name: "Enterprise SEO", desc: "Surfer + Semrush", price: "$200/mo" }],
      expert: [{ name: "Full API Stack", desc: "All providers", price: "$300/mo+" }, { name: "Custom RAG", desc: "Private knowledge", price: "$200/mo+" }, { name: "Automation Suite", desc: "Make + Zapier + n8n", price: "$100/mo" }]
    }
  },
  developer: {
    free: {
      beginner: [{ name: "GitHub Copilot Free", desc: "Code completion", price: "$0" }, { name: "Cursor Free", desc: "AI code editor", price: "$0" }, { name: "Claude Free", desc: "Code assistance", price: "$0" }],
      intermediate: [{ name: "Claude Code", desc: "CLI coding", price: "$0" }, { name: "Cursor Free", desc: "AI editor", price: "$0" }, { name: "Vercel", desc: "Deployment", price: "$0" }],
      advanced: [{ name: "Claude Code", desc: "Full-stack dev", price: "$0" }, { name: "Cursor", desc: "AI pair programming", price: "$0" }, { name: "Supabase", desc: "Backend", price: "$0" }],
      expert: [{ name: "Claude API", desc: "Custom tools", price: "Pay per use" }, { name: "GitHub Copilot", desc: "Code suggestions", price: "$0" }, { name: "Vercel + Supabase", desc: "Full stack", price: "$0" }]
    },
    low: {
      beginner: [{ name: "Claude Pro", desc: "Code help", price: "$20/mo" }, { name: "Cursor", desc: "AI editor", price: "$20/mo" }, { name: "Vercel Pro", desc: "Hosting", price: "$20/mo" }],
      intermediate: [{ name: "Claude Code", desc: "CLI coding", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Supabase Pro", desc: "Backend", price: "$25/mo" }],
      advanced: [{ name: "Claude Code", desc: "Development", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Complete setup", price: "$45/mo" }],
      expert: [{ name: "API Stack", desc: "Claude + OpenAI", price: "$50/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Cloud", desc: "AWS/GCP free tier", price: "$0" }]
    },
    mid: {
      beginner: [{ name: "Claude Team", desc: "Code + docs", price: "$30/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "GitHub Copilot", desc: "Code completion", price: "$19/mo" }],
      intermediate: [{ name: "Claude Code", desc: "Full-stack", price: "$100/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Vercel + Supabase", desc: "Hosting + DB", price: "$45/mo" }],
      advanced: [{ name: "Claude Code Max", desc: "Heavy usage", price: "$100/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Complete setup", price: "$65/mo" }],
      expert: [{ name: "Multi-API", desc: "Claude + GPT + Gemini", price: "$150/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Cloud + DB", desc: "Production setup", price: "$100/mo" }]
    },
    high: {
      beginner: [{ name: "Claude Code Max", desc: "Best coding AI", price: "$100/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "GitHub Copilot Business", desc: "Team features", price: "$39/mo" }],
      intermediate: [{ name: "Claude Code Max", desc: "Core development", price: "$100/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Production setup", price: "$200/mo" }],
      advanced: [{ name: "Full API Suite", desc: "All AI providers", price: "$300/mo+" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Enterprise Stack", desc: "Scalable infra", price: "$200/mo" }],
      expert: [{ name: "Custom AI Stack", desc: "Build your own", price: "$500/mo+" }, { name: "Enterprise Tools", desc: "Full suite", price: "$300/mo+" }, { name: "Cloud Infra", desc: "Production", price: "$200/mo+" }]
    }
  },
  founder: {
    free: {
      beginner: [{ name: "Claude Free", desc: "Business planning", price: "$0" }, { name: "Notion", desc: "Organization", price: "$0" }, { name: "Canva", desc: "Design", price: "$0" }],
      intermediate: [{ name: "Claude", desc: "Strategy + writing", price: "$0" }, { name: "Tldv", desc: "Meeting notes", price: "$0" }, { name: "Carrd", desc: "Landing page", price: "$0" }],
      advanced: [{ name: "Claude Code", desc: "Build MVP", price: "$0" }, { name: "Supabase", desc: "Backend", price: "$0" }, { name: "Vercel", desc: "Hosting", price: "$0" }],
      expert: [{ name: "Full Stack Free", desc: "Claude + Supabase + Vercel", price: "$0" }, { name: "n8n", desc: "Automation", price: "$0" }, { name: "Plane", desc: "Project mgmt", price: "$0" }]
    },
    low: {
      beginner: [{ name: "Claude Pro", desc: "Strategy + execution", price: "$20/mo" }, { name: "Notion", desc: "Workspace", price: "$0" }, { name: "Carrd Pro", desc: "Landing pages", price: "$9/mo" }],
      intermediate: [{ name: "Claude Code", desc: "Build MVP", price: "$20/mo" }, { name: "Cursor", desc: "AI editor", price: "$20/mo" }, { name: "Supabase", desc: "Backend", price: "$25/mo" }],
      advanced: [{ name: "Claude Code", desc: "Product dev", price: "$20/mo" }, { name: "Cursor", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Complete setup", price: "$45/mo" }],
      expert: [{ name: "API Stack", desc: "Claude + GPT", price: "$50/mo" }, { name: "Cursor", desc: "AI editor", price: "$20/mo" }, { name: "Cloud", desc: "AWS/GCP", price: "$50/mo" }]
    },
    mid: {
      beginner: [{ name: "Claude Team", desc: "Strategy + execution", price: "$30/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Complete MVP", price: "$45/mo" }],
      intermediate: [{ name: "Claude Code", desc: "Product dev", price: "$100/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "MVP + scale", price: "$100/mo" }],
      advanced: [{ name: "Claude Code Max", desc: "Heavy dev", price: "$100/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Complete setup", price: "$200/mo" }],
      expert: [{ name: "Multi-API", desc: "Full AI suite", price: "$200/mo+" }, { name: "Enterprise Stack", desc: "Scalable", price: "$200/mo+" }, { name: "Automation", desc: "n8n + Make", price: "$50/mo" }]
    },
    high: {
      beginner: [{ name: "Claude Code Max", desc: "Build fast", price: "$100/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Production MVP", price: "$200/mo" }],
      intermediate: [{ name: "Full AI Suite", desc: "Claude + GPT + Gemini", price: "$200/mo+" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Enterprise Stack", desc: "Full stack", price: "$300/mo" }],
      advanced: [{ name: "Custom AI Stack", desc: "Build your own", price: "$300/mo+" }, { name: "Enterprise Tools", desc: "Full suite", price: "$300/mo+" }, { name: "Full Infra", desc: "Infrastructure", price: "$200/mo+" }],
      expert: [{ name: "Everything", desc: "No limits", price: "$500/mo+" }, { name: "Custom Stack", desc: "Full control", price: "$500/mo+" }, { name: "Enterprise", desc: "Enterprise tier", price: "$500/mo+" }]
    }
  },
  designer: {
    free: {
      beginner: [{ name: "Canva", desc: "Easy design", price: "$0" }, { name: "Figma", desc: "UI design", price: "$0" }, { name: "ChatGPT", desc: "Design ideas", price: "$0" }],
      intermediate: [{ name: "Figma", desc: "UI/UX", price: "$0" }, { name: "Midjourney", desc: "AI art", price: "$0" }, { name: "Claude", desc: "Design feedback", price: "$0" }],
      advanced: [{ name: "Figma + AI Plugins", desc: "Smart design", price: "$0" }, { name: "Midjourney", desc: "Concept art", price: "$0" }, { name: "Claude", desc: "Design system", price: "$0" }],
      expert: [{ name: "Full Free Stack", desc: "Figma + AI tools", price: "$0" }, { name: "Stable Diffusion", desc: "Local AI art", price: "$0" }, { name: "Claude API", desc: "Custom tools", price: "Pay per use" }]
    },
    low: {
      beginner: [{ name: "Figma Pro", desc: "UI design", price: "$15/mo" }, { name: "Canva Pro", desc: "Quick design", price: "$13/mo" }, { name: "Claude Pro", desc: "Design help", price: "$20/mo" }],
      intermediate: [{ name: "Figma Pro", desc: "UI/UX", price: "$15/mo" }, { name: "Midjourney", desc: "AI art", price: "$10/mo" }, { name: "Claude Pro", desc: "Design system", price: "$20/mo" }],
      advanced: [{ name: "Figma Pro", desc: "UI/UX", price: "$15/mo" }, { name: "Midjourney", desc: "Concepts", price: "$30/mo" }, { name: "Claude Pro", desc: "Design tokens", price: "$20/mo" }],
      expert: [{ name: "Full Stack", desc: "All tools", price: "$50/mo" }, { name: "Custom Pipeline", desc: "AI + design", price: "$50/mo" }, { name: "Cloud Storage", desc: "File storage", price: "$10/mo" }]
    },
    mid: {
      beginner: [{ name: "Figma Enterprise", desc: "Team design", price: "$75/mo" }, { name: "Midjourney", desc: "AI art", price: "$30/mo" }, { name: "Claude Pro", desc: "Design help", price: "$20/mo" }],
      intermediate: [{ name: "Full Design Stack", desc: "Figma + Midjourney + Claude", price: "$65/mo" }, { name: "Adobe CC", desc: "Creative suite", price: "$55/mo" }, { name: "Stock assets", desc: "Stock photos", price: "$30/mo" }],
      advanced: [{ name: "Enterprise Design", desc: "Full suite", price: "$200/mo" }, { name: "Custom AI Tools", desc: "Build your own", price: "$100/mo" }, { name: "Stock + Fonts", desc: "Assets + typography", price: "$50/mo" }],
      expert: [{ name: "Full Suite", desc: "Everything", price: "$300/mo+" }, { name: "Custom Pipeline", desc: "AI + design", price: "$200/mo+" }, { name: "Enterprise", desc: "Enterprise tier", price: "$200/mo+" }]
    },
    high: {
      beginner: [{ name: "Full Creative Suite", desc: "Figma + Adobe + AI", price: "$200/mo" }, { name: "Midjourney Unlimited", desc: "AI art", price: "$60/mo" }, { name: "Claude Team", desc: "Design help", price: "$30/mo" }],
      intermediate: [{ name: "Everything", desc: "No limits", price: "$300/mo+" }, { name: "Custom Tools", desc: "Build your own", price: "$200/mo" }, { name: "Enterprise Stock", desc: "Stock assets", price: "$100/mo" }],
      advanced: [{ name: "Full Suite", desc: "Enterprise", price: "$500/mo+" }, { name: "Custom AI Stack", desc: "Custom tools", price: "$300/mo+" }, { name: "Cloud Infra", desc: "Infrastructure", price: "$200/mo+" }],
      expert: [{ name: "Everything", desc: "No limits", price: "$500/mo+" }, { name: "Custom Stack", desc: "Full control", price: "$500/mo+" }, { name: "Enterprise", desc: "Enterprise tier", price: "$500/mo+" }]
    }
  }
};
