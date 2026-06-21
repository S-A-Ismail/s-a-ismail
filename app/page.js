import { getAllPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'

export const metadata = {
  title: 'Syed Ismail — Portfolio',
}

export default function Home() {
  const posts = getAllPosts()

  return (
    <>
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recent Posts</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5">
          Technical writing on data engineering, cloud platforms, and more.
        </p>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  )
}
