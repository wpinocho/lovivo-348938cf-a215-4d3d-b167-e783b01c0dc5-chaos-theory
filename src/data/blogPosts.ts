import type { Blog } from '@/lib/supabase'

export const blogPosts: Blog[] = [
  {
    id: '1',
    title: 'Welcome to Our Blog',
    slug: 'welcome-to-our-blog',
    excerpt: 'This is our first blog post. Learn more about our store and what we have to offer.',
    content: `
      <p>Welcome to our blog! We're excited to share our journey with you.</p>
      <p>Here you'll find updates about our latest products, behind-the-scenes stories, and helpful tips related to our offerings.</p>
      <p>Stay tuned for more content coming soon. We have a lot of exciting things planned!</p>
      <p>Thank you for being part of our community.</p>
    `,
    featured_image: ['/placeholder.svg'],
    status: 'published',
    store_id: '',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]
