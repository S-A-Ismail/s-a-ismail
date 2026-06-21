import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const postsDir = path.join(process.cwd(), '_posts')

function preprocessContent(content) {
  const lines = content.split('\n')
  const result = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('> ') || line === '>') {
      const blockLines = []
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        blockLines.push(lines[i].replace(/^> ?/, ''))
        i++
      }
      const ialMatch = lines[i] && lines[i].match(/^\{: \.prompt-(\w+) \}$/)
      if (ialMatch) {
        const type = ialMatch[1]
        result.push(`<div class="prompt prompt-${type}">${blockLines.join(' ')}</div>`)
        i++
      } else {
        blockLines.forEach(bl => result.push(`> ${bl}`))
      }
    } else if (/^\{: [^}]+ \}$/.test(line)) {
      i++
    } else {
      result.push(line)
      i++
    }
  }

  return result.join('\n')
}

export function getAllPosts() {
  const filenames = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))

  return filenames
    .map(filename => {
      const slug = filename.replace(/\.md$/, '')
      const fullPath = path.join(postsDir, filename)
      const raw = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(raw)
      return { slug, ...data }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getAllSlugs() {
  return fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
}

export async function getPost(slug) {
  const fullPath = path.join(postsDir, `${slug}.md`)
  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)

  const preprocessed = preprocessContent(content)

  const htmlResult = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(preprocessed)

  let html = htmlResult.toString()

  if (data.img_path) {
    const imgBase = data.img_path.endsWith('/') ? data.img_path : data.img_path + '/'
    html = html.replace(
      /<img([^>]*)\ssrc="(?!https?:\/\/|\/|data:)([^"]+)"/g,
      `<img$1 src="${imgBase}$2"`
    )
  }

  return { slug, content: html, ...data }
}
