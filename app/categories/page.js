import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'

export const metadata = { title: 'Categories' }

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function CategoriesPage() {
  const posts = getAllPosts()

  const categories = {}
  posts.forEach(post => {
    const cats = post.categories || []
    const leaf = cats[cats.length - 1] || 'Uncategorized'
    if (!categories[leaf]) categories[leaf] = []
    categories[leaf].push(post)
  })

  const sorted = Object.entries(categories).sort((a, b) => b[1].length - a[1].length)

  return (
    <>
      <h1 className="text-2xl font-bold mb-8 text-slate-900 dark:text-slate-100">Categories</h1>
      <div className="space-y-10">
        {sorted.map(([cat, catPosts]) => (
          <section key={cat}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              <span className="text-blue-500">#</span>
              {cat}
              <span className="text-sm font-normal text-slate-400">({catPosts.length})</span>
            </h2>
            <ul className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
              {catPosts.map(post => (
                <li key={post.slug} className="flex items-baseline justify-between gap-4">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors leading-snug"
                  >
                    {post.title}
                  </Link>
                  <time className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(post.date)}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
