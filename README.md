# 🦸‍♂️ Herofy - Turn Your Life Into an Epic RPG Adventure

Transform boring daily tasks into exciting RPG quests that motivate you to become the hero of your own life!

## ✨ Features

- **AI Quest Generation**: Transform any task into an epic RPG quest using OpenAI
- **XP & Leveling System**: Gain experience points and level up as you complete tasks
- **RPG Stats**: Build your Strength, Wisdom, Endurance, and Charisma
- **Beautiful UI**: Smooth animations and engaging visual feedback
- **Quest Reflection**: Mindful completion process for meaningful tasks
- **Progress Tracking**: Watch your character grow stronger over time

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Supabase account (already configured)

### Setup

1. **Clone and install dependencies:**
```bash
git clone [your-repo-url] herofy
cd herofy
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How It Works

1. **Create Account**: Sign up with email or social login
2. **Add a Task**: Enter any boring task (e.g., "do laundry")
3. **Transform to Quest**: AI converts it to "Cleanse the Cursed Garments of Chaos"
4. **Complete & Level Up**: Finish the quest, gain XP, and level up your character
5. **Build Stats**: Different quest types improve different RPG stats

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📁 Project Structure

```
herofy/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                   # Utilities (Supabase, AI)
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── utils/                 # Helper functions
```

## 🎯 Core Components

- **QuestCard**: Beautiful quest display with completion tracking
- **QuestCreator**: Transform tasks into quests with AI
- **UserProfile**: Character stats and progression display
- **LevelProgressBar**: Visual XP and level tracking

## 🗄️ Database Schema

- **users**: User profiles, levels, and total XP
- **quests**: Quest data with completion tracking
- **user_stats**: RPG stats (strength, wisdom, etc.)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel:**
```bash
npx vercel
```

2. **Set environment variables in Vercel dashboard:**
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` (already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already set)

3. **Deploy:**
```bash
vercel --prod
```

## 🎨 Customization

### Quest Categories
Edit `lib/ai-quest-generator.ts` to add new quest categories and templates.

### Difficulty Colors
Modify `tailwind.config.js` quest colors to match your theme.

### XP Calculations
Adjust leveling formulas in the database functions or `utils/xp-calculations.ts`.

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📦 Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key

# Already configured (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://dxepbnoagmdqlxeyybla.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_anon_key]

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Herofy
```

## 🎯 Roadmap

- [ ] Social features (friends, leaderboards)
- [ ] Daily challenges and achievements
- [ ] Quest sharing and collaboration
- [ ] Mobile app (React Native)
- [ ] Integration with fitness trackers
- [ ] Team/guild functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

Having issues? Check these common solutions:

- **Build errors**: Make sure all dependencies are installed with `npm install`
- **API errors**: Verify your OpenAI API key is set correctly
- **Database errors**: Check Supabase connection and table setup
- **Styling issues**: Ensure Tailwind CSS is configured properly

For more help, open an issue on GitHub.

---

**Made with ❤️ for people who want to turn their life into an epic adventure!**