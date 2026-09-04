import React, { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import gsap from "gsap";
import ScenePortal from "../components/ScenePortal";

export default function Home({ onEnter }) {
  const containerRef = useRef();
  const heroRef = useRef();
  const bentoRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
      });

      gsap.from(".bento-item", {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: bentoRef.current,
          start: "top 80%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      id: 1,
      title: "Cinematic Streaming",
      desc: "High-definition anime library with zero ads and instant playback.",
      icon: "🎬",
      class: "bento-item-1",
      gradient: "from-[#D97A5C]/20 to-[#8F8577]/10",
    },
    {
      id: 2,
      title: "3D Character Hub",
      desc: "Interact with your favorite characters in full 3D.",
      icon: "🖼️",
      class: "bento-item-2",
      gradient: "from-[#8F8577]/20 to-[#6C808D]/10",
    },
    {
      id: 3,
      title: "VR Museum",
      desc: "First-person history tour.",
      icon: "🏛️",
      class: "bento-item-3",
      gradient: "from-[#6C808D]/20 to-[#6FA08C]/10",
    },
    {
      id: 4,
      title: "Epic Timeline",
      desc: "Visual journey of anime evolution.",
      icon: "📅",
      class: "bento-item-4",
      gradient: "from-[#D97A5C]/20 to-[#C98C4C]/10",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen mesh-gradient-modern selection:bg-anime-terracotta/30"
    >
      {/* Warm ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-anime-terracotta/[0.06] blur-[130px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-anime-terracotta-soft/[0.05] blur-[130px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="container mx-auto px-4 md:px-6 pt-28 md:pt-44 pb-12 md:pb-20 text-center hero-content"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-card-modern rounded-full mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-anime-terracotta"></span>
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-anime-cream/70">
              Evolution of immersion
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[0.95] mb-10 tracking-tighter">
            EXPERIENCE THE
            <br />
            FUTURE OF{" "}
            <span className="font-serif-accent font-normal text-anime-terracotta-soft">
              anime
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-anime-cream/50 mb-10 md:mb-12 font-medium leading-relaxed">
            The world's first immersive anime ecosystem. Stream, explore, and
            interact with the history of animation in stunning 3D.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button
              onClick={() => {
                if (onEnter) onEnter();
                window.dispatchEvent(new CustomEvent("enterMuseum"));
              }}
              className="btn-modern btn-primary-modern text-base sm:text-lg px-7 sm:px-10 py-3.5 sm:py-4 group"
            >
              Enter the Museum
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
            <button
              onClick={() => onEnter && onEnter()}
              className="btn-modern btn-secondary-modern text-base sm:text-lg px-7 sm:px-10 py-3.5 sm:py-4"
            >
              Explore Features
            </button>
          </div>

          {/* Scrolling Down Indicator */}
          <div className="mt-14 sm:mt-24 animate-bounce opacity-20">
            <div className="w-5 h-9 border border-anime-cream/40 rounded-full mx-auto relative">
              <div className="w-1 h-2 bg-anime-cream/60 rounded-full absolute top-2 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </section>

        {/* Bento Grid Section */}
        <section
          ref={bentoRef}
          className="container mx-auto px-4 md:px-6 py-12 md:py-24"
        >
          <div className="mb-16 flex items-end justify-between">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-3 tracking-tighter">
                OUR <span className="font-serif-accent font-normal text-anime-terracotta-soft">ecosystem</span>
              </h2>
              <div className="h-px w-16 bg-anime-terracotta/60"></div>
            </div>
            <p className="hidden md:block max-w-xs text-sm text-anime-cream/40 font-medium leading-relaxed">
              Four disciplines. One continuous, living collection of anime
              history.
            </p>
          </div>

          <div className="bento-grid">
            {features.map((f) => (
              <div
                key={f.id}
                className={`bento-item glass-card-modern group cursor-pointer ${f.class}`}
                onClick={() => onEnter && onEnter()}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                ></div>
                <div className="p-6 sm:p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left grayscale group-hover:grayscale-0">
                      {f.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-anime-cream/45 text-sm leading-relaxed max-w-[220px] sm:max-w-[250px]">
                      {f.desc}
                    </p>
                  </div>
                  <div className="flex items-center text-[11px] font-bold tracking-[0.15em] text-anime-cream/25 group-hover:text-anime-terracotta-soft transition-colors uppercase">
                    Discover{" "}
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Immersive Preview */}
        <section className="container mx-auto px-4 md:px-6 py-12 md:py-24">
          <div className="glass-modern rounded-[2rem] md:rounded-[3rem] p-4 h-[320px] md:h-[600px] relative overflow-hidden group">
            <div className="absolute inset-0 z-0">
              <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 50 }}>
                <ambientLight intensity={0.35} />
                <directionalLight
                  position={[5, 8, 5]}
                  intensity={0.5}
                  castShadow
                />
                <spotLight
                  position={[0, 5, 3]}
                  angle={0.3}
                  penumbra={1}
                  intensity={0.9}
                  color="#E1E0CC"
                  castShadow
                />
                <Suspense fallback={null}>
                  <Float speed={2} rotationIntensity={0.4} floatIntensity={0.4}>
                    <ScenePortal />
                  </Float>
                </Suspense>
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
            </div>

            <div className="absolute top-10 left-8 sm:top-12 sm:left-12 z-10 max-w-sm pointer-events-none">
              <div className="glass-card-modern p-5 sm:p-6 rounded-2xl">
                <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
                  THE INTERACTIVE{" "}
                  <span className="font-serif-accent font-normal text-anime-terracotta-soft">
                    core
                  </span>
                </h3>
                <p className="text-sm text-anime-cream/50 leading-relaxed">
                  Experience the world's first interactive anime portal. Drag to
                  rotate the character view.
                </p>
              </div>
            </div>

            <div className="absolute bottom-10 right-8 sm:bottom-12 sm:right-12 z-10 pointer-events-none">
              <div className="flex gap-4">
                <div className="glass-card-modern p-4 rounded-xl text-center min-w-[90px]">
                  <div className="text-xl font-black text-anime-terracotta">4K</div>
                  <div className="text-[9px] uppercase font-bold text-anime-cream/30 tracking-[0.15em]">
                    Resolution
                  </div>
                </div>
                <div className="glass-card-modern p-4 rounded-xl text-center min-w-[90px]">
                  <div className="text-xl font-black text-anime-cream/80">60FPS</div>
                  <div className="text-[9px] uppercase font-bold text-anime-cream/30 tracking-[0.15em]">
                    Render
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-16 border-t border-anime-line">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xl font-black tracking-tight">
              ANIME
              <span className="font-serif-accent font-normal text-anime-terracotta-soft">
                verse
              </span>
            </div>
            <div className="flex gap-10 text-sm text-anime-cream/35">
              <a href="#" className="hover:text-anime-cream transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-anime-cream transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-anime-cream transition-colors">
                Discord
              </a>
              <a href="#" className="hover:text-anime-cream transition-colors">
                Twitter
              </a>
            </div>
            <div className="text-xs font-medium text-anime-cream/20 tracking-wide">
              © 2026 ANIMEVERSE — MUSEUM. PROJECT REBORN.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}