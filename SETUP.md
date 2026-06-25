# ClassDeck — Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up (free)
2. Click **New Project**
3. Name it `classdeck`
4. Set a database password (save it)
5. Choose a region close to your users
6. Click **Create Project**

Once created, go to **Settings → API** and copy these:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (looks like `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret!) |

## Step 2: Create Database Tables

Go to **SQL Editor** in Supabase and run this:

```sql
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text check (role in ('teacher', 'student')) default 'student',
  school text,
  avatar_url text,
  plan text check (plan in ('starter', 'pro')) default 'starter',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Presentations
create table public.presentations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled',
  subject text,
  slides jsonb default '[]'::jsonb,
  template text default 'blank',
  status text check (status in ('draft', 'published')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Rooms
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  presentation_id uuid references public.presentations(id) on delete set null,
  name text not null,
  code text unique not null,
  max_students integer default 30,
  status text check (status in ('active', 'scheduled', 'ended')) default 'active',
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Room participants
create table public.room_participants (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, student_id)
);

-- Polls
create table public.polls (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Poll votes
create table public.poll_votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references public.polls(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  option_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(poll_id, student_id)
);

-- Quizzes
create table public.quizzes (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quiz responses
create table public.quiz_responses (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  answers jsonb not null default '[]'::jsonb,
  score integer,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat messages
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_announcement boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reactions
create table public.reactions (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hand raises
create table public.hand_raises (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  is_raised boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, student_id)
);

-- Word clouds
create table public.word_clouds (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  question text not null,
  words jsonb not null default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Word cloud submissions
create table public.word_submissions (
  id uuid default gen_random_uuid() primary key,
  word_cloud_id uuid references public.word_clouds(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  word text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exit tickets
create table public.exit_tickets (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  question text not null default 'What did you learn today?',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exit ticket responses
create table public.exit_ticket_responses (
  id uuid default gen_random_uuid() primary key,
  exit_ticket_id uuid references public.exit_tickets(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  response text not null,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(exit_ticket_id, student_id)
);

-- Student notes
create table public.student_notes (
  id uuid default gen_random_uuid() primary key,
  presentation_id uuid references public.presentations(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  slide_index integer not null,
  content text not null default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(presentation_id, student_id, slide_index)
);

-- Attendance
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  left_at timestamp with time zone,
  unique(room_id, student_id)
);

-- Folders
create table public.folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.presentations enable row level security;
alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_responses enable row level security;
alter table public.chat_messages enable row level security;
alter table public.reactions enable row level security;
alter table public.hand_raises enable row level security;
alter table public.word_clouds enable row level security;
alter table public.word_submissions enable row level security;
alter table public.exit_tickets enable row level security;
alter table public.exit_ticket_responses enable row level security;
alter table public.student_notes enable row level security;
alter table public.attendance enable row level security;
alter table public.folders enable row level security;

-- Add current_slide to rooms
alter table public.rooms add column if not exists current_slide integer default 0;

-- Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Teachers can view students in their rooms" on public.profiles for select using (
  exists (select 1 from public.room_participants rp join public.rooms r on r.id = rp.room_id where rp.student_id = public.profiles.id and r.teacher_id = auth.uid())
);

create policy "Teachers can manage own presentations" on public.presentations for all using (auth.uid() = user_id);
create policy "Students can view published presentations" on public.presentations for select using (status = 'published');

create policy "Teachers can manage own rooms" on public.rooms for all using (auth.uid() = teacher_id);
create policy "Students can view active rooms" on public.rooms for select using (status = 'active');

create policy "Students can join rooms" on public.room_participants for insert with check (auth.uid() = student_id);
create policy "Users can view room participants" on public.room_participants for select using (
  exists (select 1 from public.rooms where id = room_id and teacher_id = auth.uid())
  or student_id = auth.uid()
);

create policy "Teachers can manage polls" on public.polls for all using (
  exists (select 1 from public.rooms where id = room_id and teacher_id = auth.uid())
);
create policy "Students can view active polls" on public.polls for select using (is_active = true);

create policy "Students can vote" on public.poll_votes for insert with check (auth.uid() = student_id);
create policy "Users can view poll votes" on public.poll_votes for select using (
  exists (select 1 from public.polls p join public.rooms r on r.id = p.room_id where p.id = poll_id and r.teacher_id = auth.uid())
  or student_id = auth.uid()
);

create policy "Teachers can manage quizzes" on public.quizzes for all using (
  exists (select 1 from public.rooms where id = room_id and teacher_id = auth.uid())
);

create policy "Students can submit quiz responses" on public.quiz_responses for insert with check (auth.uid() = student_id);
create policy "Teachers can view quiz responses" on public.quiz_responses for select using (
  exists (select 1 from public.quizzes q join public.rooms r on r.id = q.room_id where q.id = quiz_id and r.teacher_id = auth.uid())
);

-- Chat policies
create policy "Users can view chat messages" on public.chat_messages for select using (
  exists (select 1 from public.rooms where id = room_id and (teacher_id = auth.uid() or status = 'active'))
);
create policy "Users can send chat messages" on public.chat_messages for insert with check (auth.uid() = user_id);

-- Reaction policies
create policy "Users can view reactions" on public.reactions for select using (
  exists (select 1 from public.rooms where id = room_id and (teacher_id = auth.uid() or status = 'active'))
);
create policy "Users can send reactions" on public.reactions for insert with check (auth.uid() = user_id);

-- Hand raise policies
create policy "Users can view hand raises" on public.hand_raises for select using (
  exists (select 1 from public.rooms where id = room_id and teacher_id = auth.uid())
  or student_id = auth.uid()
);
create policy "Students can toggle hand raise" on public.hand_raises for all using (auth.uid() = student_id);

-- Word cloud policies
create policy "Teachers can manage word clouds" on public.word_clouds for all using (
  exists (select 1 from public.rooms where id = room_id and teacher_id = auth.uid())
);
create policy "Students can view active word clouds" on public.word_clouds for select using (is_active = true);
create policy "Students can submit words" on public.word_submissions for insert with check (auth.uid() = student_id);
create policy "Users can view word submissions" on public.word_submissions for select using (
  exists (select 1 from public.word_clouds wc join public.rooms r on r.id = wc.room_id where wc.id = word_cloud_id and r.teacher_id = auth.uid())
  or student_id = auth.uid()
);

-- Exit ticket policies
create policy "Teachers can manage exit tickets" on public.exit_tickets for all using (
  exists (select 1 from public.rooms where id = room_id and teacher_id = auth.uid())
);
create policy "Students can view active exit tickets" on public.exit_tickets for select using (is_active = true);
create policy "Students can submit exit ticket" on public.exit_ticket_responses for insert with check (auth.uid() = student_id);
create policy "Teachers can view exit ticket responses" on public.exit_ticket_responses for select using (
  exists (select 1 from public.exit_tickets et join public.rooms r on r.id = et.room_id where et.id = exit_ticket_id and r.teacher_id = auth.uid())
);

-- Student notes policies
create policy "Students can manage own notes" on public.student_notes for all using (auth.uid() = student_id);

-- Attendance policies
create policy "Teachers can view attendance" on public.attendance for select using (
  exists (select 1 from public.rooms where id = room_id and teacher_id = auth.uid())
);
create policy "Students can insert attendance" on public.attendance for insert with check (auth.uid() = student_id);
create policy "Students can update own attendance" on public.attendance for update using (auth.uid() = student_id);

-- Folder policies
create policy "Users can manage own folders" on public.folders for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'email', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## Step 3: Create Stripe Products

1. Go to https://dashboard.stripe.com and sign up (free)
2. Go to **Products** → click **Add product**
3. Name it `ClassDeck Pro`
4. Set price to **$8/month** (recurring)
5. Copy the **Price ID** (starts with `price_`)
6. Go to **Developers → API keys** and copy:
   - `STRIPE_SECRET_KEY` (starts with `sk_test_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)

## Step 4: Set Up Vercel

1. Go to https://vercel.com
2. Click **Add New Project**
3. Import from GitHub: `Malikiyaw/ai-lunch`
4. Click **Environment Variables** and add these:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | (Set up in Step 5) |
| `STRIPE_PRICE_ID` | Your Stripe price ID |
| `NEXT_PUBLIC_APP_URL` | `https://ai-lunch.vercel.app` |

5. Click **Deploy**

## Step 5: Stripe Webhook

After first deploy:

1. Go to https://dashboard.stripe.com → **Developers → Webhooks**
2. Click **Add endpoint**
3. Set URL to: `https://ai-lunch.vercel.app/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the **Webhook signing secret** → add it to Vercel as `STRIPE_WEBHOOK_SECRET`

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to your project → **Settings → Domains**
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars

## Summary of All Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
STRIPE_PRICE_ID=price_xxxx
NEXT_PUBLIC_APP_URL=https://ai-lunch.vercel.app
```

All 7 variables. That's it.
