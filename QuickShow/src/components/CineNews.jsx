import React, { useState } from 'react'
import { Calendar, Clock, ChevronLeft, ChevronRight, Sparkles, Trophy, Film, Flame } from 'lucide-react'
import { NEWS_DATA } from '../assets/assets'

const CineNews = () => {
  // Navigation tabs for the 3 sections: 'news', 'awards', 'facts'
  const [activeSection, setActiveSection] = useState('news')

  // Pagination for News section
  const featured = NEWS_DATA.find((item) => item.type === 'banner')
  const gridNews = NEWS_DATA.filter((item) => item.type === 'grid')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 2
  const totalPages = Math.ceil(gridNews.length / pageSize)
  const pageNews = gridNews.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div id='CineNews' className="text-white min-h-screen py-12 px-6 md:px-16 lg:px-36 relative overflow-hidden">
      {/* Ambient Glow Background Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] bg-radial from-primary/15 via-transparent to-transparent blur-[120px] pointer-events-none z-0"></div>

      {/* Header & Section Switcher */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-6 mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-primary">
            CINE<span className="text-white">NEWS</span> & SHOW
          </h1>
          <p className="text-xs text-gray-400 mt-1">Latest News • Awards 🏆 • Bollywood Facts 🍿</p>
        </div>

        {/* 3 Interactive Section Navigation Buttons */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveSection('news')}
            className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-semibold transition ${
              activeSection === 'news'
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Latest News
          </button>
          <button
            onClick={() => setActiveSection('awards')}
            className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-semibold transition ${
              activeSection === 'awards'
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" /> Awards & Oscars
          </button>
          <button
            onClick={() => setActiveSection('facts')}
            className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-semibold transition ${
              activeSection === 'facts'
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4" /> Bollywood Facts
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 1: LATEST NEWS (Default Dashboard View)                    */}
      {/* ================================================================= */}
      {activeSection === 'news' && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          <div className="lg:col-span-2 space-y-6">
            {featured && (
              <div className="max-w-[90%] relative rounded-2xl overflow-hidden group cursor-pointer h-80 sm:h-96 border border-white/10 shadow-2xl">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pageNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 hover:bg-white/10 transition duration-300 cursor-pointer group"
                >
                  <div className="relative h-36 sm:h-32 overflow-hidden">
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

            {totalPages > 1 && (
              <nav aria-label="CineNews pages" className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-primary/20 rounded-xl p-5 w-full">
              <h4 className="text-sm font-bold text-white mb-1">Join CineNews</h4>
              <p className="text-xs sm:text-sm text-gray-400 mb-4">
                Get curated cinematic updates delivered straight to your inbox.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full text-xs px-3 py-2.5 border border-white/10 rounded-lg outline-none focus:border-primary bg-white/5 text-white placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 bg-primary hover:bg-primary-dull text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SECTION 2: AWARDS & OSCARS (Page 1 Integration)                    */}
      {/* ================================================================= */}
      {activeSection === 'awards' && (
        <div className="relative z-10 space-y-8 animate-fadeIn">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block text-primary bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
              Page 1 Exclusive
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Movie News <span className="text-primary">& Awards 🏆</span>
            </h2>
            <p className="text-gray-400 text-sm">
              Your daily dose of entertainment updates, Oscar nominations, and biggest trending stories.
            </p>
          </div>

          {/* Featured Hero Article */}
          <article className="bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden relative group hover:border-primary/40 transition duration-500">
            <div className="relative h-80 sm:h-[420px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop"
                alt="Oscars Red Carpet"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F16] via-[#0A0F16]/60 to-transparent"></div>
            </div>
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
              <span className="w-max text-xs font-bold uppercase bg-primary text-white px-3 py-1 rounded-md mb-4 tracking-wider">
                Awards Season
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight">
                Oscars 2026: The Complete List of Winners and Historic Upsets
              </h3>
              <p className="text-gray-300 text-sm sm:text-base max-w-3xl mb-4 line-clamp-2">
                From breathtaking performances to unexpected sweeps, dive into the biggest moments from the 98th Academy Awards. See who took home the golden statuette this year.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                <span>By CineNews Team</span>
                <span>•</span>
                <span>2 hours ago</span>
              </div>
            </div>
          </article>

          {/* Grid Cards for Awards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article className="bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition duration-300 group flex flex-col">
              <div className="h-44 overflow-hidden">
                <img src="https://filmfare.wwmindia.com/content/2020/may/shah-rukh-khan-11588775926.jpg" alt="SRK" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 mb-2">Bollywood</span>
                <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">Shah Rukh Khan's Next Action Thriller Shatters Advance Booking Records</h4>
                <p className="text-xs text-gray-400 line-clamp-3 mb-4">The highly anticipated pan-India project has officially crossed the ₹50 crore mark in advance bookings alone.</p>
                <div className="mt-auto text-[11px] text-gray-500">5 hours ago</div>
              </div>
            </article>

            <article className="bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition duration-300 group flex flex-col">
              <div className="h-44 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop" alt="Nolan" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 mb-2">Hollywood</span>
                <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">Christopher Nolan Announces Sci-Fi Epic for Summer 2027</h4>
                <p className="text-xs text-gray-400 line-clamp-3 mb-4">The visionary director is teaming up with IMAX once again for a mind-bending space exploration thriller.</p>
                <div className="mt-auto text-[11px] text-gray-500">12 hours ago</div>
              </div>
            </article>

            <article className="bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition duration-300 group flex flex-col">
              <div className="h-44 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=600&auto=format&fit=crop" alt="Golden Globes" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-400 mb-2">Nominations</span>
                <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">Golden Globes 2026: Indie Films Dominate the Nominations List</h4>
                <p className="text-xs text-gray-400 line-clamp-3 mb-4">Major studios take a backseat as independent cinema leads the charge at this year's nominations.</p>
                <div className="mt-auto text-[11px] text-gray-500">1 day ago</div>
              </div>
            </article>

            <article className="bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition duration-300 group flex flex-col">
              <div className="h-44 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop" alt="Box Office" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 mb-2">Trending</span>
                <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">Global Box Office Hits $10 Billion Faster Than Ever Before</h4>
                <p className="text-xs text-gray-400 line-clamp-3 mb-4">Thanks to a massive surge in post-pandemic theater attendance and global crossover hits.</p>
                <div className="mt-auto text-[11px] text-gray-500">1 day ago</div>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SECTION 3: BOLLYWOOD FUN FACTS BENTO GRID (Page 2 Integration)    */}
      {/* ================================================================= */}
      {activeSection === 'facts' && (
        <div className="relative z-10 space-y-8 animate-fadeIn">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block text-primary bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
              QuickShow Exclusives
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Mind-Blowing <span className="text-primary">Bollywood Facts 🍿</span>
            </h2>
            <p className="text-gray-400 text-sm">
              Dive into behind-the-scenes secrets, box office records, and casting mysteries that shaped Indian cinema.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            
            {/* Fact 1: Hero Bento Item */}
            <article className="md:col-span-2 md:row-span-2 bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden relative group hover:border-primary/40 transition duration-500 flex flex-col justify-end">
              <img
                src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=900&auto=format&fit=crop"
                alt="Epic Song"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F16] via-[#0A0F16]/50 to-transparent"></div>
              <div className="relative z-10 p-6 sm:p-8">
                <span className="text-xs uppercase font-bold tracking-widest text-primary mb-2 block">The Ultimate Record 🏆</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">The 20-Minute Epic Song</h3>
                <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
                  Featuring legends like Amitabh Bachchan and Akshay Kumar, the title track of <em className="text-white font-semibold">"Ab Tumhare Hawale Watan Saathiyon"</em> is the longest Hindi film song ever recorded—spanning 20 minutes across three installments.
                </p>
              </div>
            </article>

            {/* Fact 2: Ghajini */}
            <article className="bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition duration-500 flex flex-col group">
              <div className="h-36 overflow-hidden bg-black/20">
                <img src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop" alt="Aamir Khan" className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-5 flex flex-col justify-center flex-grow">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Box Office 💰</span>
                <h4 className="text-base font-bold mb-1">The 100-Crore Pioneer</h4>
                <p className="text-xs text-gray-400 line-clamp-2">Aamir Khan's <em className="text-white">Ghajini</em> (2008) created the famous 100-crore club benchmark domestically.</p>
              </div>
            </article>

            {/* Fact 3: DDLJ */}
            <article className="bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden relative group hover:border-primary/40 transition duration-500 flex flex-col justify-end">
              <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop" alt="DDLJ" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F16] via-[#0A0F16]/40 to-transparent"></div>
              <div className="relative z-10 p-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1 block">Casting 🎭</span>
                <h4 className="text-base font-bold mb-1">DDLJ's First Choice</h4>
                <p className="text-xs text-gray-300">Before Shah Rukh Khan made Raj iconic, Saif Ali Khan was Aditya Chopra's initial choice.</p>
              </div>
            </article>

            {/* Fact 4: Rockstar */}
            <article className="md:col-span-2 bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition duration-500 flex flex-col md:flex-row group">
              <div className="p-6 flex flex-col justify-center flex-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Directing 🎬</span>
                <h4 className="text-lg font-bold mb-2">Shooting in Reverse</h4>
                <p className="text-xs sm:text-sm text-gray-400">To maintain hair continuity, Imtiaz Ali shot <em className="text-white">Rockstar</em> backward—filming the emotional climax first.</p>
              </div>
              <div className="md:w-1/2 h-44 md:h-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop" alt="Rockstar" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            </article>

            {/* Fact 5: Hrithik Roshan */}
            <article className="bg-[#221A21] border border-white/10 rounded-2xl overflow-hidden relative group hover:border-primary/40 transition duration-500 flex flex-col justify-end">
              <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop" alt="Awards" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F16] via-[#0A0F16]/50 to-transparent"></div>
              <div className="relative z-10 p-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1 block">Hall of Fame 🌟</span>
                <h4 className="text-base font-bold mb-1">92 Awards Debut</h4>
                <p className="text-xs text-gray-300">Hrithik's debut in <em className="text-white">Kaho Naa... Pyaar Hai</em> won 92 awards, setting a Guinness record.</p>
              </div>
            </article>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 mt-16 text-center text-xs text-gray-500 border-t border-white/10 pt-6">
        <p>&copy; 2026 QuickShow. Designed by GeekyPiyushh.</p>
      </footer>
    </div>
  )
}

export default CineNews