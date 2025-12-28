import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import UPIQRCode from '../components/UPIQRCode'

export default function Support() {
  const containerRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.support-content > *', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen mesh-gradient-modern selection:bg-pink-500/30 pt-32 pb-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-[35%] h-[35%] bg-pink-500/8 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-purple-500/8 blur-[100px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 support-content">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 glass-card-modern rounded-full text-xs font-bold tracking-widest uppercase mb-6 border-pink-500/30 text-pink-400">
            Support the Project
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            FUEL THE<br />ANIMEVERSE
          </h1>
          <p className="max-w-xl mx-auto text-white/50 text-lg">
            Your support keeps the servers running and helps us bring more immersive anime experiences to life.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Scan to Donate</h2>
            <p className="text-sm text-white/40">Use any UPI app — GPay, PhonePe, Paytm, etc.</p>
          </div>

            <div className="flex justify-center mb-10">
              <UPIQRCode vpa="singh.4481@superyes" payeeName="AnimeVerse" transactionNote="Support AnimeVerse" size={200} />
            </div>

          <div className="grid grid-cols-3 gap-4 mb-12">
            {['₹49', '₹99', '₹199'].map((amt) => (
              <button
                key={amt}
                className="glass-card-modern p-4 rounded-xl text-center hover:border-pink-500/50 transition-colors group"
              >
                <span className="text-xl font-black group-hover:text-pink-400 transition-colors">{amt}</span>
              </button>
            ))}
          </div>

          <div className="glass-card-modern p-6 rounded-2xl border border-white/10 text-center">
            <p className="text-sm text-white/40 leading-relaxed">
              All contributions directly support development, hosting, and future features. Thank you for believing in our vision.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
