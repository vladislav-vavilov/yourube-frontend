import { FC, KeyboardEvent, useRef, useState } from 'react'
import { SearchSuggestions } from '@/components/Search/SearchSuggestions'
import { useSelect } from '@/hooks/useSelect'
import { useQuerySuggestions } from '@/hooks/useQuerySuggestions'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchClear } from './SearchClear'
import { InputHint } from '../InputHint'
import { useKeyDown } from '@/hooks/useKeyDown'

export const Search: FC = () => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    historySuggestions,
    functions: { appendHistory, removeFromHistory, getHistorySuggestions }
  } = useSearchHistory()
  const { querySuggestions, fetchQuerySuggestions } = useQuerySuggestions({
    exclude: historySuggestions
  })

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const suggestions = [...historySuggestions, ...querySuggestions]
  const isOpen = isSuggestionsOpen && !!suggestions.length

  const {
    currentIndex,
    currentItem,
    functions: { prev, next, unselect }
  } = useSelect({
    items: suggestions,
    onIndexChange: (currentIndex) => setQuery(suggestions[currentIndex])
  })

  const { push } = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')

  const handleSearch = (searchQuery: string = query) => {
    const params = new URLSearchParams()
    params.set('search_query', searchQuery)
    params.set('filter', filter || 'all')

    push(`/results?${params.toString()}`)
    unselect()
    appendHistory(searchQuery)
    setIsSuggestionsOpen(false)
    inputRef.current?.blur()
  }

  const changeQuery = (value: string) => {
    setQuery(value)
    unselect()

    getHistorySuggestions(value)
    fetchQuerySuggestions(value)
  }

  useKeyDown((e) => {
    if (e.key === 'k' && e.ctrlKey) {
      e.preventDefault()
      inputRef.current?.focus()
    }
  })

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const { key, ctrlKey } = e

    switch (key) {
      case 'Enter':
        handleSearch()
        break
      case 'ArrowUp':
      case 'k':
        if (key === 'k' && !ctrlKey) return
        if (isOpen) {
          e.preventDefault()
          prev()
        }
        break
      case 'ArrowDown':
      case 'j':
        if (key === 'j' && !ctrlKey) return
        if (isOpen) {
          e.preventDefault()
          next()
        }
        break
      case 'Delete':
        if (currentItem && isOpen) {
          unselect()
          removeFromHistory(currentItem)
        }
      default:
        break
    }
  }

  return (
    <div className='relative mx-auto max-w-3xl'>
      <div className='flex w-full items-center gap-2 border-b border-neutral-700'>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setIsSuggestionsOpen(true)}
          onBlur={() => setIsSuggestionsOpen(false)}
          className='w-full bg-transparent p-2 text-neutral-200 transition-colors duration-200 focus:border-neutral-500'
          placeholder='Type to search'
        />
        <SearchClear show={!!query} onClick={() => changeQuery('')} />
        <InputHint>{isOpen ? '↑↓ (Ctrl J/K)' : 'Ctrl K'}</InputHint>
      </div>
      <SearchSuggestions
        isOpen={isOpen}
        suggestions={{
          history: historySuggestions,
          query: querySuggestions
        }}
        selectedItemIndex={currentIndex}
        handleSearch={handleSearch}
        removeFromHistory={removeFromHistory}
      />
    </div>
  )
}
