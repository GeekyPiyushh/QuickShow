// import React from 'react';

// export default function BollywoodFacts() {
//   return (
//     <div style={{ backgroundColor: '#0A0F16', color: '#FFFFFF', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", overflowX: 'hidden', position: 'relative' }}>
      
//       {/* Inline styles mapped from your CSS to keep it 100% self-contained and accurate */}
//       <style>{`
//         :root {
//           --bg-color: #0A0F16;
//           --card-bg: #221A21;
//           --primary-color: #E82055;
//           --text-primary: #FFFFFF;
//           --text-secondary: #A3A8B2;
//           --hover-transition: 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
//         }
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }
//         .ambient-glow {
//           position: fixed;
//           top: -10%;
//           left: 50%;
//           transform: translateX(-50%);
//           width: 70vw;
//           height: 50vh;
//           background: radial-gradient(circle, rgba(232, 32, 85, 0.12) 0%, transparent 60%);
//           z-index: 0;
//           pointer-events: none;
//           filter: blur(100px);
//         }
//         .page-wrapper {
//           max-width: 1200px;
//           margin: 0 auto;
//           padding: 80px 20px;
//           position: relative;
//           z-index: 1;
//           display: flex;
//           flex-direction: column;
//           min-height: 100vh;
//         }
//         .bento-header {
//           text-align: center;
//           margin-bottom: 60px;
//         }
//         .header-tag {
//           display: inline-block;
//           color: var(--primary-color);
//           background: rgba(232, 32, 85, 0.1);
//           border: 1px solid rgba(232, 32, 85, 0.3);
//           padding: 6px 16px;
//           border-radius: 50px;
//           font-size: 0.85rem;
//           font-weight: 700;
//           letter-spacing: 2px;
//           text-transform: uppercase;
//           margin-bottom: 20px;
//         }
//         .bento-header h1 {
//           font-size: 4rem;
//           font-weight: 900;
//           line-height: 1.1;
//           margin-bottom: 20px;
//           letter-spacing: -1px;
//         }
//         .highlight {
//           background: linear-gradient(90deg, var(--text-primary), var(--primary-color));
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//         }
//         .bento-header p {
//           color: var(--text-secondary);
//           font-size: 1.2rem;
//           max-width: 600px;
//           margin: 0 auto;
//         }
//         .bento-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           grid-auto-rows: 290px;
//           gap: 24px;
//         }
//         .hero-item {
//           grid-column: span 2;
//           grid-row: span 2;
//         }
//         .wide-item {
//           grid-column: span 2;
//         }
//         .tall-item {
//           grid-row: span 2;
//         }
//         .bento-item {
//           background: var(--card-bg);
//           border-radius: 24px;
//           position: relative;
//           overflow: hidden;
//           border: 1px solid rgba(255, 255, 255, 0.05);
//           transition: var(--hover-transition);
//           display: flex;
//           flex-direction: column;
//         }
//         .bento-item:hover {
//           transform: translateY(-6px);
//           border-color: rgba(232, 32, 85, 0.4);
//           box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(232, 32, 85, 0.15);
//         }
//         .image-wrapper {
//           background: linear-gradient(135deg, #2b1d28, #121824);
//         }
//         .bento-img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           object-position: top center;
//           transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//         }
//         .bento-item:hover .bento-img {
//           transform: scale(1.08);
//         }
//         .has-bg {
//           justify-content: flex-end;
//         }
//         .has-bg .bento-img {
//           position: absolute;
//           top: 0;
//           left: 0;
//           z-index: 0;
//         }
//         .image-overlay {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background: linear-gradient(to top, rgba(10, 15, 22, 0.98) 10%, rgba(10, 15, 22, 0.65) 55%, rgba(10, 15, 22, 0.15) 100%);
//           z-index: 1;
//         }
//         .tall-overlay {
//           background: linear-gradient(to top, rgba(10, 15, 22, 0.98) 15%, rgba(10, 15, 22, 0.6) 60%, rgba(10, 15, 22, 0.1) 100%);
//         }
//         .bento-content {
//           position: relative;
//           z-index: 2;
//           padding: 30px;
//         }
//         .split-vertical .image-wrapper {
//           height: 48%;
//           width: 100%;
//           overflow: hidden;
//         }
//         .split-vertical .bento-content {
//           height: 52%;
//           padding: 20px 26px;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//         }
//         .split-horizontal {
//           flex-direction: row;
//         }
//         .split-horizontal .bento-content {
//           flex: 1.1;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//         }
//         .split-horizontal .image-wrapper {
//           flex: 0.9;
//           height: 100%;
//           overflow: hidden;
//         }
//         .split-horizontal.flipped {
//           flex-direction: row;
//         }
//         .fact-category {
//           font-size: 0.75rem;
//           text-transform: uppercase;
//           letter-spacing: 2px;
//           color: var(--primary-color);
//           font-weight: 700;
//           display: block;
//           margin-bottom: 8px;
//         }
//         .bento-item h3 {
//           font-size: 1.35rem;
//           font-weight: 700;
//           margin-bottom: 10px;
//           color: var(--text-primary);
//           line-height: 1.3;
//         }
//         .hero-item h3 {
//           font-size: 2.6rem;
//           margin-bottom: 14px;
//         }
//         .bento-item p {
//           color: var(--text-secondary);
//           font-size: 0.92rem;
//           line-height: 1.55;
//         }
//         .hero-item p {
//           font-size: 1.1rem;
//           max-width: 85%;
//         }
//         footer {
//           margin-top: 60px;
//           text-align: center;
//           color: var(--text-secondary);
//           font-size: 0.95rem;
//         }
//         @media (max-width: 1024px) {
//           .bento-grid {
//             grid-template-columns: repeat(2, 1fr);
//           }
//           .hero-item, .wide-item {
//             grid-column: span 2;
//           }
//           .tall-item {
//             grid-column: span 1;
//             grid-row: span 1;
//           }
//         }
//         @media (max-width: 768px) {
//           .bento-header h1 {
//             font-size: 2.8rem;
//           }
//           .bento-grid {
//             grid-template-columns: 1fr;
//             grid-auto-rows: auto;
//           }
//           .hero-item, .wide-item, .tall-item, .bento-item {
//             grid-column: span 1;
//             grid-row: auto;
//           }
//           .split-horizontal, .split-horizontal.flipped {
//             flex-direction: column-reverse;
//           }
//           .split-horizontal .image-wrapper,
//           .split-vertical .image-wrapper {
//             height: 240px;
//             width: 100%;
//           }
//           .hero-item h3 {
//             font-size: 2rem;
//           }
//           .hero-item p {
//             max-width: 100%;
//           }
//           .has-bg {
//             min-height: 420px;
//           }
//         }
//       `}</style>

//       <div className="ambient-glow"></div>

//       <div className="page-wrapper">
//         <header className="bento-header">
//           <div className="header-tag">QuickShow Exclusives</div>
//           <h1>Mind-Blowing <br /><span className="highlight">Bollywood Facts</span></h1>
//           <p>Dive into behind-the-scenes secrets, box office records, and casting mysteries that shaped the Indian film industry.</p>
//         </header>

//         <main className="bento-grid">
          
//           {/* 1. Hero Bento Item: Amitabh Bachchan */}
//           <article className="bento-item hero-item has-bg">
//             <img 
//               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT66a5SHffktvSzcr5hDq5ycTJjuRK7oPTKy8pCfOQHvw&s=10" 
//               alt="Amitabh Bachchan in Ab Tumhare Hawale Watan Saathiyon" 
//               className="bento-img" 
//               loading="lazy" 
//             />
//             <div className="image-overlay"></div>
//             <div className="bento-content">
//               <span className="fact-category">The Ultimate Record 🏆</span>
//               <h3>The 20-Minute Epic Song</h3>
//               <p>Featuring legends like Amitabh Bachchan and Akshay Kumar, the title track of <em>"Ab Tumhare Hawale Watan Saathiyon"</em> is the longest Hindi film song ever recorded—spanning 20 minutes across three installments in the movie.</p>
//             </div>
//           </article>

//           {/* 2. Standard Bento Item: Aamir Khan */}
//           <article className="bento-item split-vertical">
//             <div className="image-wrapper">
//               <img 
//                 src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNIPpLmpNoLJ-eYX02a2EebcU9zjZCi68xxfzJ-k_OwQ&s=10" 
//                 alt="Aamir Khan - Ghajini 100 Crore Pioneer" 
//                 className="bento-img" 
//                 loading="lazy" 
//               />
//             </div>
//             <div className="bento-content">
//               <span className="fact-category">Box Office 💰</span>
//               <h3>The 100-Crore Pioneer</h3>
//               <p>The famous "100-crore club" benchmark was coined after Aamir Khan's <em>Ghajini</em> (2008) became the first Indian film to cross ₹100 crore domestically.</p>
//             </div>
//           </article>

//           {/* 3. Standard Bento Item: Saif Ali Khan */}
//           <article className="bento-item has-bg">
//             <img 
//               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUYgW-_Vln6R6J0rBcdEAJtBmE6MadYISJnY3vQHWVNA&s=10" 
//               alt="Saif Ali Khan - DDLJ First Choice" 
//               className="bento-img" 
//               loading="lazy" 
//             />
//             <div className="image-overlay"></div>
//             <div className="bento-content">
//               <span className="fact-category">Casting 🎭</span>
//               <h3>DDLJ's First Choice</h3>
//               <p>Before Shah Rukh Khan made Raj iconic in <em>DDLJ</em>, Saif Ali Khan was actually Aditya Chopra's initial choice for the lead role.</p>
//             </div>
//           </article>

//           {/* 4. Wide Bento Item: Ranbir Kapoor */}
//           <article className="bento-item wide-item split-horizontal">
//             <div className="bento-content">
//               <span className="fact-category">Directing 🎬</span>
//               <h3>Shooting in Reverse</h3>
//               <p>To ensure seamless continuity with Ranbir Kapoor's long hairstyle as Jordan, director Imtiaz Ali shot <em>Rockstar</em> in reverse order—filming the emotional climax first and cutting his hair shorter as they went backward.</p>
//             </div>
//             <div className="image-wrapper">
//                <img 
//                  src="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop" 
//                  alt="Ranbir Kapoor in Rockstar" 
//                  className="bento-img" 
//                  loading="lazy" 
//                />
//             </div>
//           </article>

//           {/* 5. Tall Bento Item: Hrithik Roshan */}
//           <article className="bento-item tall-item has-bg">
//             <img 
//               src="https://i.scdn.co/image/ab67616d0000b2739b374358709e3d0bf1a0f9de" 
//               alt="Hrithik Roshan - Kaho Naa Pyaar Hai" 
//               className="bento-img" 
//               loading="lazy" 
//             />
//             <div className="image-overlay tall-overlay"></div>
//             <div className="bento-content">
//               <span className="fact-category">Hall of Fame 🌟</span>
//               <h3>The Ultimate Award Winner</h3>
//               <p>Hrithik Roshan's blockbuster debut in <em>Kaho Naa... Pyaar Hai</em> (2000) swept 92 awards, earning a place in the Guinness World Records for the most awards won by a single movie.</p>
//             </div>
//           </article>

//           {/* 6. Wide Bento Item: Shah Rukh Khan */}
//           <article className="bento-item wide-item split-horizontal flipped">
//             <div className="image-wrapper">
//               <img 
//                 src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv6_88iaQriJ2tz6KWFP9x3FIji0axH7kIGF_N3Dr9aA&s=10" 
//                 alt="Shah Rukh Khan" 
//                 className="bento-img" 
//                 loading="lazy" 
//               />
//             </div>
//             <div className="bento-content">
//               <span className="fact-category">Humble Beginnings 🎟️</span>
//               <h3>A ₹50 First Paycheck</h3>
//               <p>Before becoming the "King of Bollywood," Shah Rukh Khan earned just ₹50 for his very first job working as an usher at a Pankaj Udhas concert in Delhi. He spent it on a train ticket to see the Taj Mahal.</p>
//             </div>
//           </article>

//         </main>

//         <footer>
//           <p>&copy; 2026 QuickShow. Designed by GeekyPiyushh.</p>
//         </footer>
//       </div>
//     </div>
//   );
// }
// export default BollywoodFacts;