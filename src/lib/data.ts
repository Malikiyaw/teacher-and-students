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
  url?: string;
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
  source?: string;
}

export interface Tool {
  name: string;
  desc: string;
  price: string;
}

export const WORKFLOWS: Workflow[] = [
  { id: 1, title: "Scaffold a Next.js 15 App in 15 Minutes", category: "coding", model: "Claude Code", timeSaved: "3 hours", rating: 4.9, reviews: 342, featured: true, description: "Generate a full-stack Next.js 15 project with App Router, Supabase auth, PostgreSQL database, and TypeScript from a single prompt. Working scaffold with routing, layouts, and env setup in under 15 minutes.", tags: ["nextjs", "supabase", "scaffold", "fullstack"] },
  { id: 2, title: "AI Ghostwriting Pipeline ($5K-$20K/mo)", category: "content", model: "Claude", timeSaved: "20 hours/week", rating: 4.8, reviews: 218, featured: true, description: "Scrape a client's voice from existing content, generate 30 days of LinkedIn/Twitter posts in one session, schedule and iterate. Documented by indie hackers generating $5K-$20K/mo in ghostwriting revenue.", tags: ["ghostwriting", "linkedin", "content", "saas"] },
  { id: 3, title: "Chrome Extension with Cursor in 2 Weeks", category: "coding", model: "Cursor", timeSaved: "40 hours", rating: 4.7, reviews: 156, featured: false, description: "Build and ship a Chrome extension from idea to production in 2 weeks using Cursor's AI pair programming. Real case study: AI email assistant generating $2K-$10K MRR potential.", tags: ["chrome", "extension", "cursor", "mvp"] },
  { id: 4, title: "Automated Code Review with `/code-review`", category: "coding", model: "Claude Code", timeSaved: "2 hours/day", rating: 4.8, reviews: 289, featured: false, description: "Use Claude Code's built-in /code-review command to scan entire codebases for security, performance, and maintainability issues. Produces structured Markdown reports with file references.", tags: ["code-review", "claude", "security", "automation"] },
  { id: 5, title: "YouTube Script Generator (3-4x Frequency)", category: "content", model: "ChatGPT", timeSaved: "6 hours/video", rating: 4.6, reviews: 523, featured: false, description: "Generate video scripts with hooks, chapters, CTAs, and SEO descriptions. Documented workflow: channels using AI scripting publish 3-4x more frequently. One creator hit 700M views.", tags: ["youtube", "script", "content", "seo"] },
  { id: 6, title: "Generate OpenAPI Specs from Code", category: "coding", model: "Claude", timeSaved: "4 hours", rating: 4.5, reviews: 178, featured: false, description: "Point Claude at your codebase and generate complete OpenAPI 3.1 specifications, including request/response schemas, authentication, and endpoint documentation.", tags: ["api", "openapi", "documentation", "claude"] },
  { id: 7, title: "Flutter App End-to-End with Claude Code", category: "coding", model: "Claude Code", timeSaved: "8 hours", rating: 4.9, reviews: 267, featured: true, description: "Complete Flutter app development: project setup, state management (Riverpod/Bloc), custom UI, API integration, and testing — all from Claude Code CLI.", tags: ["flutter", "mobile", "dart", "claude-code"] },
  { id: 8, title: "SEO Blog Post Pipeline", category: "content", model: "Claude", timeSaved: "4 hours", rating: 4.7, reviews: 412, featured: false, description: "End-to-end SEO content pipeline: keyword research, outline generation, draft writing, internal linking, meta descriptions, and schema markup — all from one workflow.", tags: ["seo", "blog", "content", "marketing"] },
  { id: 9, title: "Supabase Auth + CRUD Setup with Claude Code", category: "coding", model: "Claude Code", timeSaved: "3 hours", rating: 4.6, reviews: 145, featured: false, description: "Complete Supabase authentication flow with signup, login, password reset, and full CRUD operations. Generates TypeScript types, RLS policies, and React hooks.", tags: ["supabase", "auth", "backend", "typescript"] },
];

export const SHOWCASES: Showcase[] = [
  { id: 1, title: "DocAPI", tool: "claude", builtIn: "1 week", revenue: "$350/mo MRR", description: "HTML-to-PDF generation API. Built solo, 12 paying customers. Bootstrapped from $0 to real revenue. Built with Claude for code generation and architecture decisions.", tags: ["claude", "api", "saas", "pdf"], likes: 342, featured: true, url: "https://docapi.dev" },
  { id: 2, title: "Cursor", tool: "cursor", builtIn: "2023", revenue: "$2B ARR", description: "AI-first code editor. The tool that proved AI-native IDEs are the future. Built by Anysphere, now the standard for AI-assisted development.", tags: ["cursor", "ide", "developer-tools"], likes: 1200, url: "https://cursor.com" },
  { id: 3, title: "OpenCode", tool: "cursor", builtIn: "2024", revenue: "Free (161K★)", description: "Open-source CLI tool for AI coding assistance. 161K GitHub stars. Alternative to Claude Code with multi-model support. Community-driven, free forever.", tags: ["open-source", "cli", "coding"], likes: 890, url: "https://github.com/opencode-ai/opencode" },
  { id: 4, title: "Cline", tool: "claude", builtIn: "2024", revenue: "Free (61K★)", description: "VS Code extension for AI pair programming. 61K GitHub stars. Autonomously writes, edits, and tests code with full file system and browser access.", tags: ["vscode", "extension", "open-source"], likes: 670, url: "https://github.com/cline/cline" },
  { id: 5, title: "Daxtr.ai", tool: "cursor", builtIn: "2025", revenue: "Early stage", description: "AI-powered tool built using cursor-rules for consistent code generation. Real project by Ryan Wang demonstrating practical cursor-rules adoption.", tags: ["cursor", "rules", "ai-tool"], likes: 218, url: "https://github.com/ryanwang/daxtr" },
  { id: 6, title: "FarmPosts", tool: "chatgpt", builtIn: "2025", revenue: "$0 (Beta)", description: "Social media management tool for farmers. Honest early-stage project — zero revenue, still in beta. Built with ChatGPT for content generation and strategy.", tags: ["chatgpt", "social-media", "beta"], likes: 156 },
];

export const HUB_POSTS: HubPost[] = [
  { id: 1, type: "Cursor Rule", title: "Next.js 15 App Router Rules", content: "Always use App Router. Prefer Server Components. Use Server Actions for mutations. Never use getServerSideProps. Use `loading.tsx` for loading states. Keep client components small and pushed to leaves.", author: "deadbyapril", likes: 312, date: "Real rule from cursor-rules repo", featured: true },
  { id: 2, type: "Standard", title: "AGENTS.md: 60K+ Repos Adopted", content: "AGENTS.md is the new standard for AI coding context. Drop the file in your repo root — it tells AI assistants your project conventions, tech stack, and preferences. Backed by OpenAI, adopted by 60,000+ repos.", author: "OpenAI + Linux Foundation", likes: 456, date: "2026 standard" },
  { id: 3, type: "Setup", title: "Claude Code Plugin Marketplace", content: "Spring 2026: Claude Code now has a plugin marketplace. Community-built extensions for testing, deployment, database management, and more. Install via /install-plugin command.", author: "Codersera", likes: 234, date: "Spring 2026" },
  { id: 4, type: "MCP Server", title: "Playwright MCP for Testing", content: "Add Playwright MCP server to Cursor for E2E testing. Config in .cursor/mcp.json: { \"mcpServers\": { \"playwright\": { \"command\": \"npx\", \"args\": [\"@playwright/mcp\"] } } }. Write and run tests from chat.", author: "test_ninja", likes: 189, date: "Real config", featured: true },
  { id: 5, type: "Workflow", title: "Multi-Tool Daily AI Coding Workflow", content: "Morning: Claude Code for architecture and refactoring. Midday: Cursor for daily feature coding. Evening: Claude for code review. GitHub Copilot for quick completions in VS Code. Each tool plays to its strength.", author: "LumiChats", likes: 278, date: "2026 workflow" },
  { id: 6, type: "Best Practice", title: "TypeScript Strict Mode Rules", content: "Enforce: no `any`, prefer `type` over `interface`, use branded types for IDs, never use `enum` (use const objects). AI tools generate better code when you're explicit about types.", author: "ts_purist", likes: 167, date: "Widely adopted" },
];

export const FAILURES: Failure[] = [
  { id: 1, category: "hallucination", title: "Air Canada Chatbot Invented Bereavement Policy", description: "Air Canada's chatbot told a passenger they could buy a full-price ticket now and claim a bereavement refund later — a policy that didn't exist. BC Civil Resolution Tribunal held the airline liable for the chatbot's misinformation.", ai: "Air Canada Chatbot", upvotes: 1892, date: "2024", source: "BC Civil Resolution Tribunal ruling" },
  { id: 2, category: "hallucination", title: "DPD Chatbot Wrote Profane Poem About Company", description: "DPD, a UK delivery firm, suspended its AI chatbot after it was tricked into writing a poem about how terrible DPD was and swearing about the company. The incident went viral, causing real brand damage.", ai: "DPD GenAI Chatbot", upvotes: 1567, date: "2024", source: "BBC News, multiple outlets" },
  { id: 3, category: "coding", title: "NEDA Tessa Chatbot Gave Harmful Eating Disorder Advice", description: "The National Eating Disorders Association (NEDA) launched 'Tessa' an AI chatbot to help people with eating disorders. It gave harmful advice including calorie counting and weight loss tips. Suspended within days.", ai: "Tessa (NEDA)", upvotes: 1234, date: "2023", source: "NEDA official statement, Washington Post" },
  { id: 4, category: "hallucination", title: "French Court Flagged 'Untraceable' AI-Hallucinated Precedents", description: "Tribunal judiciaire de Périgueux discovered legal filings citing precedents that didn't exist — completely fabricated case law generated by AI. The court flagged the issue and sanctioned the attorneys.", ai: "Unspecified LLM", upvotes: 987, date: "Dec 2025", source: "Giskard report, Tribunal judiciaire de Périgueux" },
  { id: 5, category: "hallucination", title: "MyPillow Attorneys Fined for Fabricated Citations", description: "Attorneys representing MyPillow were fined $3,000 each for submitting legal briefs containing AI-generated citations to cases that don't exist. The court found the attorneys failed to verify the AI's output.", ai: "Unspecified LLM", upvotes: 876, date: "2025", source: "OpenAI hallu-benchmark (May 2026)" },
  { id: 6, category: "coding", title: "Cursor 'Sam' AI Invented Single-Device Login Policy", description: "Cursor's AI assistant 'Sam' confidently told users there was a policy requiring account logout on other devices — a policy that never existed. Users cancelled subscriptions based on the false information.", ai: "Cursor 'Sam'", upvotes: 654, date: "2025", source: "OpenAI hallu-benchmark (May 2026)" },
];

export const TOOL_STACKS: Record<string, Record<string, Record<string, Tool[]>>> = {
  writer: {
    free: {
      beginner: [{ name: "ChatGPT Free", desc: "Free tier for writing", price: "$0" }, { name: "Grammarly Free", desc: "Writing assistant", price: "$0" }, { name: "Notion", desc: "Note-taking + AI", price: "$0" }],
      intermediate: [{ name: "Claude Free", desc: "Best for long-form", price: "$0" }, { name: "Perplexity Free", desc: "Research + writing", price: "$0" }, { name: "Otter.ai Free", desc: "Transcription", price: "$0" }],
      advanced: [{ name: "Claude Free", desc: "Deep analysis", price: "$0" }, { name: "Grammarly Free", desc: "Editing", price: "$0" }, { name: "Notion", desc: "Organization", price: "$0" }],
      expert: [{ name: "Claude API", desc: "Custom pipelines", price: "Pay per use" }, { name: "LangChain", desc: "Chain prompts", price: "$0" }, { name: "n8n", desc: "Automation", price: "$0" }]
    },
    low: {
      beginner: [{ name: "Claude Pro", desc: "Best all-around", price: "$20/mo" }, { name: "Canva Pro", desc: "Visual content", price: "$13/mo" }, { name: "Notion", desc: "Organization", price: "$0" }],
      intermediate: [{ name: "Claude Pro", desc: "Writing + analysis", price: "$20/mo" }, { name: "Grammarly Premium", desc: "Advanced editing", price: "$12/mo" }, { name: "Descript", desc: "Video/podcast", price: "$24/mo" }],
      advanced: [{ name: "Claude Pro", desc: "Writing + research", price: "$20/mo" }, { name: "Jasper", desc: "Marketing copy", price: "$49/mo" }, { name: "Surfer SEO", desc: "Content optimization", price: "$89/mo" }],
      expert: [{ name: "Claude API", desc: "Custom workflows", price: "Pay per use" }, { name: "OpenAI API", desc: "GPT-4 access", price: "Pay per use" }, { name: "Make.com", desc: "Automation", price: "$9/mo" }]
    },
    mid: {
      beginner: [{ name: "Claude Pro", desc: "Premium writing", price: "$20/mo" }, { name: "Jasper", desc: "Content creation", price: "$49/mo" }, { name: "Canva Pro", desc: "Design", price: "$13/mo" }],
      intermediate: [{ name: "Claude Pro", desc: "Long-form content", price: "$20/mo" }, { name: "Jasper", desc: "Marketing copy", price: "$49/mo" }, { name: "Surfer SEO", desc: "SEO", price: "$89/mo" }],
      advanced: [{ name: "Claude Pro", desc: "Deep research", price: "$20/mo" }, { name: "Jasper + Surfer", desc: "Full content stack", price: "$138/mo" }, { name: "Descript", desc: "Multimedia", price: "$24/mo" }],
      expert: [{ name: "Custom API Stack", desc: "Claude + GPT + Gemini", price: "Pay per use" }, { name: "LangChain", desc: "Orchestration", price: "$0" }, { name: "Pinecone", desc: "RAG pipeline", price: "$70/mo" }]
    },
    high: {
      beginner: [{ name: "Claude Pro", desc: "Best quality", price: "$20/mo" }, { name: "Jasper", desc: "Enterprise content", price: "$125/mo" }, { name: "Full Adobe Suite", desc: "Creative tools", price: "$55/mo" }],
      intermediate: [{ name: "Claude Pro", desc: "Core writing", price: "$20/mo" }, { name: "Jasper", desc: "Marketing", price: "$125/mo" }, { name: "Semrush", desc: "SEO + research", price: "$130/mo" }],
      advanced: [{ name: "Multi-model Stack", desc: "Claude + GPT + Gemini", price: "$200/mo" }, { name: "Custom Tools", desc: "Build your own", price: "$100/mo+" }, { name: "Enterprise SEO", desc: "Surfer + Semrush", price: "$200/mo" }],
      expert: [{ name: "Full API Stack", desc: "All providers", price: "$300/mo+" }, { name: "Custom RAG", desc: "Private knowledge", price: "$200/mo+" }, { name: "Automation Suite", desc: "Make + Zapier + n8n", price: "$100/mo" }]
    }
  },
  developer: {
    free: {
      beginner: [{ name: "GitHub Copilot Free", desc: "Code completion", price: "$0" }, { name: "Cursor Free", desc: "AI code editor", price: "$0" }, { name: "Claude Free", desc: "Code assistance", price: "$0" }],
      intermediate: [{ name: "Claude Code Free", desc: "CLI coding", price: "$0" }, { name: "Cursor Free", desc: "AI editor", price: "$0" }, { name: "Vercel Free", desc: "Deployment", price: "$0" }],
      advanced: [{ name: "Claude Code Free", desc: "Full-stack dev", price: "$0" }, { name: "Cursor Free", desc: "AI pair programming", price: "$0" }, { name: "Supabase Free", desc: "Backend", price: "$0" }],
      expert: [{ name: "Claude API", desc: "Custom tools", price: "Pay per use" }, { name: "GitHub Copilot Free", desc: "Code suggestions", price: "$0" }, { name: "Vercel + Supabase", desc: "Full stack", price: "$0" }]
    },
    low: {
      beginner: [{ name: "Claude Pro", desc: "Code help", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Vercel Pro", desc: "Hosting", price: "$20/mo" }],
      intermediate: [{ name: "Claude Code", desc: "CLI coding", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Supabase Pro", desc: "Backend", price: "$25/mo" }],
      advanced: [{ name: "Claude Code", desc: "Development", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Complete setup", price: "$45/mo" }],
      expert: [{ name: "API Stack", desc: "Claude + OpenAI", price: "$50/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Cloud", desc: "AWS/GCP free tier", price: "$0" }]
    },
    mid: {
      beginner: [{ name: "Claude Pro", desc: "Code + docs", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "GitHub Copilot", desc: "Code completion", price: "$10/mo" }],
      intermediate: [{ name: "Claude Code", desc: "Full-stack", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Vercel + Supabase", desc: "Hosting + DB", price: "$45/mo" }],
      advanced: [{ name: "Claude Code", desc: "Heavy usage", price: "$20/mo" }, { name: "Cursor Business", desc: "Team features", price: "$40/mo" }, { name: "Full Stack", desc: "Complete setup", price: "$65/mo" }],
      expert: [{ name: "Multi-API", desc: "Claude + GPT + Gemini", price: "$150/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Cloud + DB", desc: "Production setup", price: "$100/mo" }]
    },
    high: {
      beginner: [{ name: "Claude Code Max", desc: "Best coding AI", price: "$200/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "GitHub Copilot Pro", desc: "Code completion", price: "$10/mo" }],
      intermediate: [{ name: "Claude Code Max", desc: "Core development", price: "$200/mo" }, { name: "Cursor Business", desc: "AI editor", price: "$40/mo" }, { name: "Full Stack", desc: "Production setup", price: "$200/mo" }],
      advanced: [{ name: "Claude Code Max + Cursor Business", desc: "All AI providers", price: "$240/mo" }, { name: "GitHub Copilot Max", desc: "Code completion", price: "$100/mo" }, { name: "Enterprise Stack", desc: "Scalable infra", price: "$200/mo" }],
      expert: [{ name: "Custom AI Stack", desc: "Build your own", price: "$500/mo+" }, { name: "Enterprise Tools", desc: "Full suite", price: "$300/mo+" }, { name: "Cloud Infra", desc: "Production", price: "$200/mo+" }]
    }
  },
  founder: {
    free: {
      beginner: [{ name: "Claude Free", desc: "Business planning", price: "$0" }, { name: "Notion", desc: "Organization", price: "$0" }, { name: "Canva", desc: "Design", price: "$0" }],
      intermediate: [{ name: "Claude Free", desc: "Strategy + writing", price: "$0" }, { name: "Tldv", desc: "Meeting notes", price: "$0" }, { name: "Carrd", desc: "Landing page", price: "$0" }],
      advanced: [{ name: "Claude Code Free", desc: "Build MVP", price: "$0" }, { name: "Supabase Free", desc: "Backend", price: "$0" }, { name: "Vercel Free", desc: "Hosting", price: "$0" }],
      expert: [{ name: "Full Stack Free", desc: "Claude + Supabase + Vercel", price: "$0" }, { name: "n8n", desc: "Automation", price: "$0" }, { name: "Plane", desc: "Project mgmt", price: "$0" }]
    },
    low: {
      beginner: [{ name: "Claude Pro", desc: "Strategy + execution", price: "$20/mo" }, { name: "Notion", desc: "Workspace", price: "$0" }, { name: "Carrd Pro", desc: "Landing pages", price: "$9/mo" }],
      intermediate: [{ name: "Claude Code", desc: "Build MVP", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Supabase Pro", desc: "Backend", price: "$25/mo" }],
      advanced: [{ name: "Claude Code", desc: "Product dev", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Complete setup", price: "$45/mo" }],
      expert: [{ name: "API Stack", desc: "Claude + GPT", price: "$50/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Cloud", desc: "AWS/GCP", price: "$50/mo" }]
    },
    mid: {
      beginner: [{ name: "Claude Pro", desc: "Strategy + execution", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Complete MVP", price: "$45/mo" }],
      intermediate: [{ name: "Claude Code", desc: "Product dev", price: "$20/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "MVP + scale", price: "$100/mo" }],
      advanced: [{ name: "Claude Code", desc: "Heavy dev", price: "$20/mo" }, { name: "Cursor Business", desc: "AI editor", price: "$40/mo" }, { name: "Full Stack", desc: "Complete setup", price: "$200/mo" }],
      expert: [{ name: "Multi-API", desc: "Full AI suite", price: "$200/mo+" }, { name: "Enterprise Stack", desc: "Scalable", price: "$200/mo+" }, { name: "Automation", desc: "n8n + Make", price: "$50/mo" }]
    },
    high: {
      beginner: [{ name: "Claude Code Max", desc: "Build fast", price: "$200/mo" }, { name: "Cursor Pro", desc: "AI editor", price: "$20/mo" }, { name: "Full Stack", desc: "Production MVP", price: "$200/mo" }],
      intermediate: [{ name: "Full AI Suite", desc: "Claude + GPT + Gemini", price: "$200/mo+" }, { name: "Cursor Business", desc: "AI editor", price: "$40/mo" }, { name: "Enterprise Stack", desc: "Full stack", price: "$300/mo" }],
      advanced: [{ name: "Custom AI Stack", desc: "Build your own", price: "$300/mo+" }, { name: "Enterprise Tools", desc: "Full suite", price: "$300/mo+" }, { name: "Full Infra", desc: "Infrastructure", price: "$200/mo+" }],
      expert: [{ name: "Everything", desc: "No limits", price: "$500/mo+" }, { name: "Custom Stack", desc: "Full control", price: "$500/mo+" }, { name: "Enterprise", desc: "Enterprise tier", price: "$500/mo+" }]
    }
  },
  designer: {
    free: {
      beginner: [{ name: "Canva Free", desc: "Easy design", price: "$0" }, { name: "Figma Free", desc: "UI design", price: "$0" }, { name: "ChatGPT Free", desc: "Design ideas", price: "$0" }],
      intermediate: [{ name: "Figma Free", desc: "UI/UX", price: "$0" }, { name: "Midjourney Free", desc: "AI art", price: "$0" }, { name: "Claude Free", desc: "Design feedback", price: "$0" }],
      advanced: [{ name: "Figma + AI Plugins", desc: "Smart design", price: "$0" }, { name: "Midjourney Free", desc: "Concept art", price: "$0" }, { name: "Claude Free", desc: "Design system", price: "$0" }],
      expert: [{ name: "Full Free Stack", desc: "Figma + AI tools", price: "$0" }, { name: "Stable Diffusion", desc: "Local AI art", price: "$0" }, { name: "Claude API", desc: "Custom tools", price: "Pay per use" }]
    },
    low: {
      beginner: [{ name: "Figma Pro", desc: "UI design", price: "$15/mo" }, { name: "Canva Pro", desc: "Quick design", price: "$13/mo" }, { name: "Claude Pro", desc: "Design help", price: "$20/mo" }],
      intermediate: [{ name: "Figma Pro", desc: "UI/UX", price: "$15/mo" }, { name: "Midjourney", desc: "AI art", price: "$10/mo" }, { name: "Claude Pro", desc: "Design system", price: "$20/mo" }],
      advanced: [{ name: "Figma Pro", desc: "UI/UX", price: "$15/mo" }, { name: "Midjourney", desc: "Concepts", price: "$30/mo" }, { name: "Claude Pro", desc: "Design tokens", price: "$20/mo" }],
      expert: [{ name: "Full Stack", desc: "All tools", price: "$50/mo" }, { name: "Custom Pipeline", desc: "AI + design", price: "$50/mo" }, { name: "Cloud Storage", desc: "File storage", price: "$10/mo" }]
    },
    mid: {
      beginner: [{ name: "Figma Pro", desc: "Team design", price: "$15/mo" }, { name: "Midjourney", desc: "AI art", price: "$30/mo" }, { name: "Claude Pro", desc: "Design help", price: "$20/mo" }],
      intermediate: [{ name: "Full Design Stack", desc: "Figma + Midjourney + Claude", price: "$65/mo" }, { name: "Adobe CC", desc: "Creative suite", price: "$55/mo" }, { name: "Stock assets", desc: "Stock photos", price: "$30/mo" }],
      advanced: [{ name: "Enterprise Design", desc: "Full suite", price: "$200/mo" }, { name: "Custom AI Tools", desc: "Build your own", price: "$100/mo" }, { name: "Stock + Fonts", desc: "Assets + typography", price: "$50/mo" }],
      expert: [{ name: "Full Suite", desc: "Everything", price: "$300/mo+" }, { name: "Custom Pipeline", desc: "AI + design", price: "$200/mo+" }, { name: "Enterprise", desc: "Enterprise tier", price: "$200/mo+" }]
    },
    high: {
      beginner: [{ name: "Full Creative Suite", desc: "Figma + Adobe + AI", price: "$200/mo" }, { name: "Midjourney Unlimited", desc: "AI art", price: "$60/mo" }, { name: "Claude Pro", desc: "Design help", price: "$20/mo" }],
      intermediate: [{ name: "Everything", desc: "No limits", price: "$300/mo+" }, { name: "Custom Tools", desc: "Build your own", price: "$200/mo" }, { name: "Enterprise Stock", desc: "Stock assets", price: "$100/mo" }],
      advanced: [{ name: "Full Suite", desc: "Enterprise", price: "$500/mo+" }, { name: "Custom AI Stack", desc: "Custom tools", price: "$300/mo+" }, { name: "Cloud Infra", desc: "Infrastructure", price: "$200/mo+" }],
      expert: [{ name: "Everything", desc: "No limits", price: "$500/mo+" }, { name: "Custom Stack", desc: "Full control", price: "$500/mo+" }, { name: "Enterprise", desc: "Enterprise tier", price: "$500/mo+" }]
    }
  }
};
