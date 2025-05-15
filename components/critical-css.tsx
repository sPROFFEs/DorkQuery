"use client"

export default function CriticalCSS() {
  return (
    <style jsx global>{`
      :root {
        color-scheme: dark;
      }
      
      body {
        background-color: #000;
        color: #fff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
      }
      
      .bg-black {
        background-color: #000;
      }
      
      .text-white {
        color: #fff;
      }
      
      .border-gray-800 {
        border-color: #1f2937;
      }
      
      .bg-gray-900 {
        background-color: #111827;
      }
      
      .bg-gray-800 {
        background-color: #1f2937;
      }
      
      .rounded-md {
        border-radius: 0.375rem;
      }
      
      .p-4 {
        padding: 1rem;
      }
      
      .mb-4 {
        margin-bottom: 1rem;
      }
      
      .flex {
        display: flex;
      }
      
      .items-center {
        align-items: center;
      }
      
      .justify-between {
        justify-content: space-between;
      }
      
      .font-bold {
        font-weight: 700;
      }
      
      .text-lg {
        font-size: 1.125rem;
        line-height: 1.75rem;
      }
      
      .text-xl {
        font-size: 1.25rem;
        line-height: 1.75rem;
      }
      
      .space-y-3 > * + * {
        margin-top: 0.75rem;
      }
      
      .grid {
        display: grid;
      }
      
      .gap-4 {
        gap: 1rem;
      }
      
      @media (min-width: 768px) {
        .md\\:grid-cols-\\[300px_1fr\\] {
          grid-template-columns: 300px 1fr;
        }
      }
    `}</style>
  )
}
