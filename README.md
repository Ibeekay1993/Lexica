# TweetForge Pro 🚀

**Automated Twitter Content Management Dashboard**

A modern, full-stack application for generating, scheduling, and posting tweets to Twitter/X automatically.

![Dashboard Preview](https://via.placeholder.com/800x400?placeholder=Dashboard+Preview)

## ✨ Features

### Core Features
- **🔐 Twitter OAuth Integration** - Securely connect your Twitter account
- **🤖 Auto-Generation** - Generate tweets automatically every hour
- **📅 Tweet Scheduling** - Schedule tweets for future posting
- **⚡ Instant Posting** - Post tweets directly from the dashboard
- **📊 Analytics Dashboard** - Track your tweet performance
- **📝 Content Queue** - Manage your tweet pipeline

### AI-Powered Content
- **Smart Tweet Generation** - AI-generated tweets based on categories
- **Style Selection** - Viral, Business, Opinion, Question, Thread formats
- **Category Tags** - Productivity, Technology, Motivation, Entrepreneurship
- **Character Counter** - Real-time 280-character limit tracking

### Modern UI/UX
- **Glass Morphism Design** - Modern frosted glass aesthetics
- **Animated Stats Cards** - Beautiful animated counters
- **Gradient Accents** - Blue-to-purple gradient theme
- **Responsive Layout** - Works on desktop and mobile
- **Dark Mode Ready** - Easy to switch themes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Twitter Developer Account
- Twitter API v2 credentials

### 1. Clone & Install

```bash
git clone <repository-url>
cd tweetforge-pro
npm install
```

### 2. Configure Twitter API

1. Go to [Twitter Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Create a new Project and App
3. Enable OAuth 2.0 in User Authentication Settings
4. Set Callback URL to: `http://localhost:3001/auth/callback`
5. Copy your Client ID and Client Secret

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Twitter API Credentials
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
TWITTER_CALLBACK_URL=http://localhost:3001/auth/callback

# Server Port
PORT=3001
```

For frontend, create `.env` in the root:

```env
VITE_API_URL=http://localhost:3001
```

### 4. Run the Application

**Development Mode (Both Frontend & Backend):**
```bash
npm start
```

**Or run separately:**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

**Production Build:**
```bash
npm run build
npm run server
```

### 5. Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Project Structure

```
tweetforge-pro/
├── server.js              # Express backend with Twitter OAuth
├── src/
│   ├── App.tsx           # Main React application
│   ├── lib/
│   │   └── api.ts        # API client functions
│   └── sections/         # React components
│       ├── Header.tsx
│       ├── StatsCards.tsx
│       ├── NavigationTabs.tsx
│       ├── AutoGenerationPanel.tsx
│       ├── TweetGenerator.tsx
│       ├── ContentQueue.tsx
│       ├── QuoteTweetPlanner.tsx
│       ├── TwitterConnect.tsx
│       └── ScheduledTweets.tsx
├── dist/                 # Production build
├── .env                  # Environment variables
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `GET /auth/twitter` - Initiate OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `GET /auth/status` - Check auth status
- `POST /auth/disconnect` - Disconnect account

### Tweets
- `POST /api/tweet` - Post a tweet immediately
- `POST /api/schedule` - Schedule a tweet
- `GET /api/scheduled` - Get scheduled tweets
- `DELETE /api/scheduled/:id` - Cancel scheduled tweet

### Profile
- `GET /api/profile` - Get user profile
- `GET /api/timeline` - Get recent tweets

## 🎯 Usage Guide

### Connecting Your Twitter Account

1. Click **"Connect with X"** button
2. Authorize the app on Twitter
3. Your profile will appear in the dashboard

### Generating Tweets

1. Select a **Style** (Viral/Business) and **Category**
2. Click **"Generate"** for AI-powered content
3. Or write your own tweet in the text area
4. Click **"Post Now"** or **"Schedule"**

### Scheduling Tweets

1. Write or generate your tweet
2. Click **"Schedule"** button
3. Select date and time
4. Click **"Confirm Schedule"**

### Auto-Generation

1. Toggle **"Hourly Auto-Generate"** in the Auto-Generation panel
2. The system will generate tweets automatically
3. Review and approve before posting

## 📊 Twitter API Limits (Free Tier)

As of 2025, the Twitter API free tier includes:
- **500 tweets per month** (posting)
- **100 read requests per month**
- **OAuth 2.0 authentication**

For higher limits, consider upgrading to:
- **Basic Tier**: $100/month - 3,000 tweets/month
- **Pro Tier**: $5,000/month - 100,000 tweets/month

## 🔒 Security

- OAuth 2.0 with PKCE for secure authentication
- Access tokens stored in memory (not localStorage in production)
- CORS enabled for cross-origin requests
- Environment variables for sensitive credentials

## 🛠️ Tech Stack

### Frontend
- React 19 + TypeScript
- Tailwind CSS 3.4
- shadcn/ui components
- Lucide React icons

### Backend
- Express.js 5
- twitter-api-v2 SDK
- node-cron for scheduling
- CORS for cross-origin

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TWITTER_CLIENT_ID` | Twitter OAuth Client ID | Yes |
| `TWITTER_CLIENT_SECRET` | Twitter OAuth Client Secret | Yes |
| `TWITTER_CALLBACK_URL` | OAuth callback URL | Yes |
| `PORT` | Server port | No (default: 3001) |
| `VITE_API_URL` | Backend API URL | No (default: http://localhost:3001) |

## 🐛 Troubleshooting

### "Failed to initiate Twitter connection"
- Check your Twitter API credentials in `.env`
- Ensure Callback URL matches exactly in Twitter Developer Portal

### "Rate limit exceeded"
- Twitter free tier has strict limits
- Wait for the rate limit to reset (usually 15-24 hours)

### "Cannot post tweet"
- Ensure your Twitter app has "Read and Write" permissions
- Regenerate access tokens after changing permissions

## 📄 License

MIT License - feel free to use and modify!

## 🙏 Credits

Built with:
- [Twitter API v2](https://developer.x.com/en/docs/twitter-api)
- [twitter-api-v2](https://github.com/plhery/node-twitter-api-v2)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ⚡ by TweetForge Pro**
