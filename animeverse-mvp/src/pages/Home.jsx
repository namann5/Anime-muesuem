import React, { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial } from "@react-three/drei";
import gsap from "gsap";
import ScenePortal from "../components/ScenePortal";

export default function Home({ onEnter }) {
  const containerRef = useRef();
  const heroRef = useRef();
  const bentoRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
      });

      // Bento items stagger
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
      gradient: "from-[#ff0055] to-[#7000ff]",
    },
    {
      id: 2,
      title: "3D Character Hub",
      desc: "Interact with your favorite characters in full 3D.",
      icon: "🖼️",
      class: "bento-item-2",
      gradient: "from-[#7000ff] to-[#00d4ff]",
    },
    {
      id: 3,
      title: "VR Museum",
      desc: "First-person history tour.",
      icon: "🏛️",
      class: "bento-item-3",
      gradient: "from-[#00d4ff] to-[#00ffa3]",
    },
    {
      id: 4,
      title: "Epic Timeline",
      desc: "Visual journey of anime evolution.",
      icon: "📅",
      class: "bento-item-4",
      gradient: "from-[#ff0055] to-[#ffa300]",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen mesh-gradient-modern selection:bg-pink-500/30"
    >
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="container mx-auto px-4 md:px-6 pt-24 md:pt-48 pb-12 md:pb-20 text-center hero-content"
        >
          <div className="inline-block px-4 py-1.5 glass-card-modern rounded-full text-xs font-bold tracking-widest uppercase mb-8 border-pink-500/30 text-pink-400">
            Evolution of Immersion
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-8xl font-black leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            EXPERIENCE THE
            <br />
            FUTURE OF ANIME
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-white/50 mb-8 md:mb-12 font-medium leading-relaxed">
            The world's first immersive anime ecosystem. Stream, explore, and
            interact with the history of animation in stunning 3D.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button
              onClick={() => {
                if (onEnter) onEnter();
                window.dispatchEvent(new CustomEvent("enterMuseum"));
              }}
              className="btn-modern btn-primary-modern text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 group"
            >
              Enter the Metaverse
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
            <button
              onClick={() => onEnter && onEnter()}
              className="btn-modern btn-secondary-modern text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4"
            >
              Explore Features
            </button>
          </div>

          {/* Scrolling Down Indicator */}
          <div className="mt-12 sm:mt-24 animate-bounce opacity-30">
            <div className="w-6 h-10 border-2 border-white rounded-full mx-auto relative">
              <div className="w-1 h-2 bg-white rounded-full absolute top-2 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </section>

        {/* Bento Grid Section */}
        <section
          ref={bentoRef}
          className="container mx-auto px-4 md:px-6 py-12 md:py-24"
        >
          <div className="mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tighter">
              OUR ECOSYSTEM
            </h2>
            <div className="h-1 w-20 bg-pink-500"></div>
          </div>

          <div className="bento-grid">
            {features.map((f) => (
              <div
                key={f.id}
                className={`bento-item glass-card-modern group cursor-pointer ${f.class}`}
                onClick={() => onEnter && onEnter()}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <div className="p-6 sm:p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">
                      {f.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed max-w-[220px] sm:max-w-[250px]">
                      {f.desc}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold tracking-widest text-white/30 group-hover:text-pink-400 transition-colors">
                    LEARN MORE{" "}
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
          <div className="glass-modern rounded-[3rem] p-4 h-[300px] md:h-[600px] relative overflow-hidden group">
            <div className="absolute inset-0 z-0">
              <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <spotLight
                  position={[10, 10, 10]}
                  angle={0.15}
                  penumbra={1}
                  intensity={1}
                  castShadow
                />
                <Suspense fallback={null}>
                  <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <ScenePortal />
                  </Float>
                </Suspense>
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
            </div>

            <div className="absolute top-12 left-12 z-10 max-w-sm pointer-events-none">
              <div className="glass-card-modern p-6 rounded-2xl border-white/10 backdrop-blur-3xl">
                <h3 className="text-2xl font-black mb-2 italic">
                  INTERACTIVE CORE
                </h3>
                <p className="text-sm text-white/50">
                  Experience the world's first interactive anime portal. Drag to
                  rotate the character view.
                </p>
              </div>
            </div>

            <div className="absolute bottom-12 right-12 z-10 pointer-events-none">
              <div className="flex gap-4">
                <div className="glass-card-modern p-4 rounded-xl text-center min-w-[100px]">
                  <div className="text-xl font-black text-pink-500">4K</div>
                  <div className="text-[10px] uppercase font-bold text-white/30">
                    Resolution
                  </div>
                </div>
                <div className="glass-card-modern p-4 rounded-xl text-center min-w-[100px]">
                  <div className="text-xl font-black text-purple-500">
                    60FPS
                  </div>
                  <div className="text-[10px] uppercase font-bold text-white/30">
                    Refresh Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-20 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xl font-black italic">ANIMEVERSE</div>
            <div className="flex gap-12 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Discord
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Twitter
              </a>
            </div>
            <div className="text-xs font-medium text-white/20">
              © 2025 ANIMEVERSE MVP. PROJECT REBORN.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
