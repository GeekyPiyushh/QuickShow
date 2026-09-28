import React, { useState, useEffect } from 'react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import dateFormat from '../../lib/dateFormat'
import { getShows } from '../../lib/api'

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getAllShows = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getShows()
      if (res && res.success && Array.isArray(res.shows)) {
        setShows(res.shows)
      } else if (res && !res.success) {
        setError(res.message || 'Failed to fetch shows from backend')
      } else {
        setShows([])
      }
    } catch (err) {
      setError(err.message || 'Network error connecting to backend API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllShows()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <Title text1='List' text2='Shows' />

      {error ? (
        <div className='mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-w-2xl text-sm'>
          <p className='text-red-400 font-medium mb-1'>Unable to load shows</p>
          <p className='text-gray-400 text-xs mb-3'>{error}</p>
          <button
            onClick={getAllShows}
            className='px-4 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs transition cursor-pointer'
          >
            Retry
          </button>
        </div>
      ) : shows.length === 0 ? (
        <div className='mt-10 py-16 border border-dashed border-white/10 rounded-xl bg-white/5 text-center max-w-3xl'>
          <p className='text-lg font-medium text-gray-300 mb-1'>No Shows Found</p>
          <p className='text-sm text-gray-500 mb-4'>No shows have been scheduled yet.</p>
          <a
            href='/admin/add-shows'
            className='px-5 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg text-sm transition inline-block'
          >
            Add New Show
          </a>
        </div>
      ) : (
        <div className='max-w-4xl mt-6 overflow-x-auto'>
          <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
            <thead>
              <tr className='bg-primary/20 text-left text-white'>
                <th className='p-2 font-medium pl-5'>Movie Name</th>
                <th className='p-2 font-medium'>Show Time</th>
                <th className='p-2 font-medium'>Screen</th>
                <th className='p-2 font-medium'>Price</th>
              </tr>
            </thead>
            <tbody className='text-sm font-light'>
              {shows.map((show, index) => {
                const title = show.movie?.title || 'Unknown Title'
                const showDateStr = show.showDate || show.showDateTime
                const formattedDate = showDateStr ? dateFormat(showDateStr) : '-'
                const timeStr = show.startTime ? ` (${show.startTime})` : ''
                const screenName = show.screen?.name || show.screenType || 'Screen 1'
                const price = show.price ?? show.showPrice ?? 0

                return (
                  <tr
                    key={show._id || index}
                    className='border-b border-primary/10 bg-primary/5 even:bg-primary/10'
                  >
                    <td className='p-2 min-w-45 pl-5 font-medium'>{title}</td>
                    <td className='p-2 text-gray-300'>{formattedDate}{timeStr}</td>
                    <td className='p-2 text-gray-400'>{screenName}</td>
                    <td className='p-2 font-medium text-primary'>
                      {currency} {price}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default ListShows
