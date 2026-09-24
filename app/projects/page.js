export const metadata = {
  title: 'Projects',
  description:
    'Selected projects — MiniLake, an all-in-one data platform; Code Graph, an MCP server that makes a codebase queryable as a graph; and Urban Intelligence, an interactive map of Pakistan.',
}

// A card with `live: null` or `repo: null` simply renders without that link.
const projects = [
  {
    name: 'MiniLake',
    tagline: 'The all-in-one data platform',
    blurb: [
      'A data platform built around a single idea: the lakehouse stack should be approachable ' +
        'without being simplistic. MiniLake pairs the platform itself with a full design system — ' +
        'colour and type tokens, a vector logo system, and a set of React UI primitives — so the ' +
        'product, its marketing site, and every prototype speak the same visual language.',
      'The marketing site is deliberately plain: static HTML, CSS custom properties, and ES ' +
        'modules, with no build step and no node_modules. The design system ships as plain CSS ' +
        'variables, which means the site consumes it directly rather than compiling against it.',
    ],
    stack: ['Design system', 'Static site', 'CSS custom properties', 'React', 'Vercel'],
    live: 'https://minilake.vercel.app/',
    repo: 'https://github.com/The-Data-Platform-Project/minilake',
  },
  {
    name: 'Code Graph',
    tagline: 'An MCP server that turns a codebase into a queryable graph',
    blurb: [
      'Coding agents burn most of their budget re-reading files and grepping the repo tree just to ' +
        'work out how a project fits together. Code Graph indexes the codebase into a graph of ' +
        'symbols and their relationships, then exposes it over the Model Context Protocol so an ' +
        'agent can ask direct questions instead: where is this defined, what calls it, what ' +
        'depends on it, what does this module actually contain.',
      'The result is structural understanding at a fraction of the context — an overview of a ' +
        'service or package comes back as a handful of edges rather than a few thousand lines of ' +
        'source.',
    ],
    stack: ['MCP', 'Static analysis', 'Graph database', 'Python'],
    live: 'https://code-graph-viz.vercel.app/',
    repo: null,
  },
  {
    name: 'Urban Intelligence',
    tagline: 'An interactive population and geography map of Pakistan',
    blurb: [
      'An interactive D3 map of five cities — Karachi, Lahore, Islamabad, Peshawar and Multan — ' +
        'drilling from the country down to neighbourhood level wherever open boundaries exist. ' +
        'Nine census layers switch between the 2023 census and a 2026 projection, and the current ' +
        'view exports to CSV exactly as it appears on screen.',
      'On top of the census data sits a dealership clustering layer: each territory is shaded by ' +
        'the regions it covers, with premium areas picked out inside it. Data limitations are ' +
        'carried in the interface itself rather than buried in documentation.',
    ],
    stack: ['D3', 'GeoJSON', 'Python', 'Data visualisation', 'Vercel'],
    live: 'https://urban-intelligence-snowy.vercel.app/',
    repo: null,
  },
]

function LinkIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  )
}

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-slate-100">Projects</h1>
      <p className="text-slate-600 dark:text-slate-400 leading-7 mb-10">
        Things I build outside of client work — mostly at the seam between data platforms and the
        tools that make them easier to reason about.
      </p>

      <div className="space-y-8">
        {projects.map(project => (
          <article
            key={project.name}
            className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#161a24] p-6 sm:p-7 transition-colors hover:border-slate-300 dark:hover:border-slate-600"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h2>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{project.tagline}</p>

            {project.blurb.map((paragraph, i) => (
              <p key={i} className="mt-4 leading-7 text-slate-700 dark:text-slate-300">
                {paragraph}
              </p>
            ))}

            <div className="flex flex-wrap gap-2 mt-5">
              {project.stack.map(item => (
                <span
                  key={item}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>

            {(project.live || project.repo) && (
              <div className="flex flex-wrap items-center gap-5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/50">
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
                  >
                    <LinkIcon />
                    Live site
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    <GitHubIcon />
                    Source
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
