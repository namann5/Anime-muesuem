import React from "react";

export const AnimeGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-pulse">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[2/3] bg-white/5 rounded-xl"></div>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/5 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

export const HeroSkeleton = () => {
  return (
    <div className="w-full h-[70vh] bg-white/5 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-anime-dark via-transparent to-transparent"></div>
      <div className="absolute bottom-20 left-10 space-y-4 w-full max-w-2xl">
        <div className="h-12 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/5 rounded w-full"></div>
        <div className="h-4 bg-white/5 rounded w-5/6"></div>
        <div className="flex gap-4">
          <div className="h-12 bg-white/20 rounded-full w-32"></div>
          <div className="h-12 bg-white/10 rounded-full w-32"></div>
        </div>
      </div>
    </div>
  );
};
