import { useState } from 'react'
import { cn } from '../../lib/utils'

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  defaultOpen?: string
}

export function Accordion({ items, defaultOpen }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen || null)

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
          >
            <span className="font-medium text-gray-900">{item.title}</span>
            <span
              className={cn(
                'text-gray-500 transition-transform inline-block',
                openId === item.id && 'rotate-180'
              )}
            >
              ▼
            </span>
          </button>
          {openId === item.id && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
