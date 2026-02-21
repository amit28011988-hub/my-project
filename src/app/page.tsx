'use client'

import { useState, useEffect, useCallback } from 'react'

// Types
type View = 'landing' | 'login' | 'signup' | 'dashboard'
type DashboardTab = 'writer' | 'templates' | 'images' | 'history' | 'automation'

interface User {
  firstName: string
  lastName: string
  email: string
}

interface Thread {
  id: number
  topic: string
  content: string
  createdAt: string
}

interface AutomationSchedule {
  id: number
  name: string
  topic: string
  frequency: 'daily' | 'twice-daily' | 'weekly' | 'custom'
  customTimes: string[] // Array of times in "HH:MM" format
  nextRun: string
  isActive: boolean
  postToFacebook: boolean
  postToTwitter: boolean
  postToLinkedin: boolean
  createdAt: string
}

interface FacebookConfig {
  pageId: string
  accessToken: string
  isConnected: boolean
}

interface Template {
  id: number
  title: string
  category: string
  engagementScore: number
  content: string[]
}

// Large pool of viral templates for randomization
const allTemplates: Omit<Template, 'id'>[] = [
  // Business Templates
  { title: "Business Growth Secrets", category: "Business", engagementScore: 94, content: ["The #1 mistake entrepreneurs make:", "They focus on product before audience.", "Build your audience first.", "Then sell them what they want."] },
  { title: "Startup Wisdom", category: "Business", engagementScore: 92, content: ["Your startup doesn't need:", "• A fancy office", "• More features", "• More funding", "It needs more customers."] },
  { title: "Business Success Formula", category: "Business", engagementScore: 91, content: ["The 3 things that will 10x your business:", "1. Solve a real problem", "2. Charge what you're worth", "3. Deliver more than expected", "Most businesses fail at all three."] },
  { title: "Entrepreneur Mindset", category: "Business", engagementScore: 89, content: ["Stop asking: 'How do I make money?'", "Start asking: 'How do I create value?'", "Money follows value.", "Always has. Always will."] },
  { title: "Business Lessons", category: "Business", engagementScore: 93, content: ["5 hard truths about building a business:", "1. It will take longer than you think", "2. It will cost more than you planned", "3. You will doubt yourself daily", "4. Most people won't understand", "5. It will be worth it"] },
  { title: "Scale Your Business", category: "Business", engagementScore: 88, content: ["To scale your business, you need to:", "• Document every process", "• Hire people smarter than you", "• Let go of control", "• Focus on strategy, not tactics"] },
  { title: "Revenue Secrets", category: "Business", engagementScore: 90, content: ["Want to double your revenue?", "Double your prices.", "Most entrepreneurs are undercharging.", "Your expertise is worth more than you think."] },
  { title: "Business Growth", category: "Business", engagementScore: 87, content: ["The fastest way to grow:", "Find someone who has what you want.", "Do what they did.", "Get what they got.", "It's that simple."] },

  // Productivity Templates
  { title: "Productivity Hacks", category: "Productivity", engagementScore: 91, content: ["5 things I stopped doing to become more productive:", "1. Checking email first thing", "2. Saying yes to everything", "3. Multitasking", "4. Working without breaks", "5. Comparing myself to others"] },
  { title: "Morning Routine", category: "Productivity", engagementScore: 94, content: ["My 5am routine that changed everything:", "• 5:00 - Wake up, no phone", "• 5:15 - Exercise", "• 6:00 - Cold shower", "• 6:30 - Read/learn", "• 7:30 - Deep work begins"] },
  { title: "Time Management", category: "Productivity", engagementScore: 89, content: ["You don't have a time problem.", "You have a priority problem.", "Track your time for 3 days.", "You'll see where it's really going."] },
  { title: "Focus Formula", category: "Productivity", engagementScore: 92, content: ["How to get 4 hours of deep work done daily:", "1. Block time on your calendar", "2. Phone in another room", "3. Close all tabs", "4. One task only", "5. Timer for 90 minutes"] },
  { title: "Productivity Truth", category: "Productivity", engagementScore: 88, content: ["Busy ≠ Productive", "You can be busy all day and accomplish nothing.", "Or you can work 4 hours and change your life.", "It's not about time. It's about focus."] },
  { title: "Kill Distractions", category: "Productivity", engagementScore: 90, content: ["The 4 productivity killers:", "1. Notifications on your phone", "2. Open office plans", "3. Meetings without agendas", "4. 'Quick' social media checks", "Eliminate these. Watch your output soar."] },
  { title: "Energy Management", category: "Productivity", engagementScore: 86, content: ["Manage energy, not time:", "• Sleep 7-8 hours", "• Exercise daily", "• Eat real food", "• Take breaks", "Your best work requires your best energy."] },
  { title: "Deep Work", category: "Productivity", engagementScore: 93, content: ["Deep work is your superpower.", "Most people never experience it.", "They're too busy being busy.", "Schedule 2 hours of uninterrupted work.", "See what happens."] },

  // Leadership Templates
  { title: "Leadership Lessons", category: "Leadership", engagementScore: 89, content: ["The best leaders I know share one trait:", "They listen more than they speak.", "They ask questions instead of giving answers.", "They empower instead of control."] },
  { title: "Leadership Truths", category: "Leadership", engagementScore: 91, content: ["If you're the smartest person in the room:", "You're in the wrong room.", "Great leaders build teams smarter than themselves.", "Average leaders hire people they can control."] },
  { title: "Manager vs Leader", category: "Leadership", engagementScore: 88, content: ["Managers tell people what to do.", "Leaders show them what's possible.", "Managers create followers.", "Leaders create more leaders."] },
  { title: "Leadership Failures", category: "Leadership", engagementScore: 87, content: ["5 ways leaders destroy teams:", "1. Micromanaging", "2. Taking credit", "3. Playing favorites", "4. Avoiding hard conversations", "5. Not giving feedback"] },
  { title: "Team Building", category: "Leadership", engagementScore: 90, content: ["Build a team that:", "• Challenges your ideas", "• Complements your weaknesses", "• Shares your values", "• Disagrees respectfully", "This is how you win."] },
  { title: "Leadership Mindset", category: "Leadership", engagementScore: 92, content: ["Leadership is not a title.", "It's not a position.", "It's not authority.", "Leadership is influence.", "Nothing more. Nothing less."] },

  // Finance Templates
  { title: "Money Mindset", category: "Finance", engagementScore: 88, content: ["Rich people buy assets.", "Poor people buy liabilities.", "The middle class buys liabilities thinking they're assets.", "Your mindset determines your net worth."] },
  { title: "Wealth Building", category: "Finance", engagementScore: 93, content: ["The wealth formula is simple:", "1. Spend less than you earn", "2. Invest the difference", "3. Be patient", "4. Repeat for 20 years", "Simple ≠ Easy"] },
  { title: "Financial Freedom", category: "Finance", engagementScore: 91, content: ["Your path to financial freedom:", "• 3-6 months emergency fund", "• Max out retirement accounts", "• Invest in index funds", "• Create multiple income streams", "• Live below your means"] },
  { title: "Money Mistakes", category: "Finance", engagementScore: 89, content: ["5 money mistakes keeping you broke:", "1. Lifestyle inflation", "2. High-interest debt", "3. No emergency fund", "4. Not investing", "5. Trying to time the market"] },
  { title: "Income vs Wealth", category: "Finance", engagementScore: 90, content: ["High income ≠ Wealthy", "I know millionaires who are broke.", "I know $50k earners who are wealthy.", "It's not what you make.", "It's what you keep."] },
  { title: "Investment Truth", category: "Finance", engagementScore: 92, content: ["The best investment you'll ever make:", "Not stocks. Not crypto. Not real estate.", "Invest in yourself.", "Learn high-value skills.", "The returns are unlimited."] },

  // Career Templates
  { title: "Career Advice", category: "Career", engagementScore: 86, content: ["Your network is your net worth.", "But here's what nobody tells you:", "Your network is only as valuable as what you can offer it.", "Give before you take."] },
  { title: "Career Growth", category: "Career", engagementScore: 89, content: ["How to fast-track your career:", "1. Solve expensive problems", "2. Make your boss look good", "3. Document your wins", "4. Ask for what you want", "5. Leave on good terms"] },
  { title: "Career Truths", category: "Career", engagementScore: 91, content: ["Uncomfortable career truth:", "You are not your job title.", "You are the problems you solve.", "The more expensive the problem,", "The more you get paid."] },
  { title: "Job Search Secrets", category: "Career", engagementScore: 88, content: ["Stop applying to jobs online.", "You're competing with 500 people.", "Instead:", "• Build relationships", "• Create content", "• Add value first", "Get referred. Skip the line."] },
  { title: "Salary Negotiation", category: "Career", engagementScore: 90, content: ["Salary negotiation rule #1:", "Never give a number first.", "Let them make the offer.", "Then pause. Count to 5.", "They'll often increase it."] },

  // Marketing Templates
  { title: "Marketing Secrets", category: "Marketing", engagementScore: 92, content: ["The best marketing doesn't feel like marketing:", "• Tell stories, not pitches", "• Solve problems, don't sell products", "• Build trust, not campaigns", "• Create value first"] },
  { title: "Content Strategy", category: "Marketing", engagementScore: 91, content: ["Your content should do one of three things:", "1. Educate - Teach something valuable", "2. Entertain - Make them feel something", "3. Inspire - Show what's possible", "Pick one. Master it."] },
  { title: "Audience Building", category: "Marketing", engagementScore: 94, content: ["Build an audience in 90 days:", "• Pick one platform", "• Post every day", "• Engage for 30 min daily", "• Study what works", "• Double down on winners"] },
  { title: "Copywriting Tips", category: "Marketing", engagementScore: 89, content: ["Write headlines that stop the scroll:", "• Use numbers (5 ways to...)", "• Ask questions (Are you making this mistake?)", "• Make promises (How I 10x'd my revenue)", "• Create curiosity (The one thing that changed everything)"] },

  // Mindset Templates
  { title: "Mindset Shift", category: "Mindset", engagementScore: 95, content: ["Your life changes when you realize:", "• You're not stuck", "• You're not unlucky", "• You're not too old/young", "You're just making excuses.", "The moment you stop, everything changes."] },
  { title: "Success Mindset", category: "Mindset", engagementScore: 93, content: ["Successful people think differently:", "They see problems as opportunities.", "They see failure as feedback.", "They see obstacles as challenges.", "They see criticism as data."] },
  { title: "Limiting Beliefs", category: "Mindset", engagementScore: 91, content: ["Your limiting beliefs are lies:", "'I'm not ready' → You'll never be ready", "'I don't have time' → You don't make it a priority", "'I'm not good enough' → You're comparing your beginning to others' middle"] },
  { title: "Growth Mindset", category: "Mindset", engagementScore: 90, content: ["Fixed mindset: 'I can't do this'", "Growth mindset: 'I can't do this... yet'", "One word. Massive difference.", "Which one are you choosing?"] },
]

// Viral Image Types
type ImageStyle = 'black-bg' | 'white-bg' | 'gradient' | 'quote-card'

interface ViralImage {
  id: number
  quote: string
  author?: string
  category: string
  engagementScore: number
  style: ImageStyle
  accentColor?: string
}

// Large pool of viral quotes for randomization
const allViralQuotes: Omit<ViralImage, 'id'>[] = [
  // Productivity
  { quote: "YOU WANNA WIN IN LIFE? FALL IN LOVE WITH LOSING, BECAUSE MOST PEOPLE ARE SCARED OF IT.", category: "Productivity", engagementScore: 94, style: 'black-bg' },
  { quote: "IF YOU'RE NOT WILLING TO DOWNGRADE YOUR LIFESTYLE FOR A YEAR TO HAVE THE LIFESTYLE YOU WANT FOREVER, YOU CARE TOO MUCH WHAT OTHERS THINK.", category: "Productivity", engagementScore: 92, style: 'black-bg' },
  { quote: "Stop wasting time on things that don't move the needle. Focus on what actually matters.", category: "Productivity", engagementScore: 91, style: 'black-bg' },
  { quote: "The most successful people do the hardest things first. The least successful do the easiest things first.", category: "Productivity", engagementScore: 89, style: 'black-bg' },
  { quote: "Your habits will determine your future. Choose them wisely.", category: "Productivity", engagementScore: 88, style: 'black-bg' },
  { quote: "Work while they sleep. Learn while they party. Save while they spend. Live like they dream.", category: "Productivity", engagementScore: 96, style: 'black-bg' },
  { quote: "Discipline is choosing between what you want NOW and what you want MOST.", category: "Productivity", engagementScore: 95, style: 'black-bg' },
  { quote: "The pain of discipline weighs ounces, but the pain of regret weighs tons.", category: "Productivity", engagementScore: 93, style: 'black-bg' },

  // Business
  { quote: "Your network is your net worth. But your network is only as valuable as what you can offer it.", category: "Business", engagementScore: 89, style: 'black-bg' },
  { quote: "At 17, you think you have all the time. At 80, you realize time was all you had.", category: "Business", engagementScore: 97, style: 'black-bg' },
  { quote: "Build your audience first. Then sell them what they want.", category: "Business", engagementScore: 92, style: 'black-bg' },
  { quote: "The goal isn't more money. The goal is living life on your own terms.", category: "Business", engagementScore: 91, style: 'black-bg' },
  { quote: "Most people spend more time planning their vacation than planning their life. Don't be most people.", category: "Business", engagementScore: 94, style: 'black-bg' },
  { quote: "Business is simple. People complicate it.", category: "Business", engagementScore: 88, style: 'black-bg' },
  { quote: "Your income is directly related to your philosophy, NOT the economy.", category: "Business", engagementScore: 90, style: 'black-bg' },
  { quote: "Stop waiting for the right time. It will never come. Start now.", category: "Business", engagementScore: 93, style: 'black-bg' },

  // Finance
  { quote: "Some people are waiting to see you fail. Some are waiting to see you quit. Let them wait forever.", category: "Finance", engagementScore: 93, style: 'black-bg' },
  { quote: "Rich people buy assets. Poor people buy liabilities. The middle class buys liabilities thinking they're assets.", category: "Finance", engagementScore: 93, style: 'black-bg' },
  { quote: "YOUR MINDSET DETERMINES YOUR NET WORTH.", category: "Finance", engagementScore: 90, style: 'black-bg' },
  { quote: "Money is a terrible master but an excellent servant.", category: "Finance", engagementScore: 91, style: 'black-bg' },
  { quote: "The best investment you can make is in yourself. The returns are unlimited.", category: "Finance", engagementScore: 95, style: 'black-bg' },
  { quote: "Wealth is what you don't see. The cars, the houses, the lifestyle - that's spending, not wealth.", category: "Finance", engagementScore: 89, style: 'black-bg' },
  { quote: "Financial freedom is not a number. It's a mindset.", category: "Finance", engagementScore: 92, style: 'black-bg' },
  { quote: "Don't work for money. Make it work for you.", category: "Finance", engagementScore: 88, style: 'black-bg' },

  // Marketing
  { quote: "Consistency is harder when no one is clapping for you. You must clap for yourself.", category: "Marketing", engagementScore: 96, style: 'black-bg' },
  { quote: "CONTINUOUS IMPROVEMENT IS BETTER THAN DELAYED PERFECTION.", author: "Mark Twain", category: "Marketing", engagementScore: 91, style: 'black-bg' },
  { quote: "Marketing is no longer about the stuff you make, but about the stories you tell.", category: "Marketing", engagementScore: 92, style: 'black-bg' },
  { quote: "People don't buy what you do. They buy why you do it.", category: "Marketing", engagementScore: 94, style: 'black-bg' },
  { quote: "The best marketing doesn't feel like marketing.", category: "Marketing", engagementScore: 90, style: 'black-bg' },
  { quote: "Your brand is what people say about you when you're not in the room.", category: "Marketing", engagementScore: 93, style: 'black-bg' },
  { quote: "Content is fire. Social media is gasoline.", category: "Marketing", engagementScore: 91, style: 'black-bg' },
  { quote: "Stop selling. Start helping.", category: "Marketing", engagementScore: 89, style: 'black-bg' },

  // Social Media
  { quote: "Supporting another person's success will never hurt yours. Your real friends want to see you win.", category: "Social Media", engagementScore: 95, style: 'black-bg' },
  { quote: "IF YOU'RE NOT FOLLOWING YOUR OBSESSION, YOU'RE FOLLOWING SOMEONE ELSE'S.", category: "Social Media", engagementScore: 86, style: 'black-bg' },
  { quote: "Be yourself. Everyone else is already taken.", category: "Social Media", engagementScore: 92, style: 'black-bg' },
  { quote: "What you post online represents who you are. Make it count.", category: "Social Media", engagementScore: 88, style: 'black-bg' },
  { quote: "Your feed is your mindset. Curate it carefully.", category: "Social Media", engagementScore: 90, style: 'black-bg' },
  { quote: "Don't chase followers. Chase value. The followers will come.", category: "Social Media", engagementScore: 94, style: 'black-bg' },
  { quote: "The algorithm rewards consistency, not perfection.", category: "Social Media", engagementScore: 91, style: 'black-bg' },
  { quote: "Create content that you would want to consume.", category: "Social Media", engagementScore: 89, style: 'black-bg' },

  // Education
  { quote: "Don't give up. The beginning is always the hardest.", category: "Education", engagementScore: 99, style: 'black-bg' },
  { quote: "The more you learn, the more you earn.", category: "Education", engagementScore: 92, style: 'black-bg' },
  { quote: "Invest in knowledge. It pays the best interest.", category: "Education", engagementScore: 90, style: 'black-bg' },
  { quote: "Education is not preparation for life. Education is life itself.", category: "Education", engagementScore: 88, style: 'black-bg' },
  { quote: "The only way to do great work is to love what you learn.", category: "Education", engagementScore: 93, style: 'black-bg' },
  { quote: "Learn from yesterday, live for today, hope for tomorrow.", category: "Education", engagementScore: 91, style: 'black-bg' },
  { quote: "Knowledge speaks. Wisdom listens.", category: "Education", engagementScore: 95, style: 'black-bg' },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", category: "Education", engagementScore: 94, style: 'black-bg' },

  // Leadership
  { quote: "The best leaders listen more than they speak. They ask questions instead of giving answers.", category: "Leadership", engagementScore: 88, style: 'black-bg' },
  { quote: "A leader knows the way, goes the way, and shows the way.", category: "Leadership", engagementScore: 91, style: 'black-bg' },
  { quote: "Leadership is not about being in charge. It's about taking care of those in your charge.", category: "Leadership", engagementScore: 95, style: 'black-bg' },
  { quote: "The greatest leader is not the one who does the greatest things, but the one who gets people to do the greatest things.", category: "Leadership", engagementScore: 89, style: 'black-bg' },
  { quote: "Lead by example, not by command.", category: "Leadership", engagementScore: 93, style: 'black-bg' },
  { quote: "A good leader takes a little more than their share of the blame, and a little less than their share of the credit.", category: "Leadership", engagementScore: 90, style: 'black-bg' },
  { quote: "Leadership is the capacity to translate vision into reality.", category: "Leadership", engagementScore: 92, style: 'black-bg' },
  { quote: "You don't lead by hitting people over the head. That's assault, not leadership.", category: "Leadership", engagementScore: 87, style: 'black-bg' },

  // Stoicism
  { quote: "It's not what happens to you, but how you react to it that matters.", category: "Stoicism", engagementScore: 94, style: 'black-bg' },
  { quote: "The obstacle is the way.", category: "Stoicism", engagementScore: 96, style: 'black-bg' },
  { quote: "You have power over your mind, not outside events. Realize this, and you will find strength.", category: "Stoicism", engagementScore: 93, style: 'black-bg' },
  { quote: "Waste no more time arguing about what a good man should be. Be one.", category: "Stoicism", engagementScore: 91, style: 'black-bg' },
  { quote: "No man is free who is not master of himself.", category: "Stoicism", engagementScore: 90, style: 'black-bg' },
  { quote: "The happiness of your life depends upon the quality of your thoughts.", category: "Stoicism", engagementScore: 95, style: 'black-bg' },
  { quote: "Difficulties strengthen the mind, as labor does the body.", category: "Stoicism", engagementScore: 89, style: 'black-bg' },
  { quote: "He who fears death will never do anything worth of a man who is alive.", category: "Stoicism", engagementScore: 88, style: 'black-bg' },
]

const categoryOptions = [
  "AI Productivity Tools",
  "Social Media Automation",
  "Email Marketing",
  "Remote Work Tips",
  "Content Creation",
  "Marketing Trends",
  "Leadership Skills",
  "Time Management",
  "Financial Freedom",
  "Stoicism",
]

// ThreadGenius Logo SVG Component
function ThreadGeniusLogo({ className = '', white = false }: { className?: string; white?: boolean }) {
  const color = white ? 'white' : 'currentColor'
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Connected nodes representing threads */}
      <circle cx="6" cy="10" r="4" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="26" cy="10" r="4" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="6" cy="26" r="4" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="26" cy="26" r="4" stroke={color} strokeWidth="2" fill="none" />
      
      {/* Connecting lines */}
      <path d="M10 10 L22 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M6 14 L6 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M26 14 L26 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 26 L22 26" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* Genius spark/star in center */}
      <path d="M16 4 L17.5 11 L24 10 L18 14 L22 20 L16 16 L10 20 L14 14 L8 10 L14.5 11 Z" fill={color} />
    </svg>
  )
}

// Eye Icons
function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// Icons
function PencilIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('landing')
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('writer')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false })
  const [signupForm, setSignupForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false, marketing: false })

  // Thread Writer State
  const [threadTopic, setThreadTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentThread, setCurrentThread] = useState<string | null>(null)
  const [threadHistory, setThreadHistory] = useState<Thread[]>([])
  const [copiedType, setCopiedType] = useState<string | null>(null)

  // Writing DNA State
  const [writingDNAExpanded, setWritingDNAExpanded] = useState(false)
  const [tone, setTone] = useState('No preference')
  const [voice, setVoice] = useState('No preference')
  const [targetAudience, setTargetAudience] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')

  // Advanced Options State
  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Search for history
  const [searchQuery, setSearchQuery] = useState('')

  // Images Tab State
  const [displayedImages, setDisplayedImages] = useState<ViralImage[]>([])
  const [isRefreshingImages, setIsRefreshingImages] = useState(false)

  // Generate random images from the pool
  const generateRandomImages = useCallback((count: number = 12): ViralImage[] => {
    const shuffled = [...allViralQuotes].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map((quote, index) => ({
      ...quote,
      id: Date.now() + index,
    }))
  }, [])

  // Initialize displayed images on first load
  useEffect(() => {
    if (displayedImages.length === 0) {
      queueMicrotask(() => {
        setDisplayedImages(generateRandomImages(12))
      })
    }
  }, [displayedImages.length, generateRandomImages])

  // Handle refresh images
  const handleRefreshImages = useCallback(() => {
    setIsRefreshingImages(true)
    // Small delay for visual feedback
    setTimeout(() => {
      setDisplayedImages(generateRandomImages(12))
      setIsRefreshingImages(false)
    }, 500)
  }, [generateRandomImages])

  // Templates Tab State
  const [displayedTemplates, setDisplayedTemplates] = useState<Template[]>([])
  const [isRefreshingTemplates, setIsRefreshingTemplates] = useState(false)

  // Generate random templates from the pool
  const generateRandomTemplates = useCallback((count: number = 6): Template[] => {
    const shuffled = [...allTemplates].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map((template, index) => ({
      ...template,
      id: Date.now() + index,
    }))
  }, [])

  // Initialize displayed templates on first load
  useEffect(() => {
    if (displayedTemplates.length === 0) {
      queueMicrotask(() => {
        setDisplayedTemplates(generateRandomTemplates(6))
      })
    }
  }, [displayedTemplates.length, generateRandomTemplates])

  // Handle refresh templates
  const handleRefreshTemplates = useCallback(() => {
    setIsRefreshingTemplates(true)
    setTimeout(() => {
      setDisplayedTemplates(generateRandomTemplates(6))
      setIsRefreshingTemplates(false)
    }, 500)
  }, [generateRandomTemplates])

  // Automation State
  const [schedules, setSchedules] = useState<AutomationSchedule[]>([])
  const [facebookConfig, setFacebookConfig] = useState<FacebookConfig>({
    pageId: '',
    accessToken: '',
    isConnected: false
  })
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<AutomationSchedule | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    topic: '',
    frequency: 'daily' as const,
    customTimes: ['09:00'],
    postToFacebook: true,
    postToTwitter: false,
    postToLinkedin: false,
  })
  const [isPostingNow, setIsPostingNow] = useState(false)

  // Load automation data from localStorage
  useEffect(() => {
    const savedSchedules = localStorage.getItem('threadgenius_schedules')
    if (savedSchedules) {
      queueMicrotask(() => {
        setSchedules(JSON.parse(savedSchedules))
      })
    }
    const savedFbConfig = localStorage.getItem('threadgenius_facebook')
    if (savedFbConfig) {
      queueMicrotask(() => {
        setFacebookConfig(JSON.parse(savedFbConfig))
      })
    }
  }, [])

  // Save schedules to localStorage
  const saveSchedules = useCallback((newSchedules: AutomationSchedule[]) => {
    setSchedules(newSchedules)
    localStorage.setItem('threadgenius_schedules', JSON.stringify(newSchedules))
  }, [])

  // Save Facebook config to localStorage
  const saveFacebookConfig = useCallback((config: FacebookConfig) => {
    setFacebookConfig(config)
    localStorage.setItem('threadgenius_facebook', JSON.stringify(config))
  }, [])

  // Create new schedule
  const createSchedule = useCallback(() => {
    const now = new Date()
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow

    const newSchedule: AutomationSchedule = {
      id: Date.now(),
      name: scheduleForm.name,
      topic: scheduleForm.topic,
      frequency: scheduleForm.frequency,
      customTimes: scheduleForm.customTimes,
      nextRun,
      isActive: true,
      postToFacebook: scheduleForm.postToFacebook,
      postToTwitter: scheduleForm.postToTwitter,
      postToLinkedin: scheduleForm.postToLinkedin,
      createdAt: now.toISOString(),
    }

    saveSchedules([newSchedule, ...schedules])
    setShowScheduleModal(false)
    setScheduleForm({
      name: '',
      topic: '',
      frequency: 'daily',
      customTimes: ['09:00'],
      postToFacebook: true,
      postToTwitter: false,
      postToLinkedin: false,
    })
  }, [scheduleForm, schedules, saveSchedules])

  // Delete schedule
  const deleteSchedule = useCallback((id: number) => {
    saveSchedules(schedules.filter(s => s.id !== id))
  }, [schedules, saveSchedules])

  // Toggle schedule active status
  const toggleSchedule = useCallback((id: number) => {
    saveSchedules(schedules.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))
  }, [schedules, saveSchedules])

  // Connect Facebook
  const connectFacebook = useCallback(() => {
    if (!facebookConfig.pageId || !facebookConfig.accessToken) {
      alert('Please enter both Page ID and Access Token')
      return
    }
    const newConfig = { ...facebookConfig, isConnected: true }
    saveFacebookConfig(newConfig)
    alert('Facebook connected successfully!')
  }, [facebookConfig, saveFacebookConfig])

  // Disconnect Facebook
  const disconnectFacebook = useCallback(() => {
    saveFacebookConfig({ pageId: '', accessToken: '', isConnected: false })
  }, [saveFacebookConfig])

  // Post immediately to Facebook
  const postNowToFacebook = useCallback(async (content: string) => {
    if (!facebookConfig.isConnected) {
      alert('Please connect your Facebook account first')
      return
    }

    setIsPostingNow(true)
    try {
      const response = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: facebookConfig.pageId,
          accessToken: facebookConfig.accessToken,
          message: content
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Posted successfully to Facebook!')
      } else {
        alert(`Failed to post: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to post to Facebook. Please check your connection.')
    }
    setIsPostingNow(false)
  }, [facebookConfig])

  // Initialize state from localStorage on client side
  const getInitialUser = (): User | null => {
    if (typeof window === 'undefined') return null
    const savedUser = localStorage.getItem('threadgenius_user')
    return savedUser ? JSON.parse(savedUser) : null
  }

  const getInitialView = (): View => {
    if (typeof window === 'undefined') return 'landing'
    const savedUser = localStorage.getItem('threadgenius_user')
    return savedUser ? 'dashboard' : 'landing'
  }

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('threadgenius_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setUser(parsedUser)
        setCurrentView('dashboard')
      })
    }
    // Load thread history
    const savedThreads = localStorage.getItem('threadgenius_threads')
    if (savedThreads) {
      queueMicrotask(() => {
        setThreadHistory(JSON.parse(savedThreads))
      })
    }
  }, [])

  // Handle Login
  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const newUser: User = {
      firstName: 'User',
      lastName: '',
      email: loginForm.email
    }
    setUser(newUser)
    localStorage.setItem('threadgenius_user', JSON.stringify(newUser))
    setCurrentView('dashboard')
  }, [loginForm.email])

  // Handle Signup
  const handleSignup = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (signupForm.password.length < 8) {
      alert('Password must be at least 8 characters!')
      return
    }
    const newUser: User = {
      firstName: signupForm.firstName,
      lastName: signupForm.lastName,
      email: signupForm.email
    }
    setUser(newUser)
    localStorage.setItem('threadgenius_user', JSON.stringify(newUser))
    setCurrentView('dashboard')
  }, [signupForm])

  // Handle Logout
  const handleLogout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('threadgenius_user')
    setCurrentView('landing')
    setLoginForm({ email: '', password: '', remember: false })
    setSignupForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false, marketing: false })
  }, [])

  // Word wrap helper
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const lines: string[] = []
    const paragraphs = text.split('\n')
    
    paragraphs.forEach(paragraph => {
      const words = paragraph.split(' ')
      let currentLine = ''
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      })
      if (currentLine) lines.push(currentLine)
    })
    
    return lines
  }

  // Download viral image
  const downloadImage = useCallback((image: ViralImage) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (square for social media)
    const size = 1080
    canvas.width = size
    canvas.height = size

    // Pure black background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, size, size)

    // Add subtle gradient overlay for depth
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.7)
    gradient.addColorStop(0, 'rgba(40, 40, 40, 0.3)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    // Text color
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'

    // Font size based on quote length - larger for viral impact
    const quoteLength = image.quote.length
    let fontSize = 52
    if (quoteLength > 180) fontSize = 36
    else if (quoteLength > 140) fontSize = 40
    else if (quoteLength > 100) fontSize = 46
    else if (quoteLength < 60) fontSize = 58

    // Draw quote text with better font
    ctx.font = `bold ${fontSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif`
    const maxWidth = size - 160
    const lines = wrapText(ctx, image.quote, maxWidth)
    
    const lineHeight = fontSize * 1.5
    const totalHeight = lines.length * lineHeight
    let startY = (size - totalHeight) / 2 + lineHeight / 2 - 30

    // Adjust for author
    if (image.author) {
      startY -= 35
    }

    // Draw text shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    lines.forEach((line, i) => {
      ctx.fillText(line, size / 2, startY + i * lineHeight)
    })

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Add author if present
    if (image.author) {
      ctx.font = 'italic 28px "Segoe UI", -apple-system, Arial, sans-serif'
      ctx.fillStyle = '#888888'
      ctx.fillText(`— ${image.author}`, size / 2, startY + lines.length * lineHeight + 45)
    }

    // Add category tag at bottom
    const tagY = size - 100
    ctx.font = 'bold 22px "Segoe UI", -apple-system, Arial, sans-serif'
    
    // Category colors
    const categoryColors: Record<string, string> = {
      'Productivity': '#3b82f6',
      'Marketing': '#22c55e',
      'Social Media': '#ec4899',
      'Finance': '#f97316',
      'Education': '#10b981',
      'Business': '#8b5cf6',
      'Leadership': '#06b6d4',
      'Stoicism': '#d97706',
    }
    
    const tagColor = categoryColors[image.category] || '#6b7280'
    const tagText = `${image.category.toUpperCase()} • ${image.engagementScore}%`
    const tagWidth = ctx.measureText(tagText).width + 50
    
    // Draw tag background
    ctx.fillStyle = tagColor
    const tagX = (size - tagWidth) / 2
    const tagHeight = 48
    ctx.beginPath()
    ctx.roundRect(tagX, tagY - tagHeight / 2, tagWidth, tagHeight, 24)
    ctx.fill()
    
    // Draw tag text
    ctx.fillStyle = '#ffffff'
    ctx.fillText(tagText, size / 2, tagY + 8)

    // Add subtle watermark
    ctx.font = '16px "Segoe UI", -apple-system, Arial, sans-serif'
    ctx.fillStyle = '#333333'
    ctx.fillText('ThreadGenius', size / 2, size - 35)

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileName = image.quote.slice(0, 30).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      a.download = `${fileName}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [])

  // Generate Thread
  const generateThread = useCallback(async () => {
    if (!threadTopic.trim()) return

    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const topic = threadTopic
    const threadContent = `Stop juggling ${topic.toLowerCase()}. This checklist will transform how you work:

1. Start with clarity
→ Define exactly what success looks like for your ${topic.toLowerCase()} goals

2. Use the right tools
→ Find tools that automate the tedious parts of ${topic.toLowerCase()}

3. Build systems
→ Create repeatable processes that work without you

4. Measure everything
→ Track your results and optimize based on data

5. Stay consistent
→ Small daily actions beat occasional big efforts

Save this thread for later 📌`

    setCurrentThread(threadContent)
    setIsGenerating(false)
  }, [threadTopic])

  // Save thread to history
  const saveThreadToHistory = useCallback(() => {
    if (!currentThread || !threadTopic) return

    const newThread: Thread = {
      id: Date.now(),
      topic: threadTopic,
      content: currentThread,
      createdAt: new Date().toISOString()
    }

    const updatedHistory = [newThread, ...threadHistory]
    setThreadHistory(updatedHistory)
    localStorage.setItem('threadgenius_threads', JSON.stringify(updatedHistory))
  }, [currentThread, threadTopic, threadHistory])

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }, [])

  // Clear current thread
  const clearThread = useCallback(() => {
    setCurrentThread(null)
    setThreadTopic('')
  }, [])

  // Copy for LinkedIn (adds line breaks)
  const copyForLinkedIn = useCallback(() => {
    if (!currentThread) return
    const linkedInFormat = currentThread.replace(/\n/g, '\n\n')
    copyToClipboard(linkedInFormat, 'linkedin')
  }, [currentThread, copyToClipboard])

  // Share on Twitter
  const shareOnTwitter = useCallback(() => {
    if (!currentThread) return
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentThread.slice(0, 280))}`
    window.open(twitterUrl, '_blank')
  }, [currentThread])

  // Delete thread from history
  const deleteThread = useCallback((id: number) => {
    const updatedHistory = threadHistory.filter(t => t.id !== id)
    setThreadHistory(updatedHistory)
    localStorage.setItem('threadgenius_threads', JSON.stringify(updatedHistory))
  }, [threadHistory])

  // Filter threads by search
  const filteredThreads = threadHistory.filter(t =>
    t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Header Component
  const renderHeader = (dark = false) => (
    <header className={`${dark ? 'bg-black border-[#333]' : 'bg-white border-gray-100'} border-b sticky top-0 z-50`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => user ? setCurrentView('dashboard') : setCurrentView('landing')}
          className={`flex items-center gap-2.5 text-xl font-semibold no-underline z-[51] ${dark ? 'text-white' : 'text-black'}`}
        >
          <ThreadGeniusLogo className="w-8 h-8" white={dark} />
          <span className="hidden sm:inline">ThreadGenius</span>
        </button>

        <button
          className="md:hidden bg-none border-none cursor-pointer p-2 ml-auto z-[52]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="flex flex-col gap-1">
            <span className={`block w-6 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'transform translate-y-[7px] rotate-45' : ''} ${dark ? 'bg-white' : 'bg-black'}`} />
            <span className={`block w-6 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''} ${dark ? 'bg-white' : 'bg-black'}`} />
            <span className={`block w-6 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'transform -translate-y-[7px] -rotate-45' : ''} ${dark ? 'bg-white' : 'bg-black'}`} />
          </div>
        </button>

        {user ? (
          <>
            <nav className="hidden md:flex gap-6 items-center flex-1 justify-center">
              {(['writer', 'templates', 'images', 'history', 'automation'] as DashboardTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDashboardTab(tab)}
                  className={`${dark ? 'text-gray-400 hover:text-white hover:bg-[#333]' : 'text-gray-600 hover:text-black hover:bg-gray-50'} no-underline font-medium py-2 px-3 rounded-lg transition-all text-sm whitespace-nowrap ${dashboardTab === tab ? (dark ? 'text-white bg-[#333]' : 'text-black bg-gray-100') : ''}`}
                >
                  {tab === 'writer' ? 'Thread Writer' : tab === 'templates' ? 'Templates' : tab === 'images' ? 'Images' : tab === 'history' ? 'History' : 'Automation'}
                </button>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <span className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Hi, {user.firstName}</span>
              <button
                onClick={handleLogout}
                className={`py-2 px-4 rounded-full font-medium text-sm cursor-pointer transition-all border ${dark ? 'bg-white text-black border-white hover:bg-transparent hover:text-white' : 'bg-black text-white border-black hover:bg-white hover:text-black'}`}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            {currentView !== 'landing' && (
              <button
                onClick={() => setCurrentView('landing')}
                className={`py-2 px-4 rounded-full font-medium text-sm cursor-pointer transition-all border ${dark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
              >
                Back to Home
              </button>
            )}
            <button
              onClick={() => setCurrentView('login')}
              className={`py-2 px-4 rounded-full font-medium text-sm cursor-pointer transition-all border ${dark ? 'border-[#333] text-white hover:border-white' : 'border-gray-200 text-black hover:border-black'}`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentView('signup')}
              className="py-2 px-4 bg-black text-white rounded-full font-medium text-sm cursor-pointer transition-all border border-black hover:bg-gray-800"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  )

  // Landing Page Content
  const renderLandingPage = () => (
    <div className="min-h-screen bg-white">
      {renderHeader()}

      {/* Hero Section */}
      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-[#1a1a1a] rounded-full text-sm mb-6">
            New • Multi-Platform Thread Writer
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Generate viral threads<br />in seconds
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            AI-powered generator, performance-scored templates, and a viral image library — ready to copy-paste across Facebook, LinkedIn, Twitter/X, and Threads.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setCurrentView('signup')}
              className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
            >
              Get Started →
            </button>
            <a href="#features" className="px-8 py-4 bg-transparent border border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-black transition-all">
              View Features
            </a>
          </div>
        </div>
      </section>

      {/* About Founder */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl aspect-square flex items-center justify-center">
              <div className="text-6xl">👨‍💼</div>
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-black text-white rounded-full text-sm mb-4">
                About the Founder
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built by a viral content creator to help anyone go viral on social media
              </h2>
              <p className="text-gray-600 mb-4">
                Hi, I&apos;m Austin Armstrong! I have over 4 million followers across social media, reach hundreds of millions of people monthly, and I&apos;ve made millions of dollars from social media marketing.
              </p>
              <p className="text-gray-600 mb-6">
                This tool was inspired by my recent virality on Facebook! Black background white text threads and business quote images have been dominating for me.
              </p>
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-bold">4M+</div>
                  <div className="text-gray-500">Followers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">100M+</div>
                  <div className="text-gray-500">Monthly Reach</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">$1M+</div>
                  <div className="text-gray-500">Social Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-black text-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Creators Choose ThreadGenius</h2>
            <p className="text-gray-400 text-lg">Streamlined from idea to publish across all major social platforms.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'AI-Powered Generator', desc: 'Creates viral social media threads using advanced AI.' },
              { icon: '📚', title: 'Template Library', desc: '15+ high-performing thread templates with engagement scores.' },
              { icon: '🖼️', title: 'Viral Image Library', desc: 'Collection of 100+ proven viral images and quotes.' },
              { icon: '🌐', title: 'Multi-Platform Support', desc: 'Works for Facebook, LinkedIn, Twitter/X, and Threads.' },
            ].map((feature, i) => (
              <div key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600 text-lg">One simple price. Secure checkout. Cancel anytime.</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-white border-2 border-black rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black text-white text-sm font-medium rounded-full">
                MOST POPULAR
              </div>
              <div className="text-center mb-6 pb-6 border-b">
                <h3 className="text-xl font-semibold mb-2">ThreadGenius Pro</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">$5.00</span>
                  <span className="text-gray-500">/ month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {['Unlimited AI thread generation', 'Access to all viral templates', 'Complete image library (100+ images)', 'Thread history and favorites', 'All platform connections', 'Cancel anytime — no commitments'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-black font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setCurrentView('signup')}
                className="w-full py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'What is ThreadGenius?', a: 'ThreadGenius helps you create viral social media threads using AI, proven templates, and a viral image library.' },
              { q: 'Can I reuse images across threads?', a: 'Yes, downloaded images can be used across all your threads and platforms.' },
              { q: 'What do I need to sign up?', a: 'Just your email address and a password (8+ characters).' },
              { q: 'Do you support direct posting?', a: 'Not yet - ThreadGenius focuses on content creation; native scheduling is on our roadmap.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl">
                <strong className="text-lg">{faq.q}</strong>
                <p className="text-gray-600 mt-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="bg-gray-50 p-8 md:p-12 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Get started</div>
              <h3 className="text-2xl font-bold mb-2">Write your next viral thread today</h3>
              <p className="text-gray-600">Start instantly — create your free account now.</p>
            </div>
            <button
              onClick={() => setCurrentView('signup')}
              className="px-8 py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-gray-400">© 2026 ThreadGenius</span>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Affiliates</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )

  // Login Page Content
  const renderLoginPage = () => (
    <div className="min-h-screen flex flex-col bg-black">
      {renderHeader(true)}
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="bg-[#1a1a1a] rounded-xl p-8 sm:p-12 w-full max-w-[440px] border border-[#333]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300 text-base">Sign in to continue to ThreadGenius</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 font-medium text-white text-sm">Email</label>
              <input
                type="email"
                id="email"
                className="w-full py-3 px-4 border border-[#333] rounded-lg text-base bg-black text-white placeholder:text-gray-500 focus:outline-none focus:border-white"
                placeholder="Enter your email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 font-medium text-white text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full py-3 px-4 pr-11 border border-[#333] rounded-lg text-base bg-black text-white placeholder:text-gray-500 focus:outline-none focus:border-white"
                  placeholder="Enter your password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={loginForm.remember}
                  onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                />
                Remember me
              </label>
              <a href="#" className="text-gray-300 text-sm hover:text-white">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full text-base font-semibold bg-white text-black border border-white hover:bg-gray-100 transition-all"
            >
              Sign In
            </button>

            <div className="text-center my-6 relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#333]" />
              <span className="bg-[#1a1a1a] px-4 relative text-gray-500 text-sm uppercase">or</span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('signup')}
              className="w-full py-3.5 px-6 rounded-full text-base font-semibold bg-transparent text-white border border-[#333] hover:border-white transition-all"
            >
              Create New Account
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-[#333]">
            <p className="text-gray-300 text-sm">
              Don&apos;t have an account?{' '}
              <button onClick={() => setCurrentView('signup')} className="text-white font-semibold hover:opacity-70">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )

  // Signup Page Content
  const renderSignupPage = () => (
    <div className="min-h-screen flex flex-col bg-white">
      {renderHeader()}
      <main className="flex-1 flex items-center justify-center px-5 py-16 bg-gray-50">
        <div className="bg-white rounded-xl p-8 sm:p-12 w-full max-w-[640px] border border-gray-200 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Create Your Account</h1>
            <p className="text-gray-600 text-base">Join ThreadGenius to start creating viral threads</p>
          </div>

          <form onSubmit={handleSignup}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="firstName" className="block mb-2 font-medium text-black text-sm">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full py-3 px-4 border border-gray-200 rounded-lg text-base bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                  placeholder="John"
                  required
                  value={signupForm.firstName}
                  onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block mb-2 font-medium text-black text-sm">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full py-3 px-4 border border-gray-200 rounded-lg text-base bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                  placeholder="Doe"
                  required
                  value={signupForm.lastName}
                  onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="signupEmail" className="block mb-2 font-medium text-black text-sm">Email</label>
              <input
                type="email"
                id="signupEmail"
                className="w-full py-3 px-4 border border-gray-200 rounded-lg text-base bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                placeholder="john@example.com"
                required
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="signupPassword" className="block mb-2 font-medium text-black text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signupPassword"
                  className="w-full py-3 px-4 pr-11 border border-gray-200 rounded-lg text-base bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                  placeholder="Create a strong password"
                  required
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">• At least 8 characters • Mix of letters and numbers</p>
            </div>

            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block mb-2 font-medium text-black text-sm">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="w-full py-3 px-4 pr-11 border border-gray-200 rounded-lg text-base bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                  placeholder="Confirm your password"
                  required
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 cursor-pointer"
                  required
                  checked={signupForm.terms}
                  onChange={(e) => setSignupForm({ ...signupForm, terms: e.target.checked })}
                />
                I agree to the <a href="#" className="text-black font-medium underline">Terms of Service</a> and <a href="#" className="text-black font-medium underline">Privacy Policy</a>
              </label>
              <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 cursor-pointer"
                  checked={signupForm.marketing}
                  onChange={(e) => setSignupForm({ ...signupForm, marketing: e.target.checked })}
                />
                I would like to receive marketing emails about new features and updates
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full text-base font-semibold bg-black text-white border border-black hover:bg-gray-800 transition-all"
            >
              Create Account
            </button>

            <div className="text-center my-6 relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
              <span className="bg-white px-4 relative text-gray-400 text-sm uppercase">or</span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="w-full py-3.5 px-6 rounded-full text-base font-semibold bg-white text-black border border-gray-200 hover:border-black transition-all"
            >
              Sign In to Existing Account
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button onClick={() => setCurrentView('login')} className="text-black font-semibold hover:opacity-70">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )

  // Dashboard Page Content
  const renderDashboardPage = () => (
    <div className="min-h-screen flex flex-col bg-white">
      {renderHeader()}

      <main className="flex-1 bg-gray-50">
        {/* Thread Writer Tab */}
        {dashboardTab === 'writer' && (
          <div className="max-w-[800px] mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">AI Thread Generator</h1>
              <p className="text-gray-600">Create viral social media content in seconds. Enter any topic and get a high-performing thread ready to post.</p>
            </div>

            {/* How to use */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">How to use this tool</h3>
              <p className="text-gray-600 text-sm">Simply type in any topic and our AI will create a thread on that topic using proven viral formats. Copy the text and paste it directly on Facebook, LinkedIn, Twitter/X, or Threads!</p>
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
                <strong>Pro tip:</strong> Post 5-10 of these per day in your niche for maximum engagement!
              </div>
            </div>

            {/* Topic Input */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
              <label className="block mb-2 font-medium flex items-center gap-2">
                <PencilIcon />
                Enter Your Topic
              </label>
              <input
                type="text"
                className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                placeholder="e.g., Social media automation, productivity tips, leadership advice..."
                value={threadTopic}
                onChange={(e) => setThreadTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateThread()}
              />
            </div>

            {/* Writing DNA */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
              <button
                onClick={() => setWritingDNAExpanded(!writingDNAExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium flex items-center gap-2">
                  <SettingsIcon />
                  Writing DNA
                </span>
                <ChevronDownIcon />
              </button>
              {writingDNAExpanded && (
                <div className="p-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">Writing DNA defines your persistent writing identity. These settings apply to every thread you generate.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tone</label>
                      <select
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                      >
                        <option>No preference</option>
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Humorous</option>
                        <option>Inspirational</option>
                        <option>Educational</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Voice / Perspective</label>
                      <select
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg"
                        value={voice}
                        onChange={(e) => setVoice(e.target.value)}
                      >
                        <option>No preference</option>
                        <option>First person</option>
                        <option>Second person</option>
                        <option>Third person</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Target Audience</label>
                    <input
                      type="text"
                      className="w-full py-2 px-3 border border-gray-200 rounded-lg"
                      placeholder="e.g., SaaS founders, marketing professionals, solo entrepreneurs..."
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Custom Writing Instructions</label>
                    <textarea
                      className="w-full py-2 px-3 border border-gray-200 rounded-lg min-h-[80px]"
                      placeholder="e.g., Never use emojis. Write like Paul Graham. Always include data points..."
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
              <button
                onClick={() => setAdvancedExpanded(!advancedExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium flex items-center gap-2">
                  <SettingsIcon />
                  Advanced Options
                </span>
                <ChevronDownIcon />
              </button>
              {advancedExpanded && (
                <div className="p-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">Select a category for more targeted content:</p>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          cat === selectedCategory
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateThread}
              disabled={isGenerating || !threadTopic.trim()}
              className="w-full py-4 bg-black text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-6"
            >
              <PencilIcon />
              {isGenerating ? 'Generating...' : 'Generate Thread'}
              <span className="text-gray-400 text-sm ml-2">Ctrl+Enter</span>
            </button>

            {/* Generated Thread */}
            {currentThread && (
              <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <DocumentIcon />
                  <span className="font-medium">Generated Thread</span>
                </div>
                <div className="p-6">
                  <div className="bg-black text-white p-4 rounded-lg font-mono text-sm whitespace-pre-line mb-4">
                    {currentThread}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => copyToClipboard(currentThread, 'thread')}
                      className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800"
                    >
                      <CopyIcon />
                      {copiedType === 'thread' ? 'Copied!' : 'Copy Thread'}
                    </button>
                    <button
                      onClick={copyForLinkedIn}
                      className="px-4 py-2 bg-[#0077B5] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#006399]"
                    >
                      <LinkedInIcon />
                      {copiedType === 'linkedin' ? 'Copied!' : 'Copy for LinkedIn'}
                    </button>
                    <button
                      onClick={shareOnTwitter}
                      className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0C85D0]"
                    >
                      <TwitterIcon />
                      Share on Twitter
                    </button>
                    <button
                      onClick={generateThread}
                      className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50"
                    >
                      <RefreshIcon />
                      Regenerate
                    </button>
                    <button
                      onClick={clearThread}
                      className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50"
                    >
                      <TrashIcon />
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thread History Tab */}
        {dashboardTab === 'history' && (
          <div className="max-w-[1000px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Your Thread History</h1>
                <p className="text-gray-600">{threadHistory.length} threads</p>
              </div>
              <input
                type="text"
                className="py-2 px-4 border border-gray-200 rounded-lg w-64"
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredThreads.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium mb-2">No threads yet</h3>
                <p className="text-gray-500 mb-4">Generate your first thread to see it here!</p>
                <button
                  onClick={() => setDashboardTab('writer')}
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium"
                >
                  Create Thread
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">TOPIC</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">CONTENT PREVIEW</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">DATE CREATED</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredThreads.map((thread) => (
                      <tr key={thread.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{thread.topic}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{thread.content.slice(0, 80)}...</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(thread.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(thread.content, `history-${thread.id}`)}
                              className="p-2 text-gray-400 hover:text-black"
                              title="Copy"
                            >
                              {copiedType === `history-${thread.id}` ? '✓' : <CopyIcon />}
                            </button>
                            <button
                              onClick={() => shareOnTwitter()}
                              className="p-2 text-gray-400 hover:text-[#1DA1F2]"
                              title="Share on Twitter"
                            >
                              <TwitterIcon />
                            </button>
                            <button
                              onClick={() => deleteThread(thread.id)}
                              className="p-2 text-gray-400 hover:text-red-500"
                              title="Delete"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {dashboardTab === 'templates' && (
          <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Template Library</h1>
                <p className="text-gray-600">High-performing thread templates with engagement scores</p>
              </div>
              <button
                onClick={handleRefreshTemplates}
                disabled={isRefreshingTemplates}
                className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${isRefreshingTemplates ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshingTemplates ? 'Refreshing...' : 'Refresh Templates'}
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isRefreshingTemplates ? 'opacity-50' : 'opacity-100'}`}>
              {displayedTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">{template.category}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{template.engagementScore}%</span>
                  </div>
                  <h3 className="font-semibold mb-3">{template.title}</h3>
                  <div className="bg-black text-white p-3 rounded-lg text-sm mb-4 whitespace-pre-line">
                    {template.content.slice(0, 3).join('\n')}
                    {template.content.length > 3 && '\n...'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(template.content.join('\n'), `template-${template.id}`);
                    }}
                    className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {copiedType === `template-${template.id}` ? '✓ Copied!' : 'Use Template'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images Tab */}
        {dashboardTab === 'images' && (
          <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Viral Image Library</h1>
                <p className="text-gray-600">Click on any image to download a 1080x1080 PNG ready for social media</p>
              </div>
              <button
                onClick={handleRefreshImages}
                disabled={isRefreshingImages}
                className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${isRefreshingImages ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshingImages ? 'Refreshing...' : 'Refresh Images'}
              </button>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-300 ${isRefreshingImages ? 'opacity-50' : 'opacity-100'}`}>
              {displayedImages.map((image) => {
                const categoryColors: Record<string, string> = {
                  'Productivity': 'bg-blue-500',
                  'Marketing': 'bg-green-500',
                  'Social Media': 'bg-pink-500',
                  'Finance': 'bg-orange-500',
                  'Education': 'bg-emerald-500',
                  'Business': 'bg-purple-500',
                  'Leadership': 'bg-cyan-500',
                  'Stoicism': 'bg-amber-600',
                }

                return (
                  <div 
                    key={image.id} 
                    onClick={() => downloadImage(image)}
                    className="bg-black aspect-square rounded-xl flex flex-col items-center justify-between p-5 hover:scale-[1.02] transition-all cursor-pointer group border-2 border-transparent hover:border-gray-400 relative overflow-hidden"
                  >
                    {/* Quote Preview */}
                    <div className="flex-1 flex items-center justify-center w-full">
                      <p className="text-white font-bold text-center text-sm sm:text-base leading-tight line-clamp-6">
                        {image.quote.length > 120 ? image.quote.slice(0, 120) + '...' : image.quote}
                      </p>
                    </div>

                    {/* Category Tag */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`${categoryColors[image.category] || 'bg-gray-500'} text-white text-[10px] font-bold px-2 py-1 rounded-full`}>
                        {image.category.toUpperCase()}
                      </span>
                      <span className="text-white text-xs font-semibold opacity-80">
                        {image.engagementScore}%
                      </span>
                    </div>

                    {/* Download overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="text-white font-semibold text-sm">Download PNG</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Info box */}
            <div className="mt-8 bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
              <strong>💡 Tip:</strong> Click on any image card to download a 1080x1080 PNG image perfect for Instagram, Facebook, LinkedIn, and Twitter. The images feature viral-style black backgrounds with white text.
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {dashboardTab === 'automation' && (
          <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Automation Center</h1>
              <p className="text-gray-600">Schedule automatic thread generation and posting to your social media accounts</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Facebook Connection */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Facebook Connection</h2>
                    <p className="text-sm text-gray-500">Connect your Facebook Page for automated posting</p>
                  </div>
                </div>

                {facebookConfig.isConnected ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-800 font-medium">Connected</span>
                      </div>
                      <button
                        onClick={disconnectFacebook}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Disconnect
                      </button>
                    </div>
                    <p className="text-sm text-green-700 mt-2">Page ID: {facebookConfig.pageId}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Facebook Page ID</label>
                      <input
                        type="text"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        placeholder="Enter your Page ID"
                        value={facebookConfig.pageId}
                        onChange={(e) => setFacebookConfig({ ...facebookConfig, pageId: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Page Access Token</label>
                      <input
                        type="password"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        placeholder="Enter your Access Token"
                        value={facebookConfig.accessToken}
                        onChange={(e) => setFacebookConfig({ ...facebookConfig, accessToken: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={connectFacebook}
                      className="w-full py-2.5 bg-[#1877F2] text-white rounded-lg font-medium hover:bg-[#166FE5] transition-colors"
                    >
                      Connect Facebook
                    </button>
                    <p className="text-xs text-gray-500">
                      💡 Get your Page ID and Access Token from Facebook Developer Console
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Post */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Quick Post</h2>
                <p className="text-gray-600 mb-4">Generate and post a thread immediately to your connected accounts.</p>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <input
                    type="text"
                    className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    placeholder="Enter a topic for the thread"
                    value={threadTopic}
                    onChange={(e) => setThreadTopic(e.target.value)}
                  />
                </div>

                {currentThread && (
                  <div className="mb-4 bg-black text-white p-3 rounded-lg text-sm whitespace-pre-line max-h-48 overflow-y-auto">
                    {currentThread}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={generateThread}
                    disabled={isGenerating || !threadTopic.trim()}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Thread'}
                  </button>
                  <button
                    onClick={() => currentThread && postNowToFacebook(currentThread)}
                    disabled={isPostingNow || !currentThread || !facebookConfig.isConnected}
                    className="flex-1 py-2.5 bg-[#1877F2] text-white rounded-lg font-medium hover:bg-[#166FE5] transition-colors disabled:opacity-50"
                  >
                    {isPostingNow ? 'Posting...' : 'Post to Facebook'}
                  </button>
                </div>
              </div>
            </div>

            {/* Schedules Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Scheduled Automations</h2>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Schedule
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                  <div className="text-6xl mb-4">⏰</div>
                  <h3 className="text-xl font-medium mb-2">No schedules yet</h3>
                  <p className="text-gray-500 mb-4">Create your first automation schedule to auto-post threads!</p>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="px-6 py-3 bg-black text-white rounded-lg font-medium"
                  >
                    Create Schedule
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">NAME</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">TOPIC</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">FREQUENCY</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">PLATFORMS</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">STATUS</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{schedule.name}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{schedule.topic}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 capitalize">
                              {schedule.frequency === 'twice-daily' ? 'Twice Daily' : schedule.frequency}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {schedule.postToFacebook && (
                                <span className="w-6 h-6 bg-[#1877F2] rounded flex items-center justify-center text-white text-xs">f</span>
                              )}
                              {schedule.postToTwitter && (
                                <span className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs">𝕏</span>
                              )}
                              {schedule.postToLinkedin && (
                                <span className="w-6 h-6 bg-[#0A66C2] rounded flex items-center justify-center text-white text-xs">in</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleSchedule(schedule.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${schedule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {schedule.isActive ? 'Active' : 'Paused'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="p-2 text-gray-400 hover:text-red-500"
                              title="Delete"
                            >
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Create Automation Schedule</h2>
                    <button
                      onClick={() => setShowScheduleModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Schedule Name</label>
                      <input
                        type="text"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        placeholder="e.g., Morning Motivation Posts"
                        value={scheduleForm.name}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Thread Topic</label>
                      <input
                        type="text"
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        placeholder="e.g., Productivity tips, Business advice..."
                        value={scheduleForm.topic}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, topic: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Posting Frequency</label>
                      <select
                        className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        value={scheduleForm.frequency}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value as 'daily' | 'twice-daily' | 'weekly' | 'custom' })}
                      >
                        <option value="daily">Daily</option>
                        <option value="twice-daily">Twice Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Post To</label>
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={scheduleForm.postToFacebook}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, postToFacebook: e.target.checked })}
                          />
                          <span className="text-sm">Facebook</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={scheduleForm.postToTwitter}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, postToTwitter: e.target.checked })}
                          />
                          <span className="text-sm">Twitter/X</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={scheduleForm.postToLinkedin}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, postToLinkedin: e.target.checked })}
                          />
                          <span className="text-sm">LinkedIn</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowScheduleModal(false)}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createSchedule}
                      disabled={!scheduleForm.name || !scheduleForm.topic}
                      className="flex-1 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      Create Schedule
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center text-sm text-gray-500">
          <span>© 2026 ThreadGenius</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Affiliates</a>
          </div>
        </div>
      </footer>
    </div>
  )

  // Render current view
  return (
    <>
      {currentView === 'landing' && renderLandingPage()}
      {currentView === 'login' && renderLoginPage()}
      {currentView === 'signup' && renderSignupPage()}
      {currentView === 'dashboard' && renderDashboardPage()}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[98] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
