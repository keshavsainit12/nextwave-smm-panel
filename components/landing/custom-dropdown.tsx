'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ id: string; name: string }>
  placeholder?: string
}

export function CustomDropdown({ label, value, onChange, options, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Get selected option name
  const selectedOption = options.find((opt) => opt.id === value)
  const displayName = selectedOption?.name || placeholder || 'Select option'

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>

      <div className="relative w-full" ref={dropdownRef}>
        {/* Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white/50 hover:bg-white/60 border border-white/40 rounded-xl h-12 px-4 text-sm text-[var(--deep-navy)] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all flex items-center justify-between"
        >
          <span className="truncate">{displayName}</span>
          <ChevronDown
            size={18}
            className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-white/40 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
            {/* Search input */}
            <div className="sticky top-0 p-2 bg-white border-b border-white/20">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>

            {/* Options */}
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onChange(option.id)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-500/10 ${
                      value === option.id
                        ? 'bg-blue-500/20 text-[var(--electric-blue)] font-semibold'
                        : 'text-[var(--deep-navy)]'
                    }`}
                  >
                    <span className="truncate block">{option.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-xs text-slate-500">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
