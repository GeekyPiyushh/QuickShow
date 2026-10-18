import { Star, Tag } from 'lucide-react'

const UpcomingCard = ({ movie, isTall = false, onClick }) => {
  if (!movie) return null

  return (
    <div
      onClick={() => onClick && onClick(movie)}
      className="group flex flex-col gap-2.5 cursor-pointer"
    >
      {/* Poster Image Container */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-slate-900/60 border border-white/10 transition-all duration-300 shadow-md hover:border-primary/50 ${
          isTall ? 'h-[440px] flex flex-col justify-end p-6' : 'h-48'
        }`}
      >
        <img
          src={movie.poster || movie.backdrop}
          alt={movie.title}
          className="absolute inset-0 z-0 w-full h-full object-cover transition-transform duration-500 opacity-90 group-hover:opacity-100 group-hover:scale-105"
        />

        {isTall ? (
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center justify-center px-2.5 h-6 rounded-full bg-primary text-white text-[11px] font-medium shadow-lg whitespace-nowrap">
            {movie.releaseDate}
          </span>
        </div>

        {isTall && (
          <div className="relative z-10 text-center flex flex-col gap-2">
            <h2 className="lg:text-2xl md:text-4xl text-2xl font-semibold text-white tracking-wider uppercase leading-tight drop-shadow-md group-hover:text-primary transition-colors">
              {movie.title}
            </h2>
            {movie.logline && (
              <p className="lg:text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-90">
                {movie.logline}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center gap-1 text-primary">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < 4
                  ? 'fill-primary stroke-primary'
                  : 'fill-slate-600 stroke-slate-600'
              }`}
            />
          ))}
        </div>

        <h3 className="text-base font-bold text-white tracking-wide transition-colors group-hover:text-primary">
          {isTall ? (movie.subTitle || movie.title) : movie.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Tag className="w-3 h-3 text-primary shrink-0" />
          <span>
            {Array.isArray(movie.genres)
              ? movie.genres.map(g => (typeof g === 'object' ? g.name : g)).join(' • ')
              : movie.genres}
          </span>
        </div>
      </div>
    </div>
  )
}

export default UpcomingCard
