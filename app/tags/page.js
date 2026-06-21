import { getAllPosts } from '@/lib/posts'

export const metadata = { title: 'Tags' }

export default function TagsPage() {
  const posts = getAllPosts()

  const tagCounts = {}
  posts.forEach(post => {
    ;(post.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

  function sizeClass(count) {
    if (count >= 5) return 'text-base px-3.5 py-1.5'
    if (count >= 3) return 'text-sm px-3 py-1'
    return 'text-xs px-2.5 py-1'
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-8 text-slate-900 dark:text-slate-100">Tags</h1>
      <div className="flex flex-wrap gap-3">
        {sortedTags.map(([tag, count]) => (
          <span
            key={tag}
            className={`${sizeClass(count)} bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-medium`}
          >
            #{tag}{' '}
            <span className="text-slate-400 dark:text-slate-500 font-normal text-[0.8em]">
              {count}
            </span>
          </span>
        ))}
      </div>
    </>
  )
}
