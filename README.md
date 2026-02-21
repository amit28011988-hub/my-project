# ThreadGenius 🚀

An AI-powered social media thread generator with viral templates, image library, and automation features for content creators.

![ThreadGenius](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Thread Writer
- AI-powered thread generation on any topic
- Customizable Writing DNA (Tone, Voice, Audience, Custom Instructions)
- One-click copy for LinkedIn, Twitter/X
- Thread history with search

### 📚 Template Library
- 40+ viral thread templates
- High engagement scores (86%-97%)
- Categories: Business, Productivity, Leadership, Finance, Career, Marketing, Mindset
- One-click refresh for new templates

### 🖼️ Viral Image Library
- 72+ viral quote cards with black background & white text
- Auto-refresh for random image generation
- One-click download as 1080x1080 PNG
- Categories with engagement scores

### 🤖 Automation Center
- Facebook Page integration
- Quick post for immediate publishing
- Scheduled automations with custom frequencies
- Multi-platform support (Facebook, Twitter/X, LinkedIn)

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🔧 Environment Setup

For Facebook automation, you'll need:

1. **Facebook Page ID** - Found in your Page settings
2. **Page Access Token** - Generated from [Facebook Developer Console](https://developers.facebook.com/)
   - Required permission: `pages_manage_posts`

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main application component
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── api/
│       └── facebook/
│           └── post/
│               └── route.ts  # Facebook API endpoint
├── components/
│   └── ui/                # UI components
└── lib/                   # Utility functions
```

## 🎨 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State**: React hooks with localStorage persistence

## 📦 Key Components

| Component | Description |
|-----------|-------------|
| Thread Writer | AI-powered content generation |
| Templates | Viral thread templates library |
| Images | Quote card generator with downloads |
| Automation | Scheduled posting system |

## 🔐 Facebook Integration

1. Go to **Automation** tab
2. Enter your Facebook Page ID
3. Enter your Page Access Token
4. Click **Connect Facebook**
5. Use Quick Post or create schedules

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/threadgenius)

1. Push code to GitHub
2. Import project to Vercel
3. Deploy automatically

### Deploy to GitHub Pages

```bash
# Build the project
bun run build

# Export as static site
bun run export
```

## 📝 License

MIT License - Feel free to use for personal or commercial projects.

---

Built with ❤️ for content creators who want to go viral.
