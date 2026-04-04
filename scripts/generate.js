import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const TWEET_TEMPLATES = [
  "Nigerian tech space is moving so fast! 🇳🇬🚀",
  "Don't wait for permission to be great. Just start.",
  "What if today is the day everything changes? Keep pushing.",
  "Focus on building high-value skills in 2026. The rest will follow.",
  "Community is the biggest leverage in growth. #tech #nigeria",
  "Build in public. Fail in public. Win in public. 💎",
]

async function generateTweet() {
  console.log('--- Starting Automation ---')
  const content = TWEET_TEMPLATES[Math.floor(Math.random() * TWEET_TEMPLATES.length)]
  
  const { data, error } = await supabase.from('tweets').insert([{
    content,
    status: 'queued'
  }])

  if (error) {
    console.error('Error generating tweet:', error)
    process.exit(1)
  }
  
  console.log('✅ Successfully generated and queued a new tweet!')
  process.exit(0)
}

generateTweet()
