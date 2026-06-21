import { getPost, getAllSlugs } from '@/lib/posts'
import Link from 'next/link'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  return { title: post.title }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug)

  return (
    <article>
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to posts
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.categories && post.categories.length > 0 && (
            <>
              <span>·</span>
              <span>{post.categories.join(' / ')}</span>
            </>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* Content */}
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
