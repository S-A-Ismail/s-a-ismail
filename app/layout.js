import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: {
    default: 'Syed Ismail — Portfolio',
    template: '%s — Syed Ismail',
  },
  description:
    'Data Platform Engineer specializing in Databricks, AWS, and cloud-native data solutions.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set initial theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-200 min-h-screen antialiased">
        <Sidebar />
        <div className="lg:ml-[260px]">
          <main className="max-w-3xl mx-auto px-6 py-12 lg:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
