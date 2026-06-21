import Link from 'next/link'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostCard({ post }) {
  const { slug, title, date, categories, tags } = post
  const subCategory = categories?.[1] || categories?.[0] || 'Article'

  return (
    <article className="group bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 hover:border-blue-400/60 dark:hover:border-blue-500/50 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
          {subCategory}
        </span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <time className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(date)}
        </time>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        <Link href={`/posts/${slug}`} className="stretched-link">
          {title}
        </Link>
      </h2>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.slice(0, 6).map(tag => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
