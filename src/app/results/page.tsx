'use client'

import { PlaylistCard } from '@/components/PlaylistCard'
import { Spinner } from '@/components/Spinner'
import { VideoCard } from '@/components/VideoCard'
import { ChannelCard } from '@/components/ChannelCard'
import { API_URL, filters } from '@/constants'
import { Channel, Filter, Playlist, Video } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { SearchResultFilter } from '@/components/SearchResultsFilter'

const getData = async (
  query: string,
  filter: Filter = 'all'
): Promise<{ items: (Video | Playlist | Channel)[]; nextpage: string }> => {
  const res = await fetch(`${API_URL}/search?q=${query}&filter=${filter}`)
  return await res.json()
}

export default function Results() {
  const searchParams = useSearchParams()
  const query = searchParams.get('search_query')
  const filter = searchParams.get('filter') ?? 'all'

  const { data, isFetching } = useQuery({
    queryKey: [query, filter],
    queryFn: () => getData(query ?? '', filter as Filter)
  })

  console.log(data)

  return (
    <div className='mx-auto flex max-w-4xl flex-col gap-4'>
      <SearchResultFilter />
      {isFetching && <Spinner className='self-center' />}
      {data?.items.map((item) => {
        if (item.type === 'stream') {
          return <VideoCard key={item.url} {...item} />
        }

        if (item.type === 'playlist') {
          return <PlaylistCard key={item.url} {...item} />
        }

        if (item.type === 'channel') {
          return <ChannelCard key={item.url} {...item} />
        }
      })}
    </div>
  )
}
