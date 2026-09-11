import React from 'react'
import { Calendar, Clock, Sparkles } from 'lucide-react'
import { NEWS_DATA } from '../assets/assets'

const CineNews = () => {
  const featured = NEWS_DATA.find((item) => item.type === 'banner')
  const gridNews = NEWS_DATA.filter((item) => item.type === 'grid')

  return (
    <div id='CineNews' className="text-white min-h-screen py-12 px-6 md:px-16 lg:px-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-primary">
            CINE<span className="text-white">NEWS</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Latest • Curated • Cinematic</p>
        </div>
        <button className="flex items-center gap-2 text-gray-200 text-sm px-4 py-2">
          <Sparkles className="w-4 h-4" /> Latest News
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Hero Banner */}
          {featured && (
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer h-96 border border-white/10 shadow-2xl">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                <span className="w-max text-[11px] font-semibold tracking-wider bg-primary text-white px-3 py-1 rounded-full uppercase mb-3">
                  {featured.tag}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
                  {featured.title}
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 mb-4 max-w-xl">
                  {featured.desc}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featured.time}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {featured.date}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gridNews.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-rose-500/50 hover:bg-white/10 transition duration-300 cursor-pointer group"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <span className="absolute top-2 left-2 text-[10px] uppercase font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-gray-100 line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Newsletter Box */}
          <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/20 rounded-xl p-5 mt-3 max-w-1/2">
            <h4 className="text-sm font-bold text-white mb-1">Join CineNews</h4>
            <p className="text-sm text-gray-400 mb-4">
              Get curated cinematic updates delivered straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className=" flex gap-2 items-center">
              <input
                type="email"
                placeholder="Email address"
                className="max-w-1/2 text-xs px-3 py-2 border border-white/10 rounded-lg outline-none focus:border-rose-500 bg-white/5 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="w-30 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2 rounded-lg transition active:scale-95"
              > Subscribe
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CineNews