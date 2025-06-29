"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LuxuryLoadingProps {
  className?: string;
  message?: string;
  showMessage?: boolean;
}

export function LuxuryLoading({ 
  className, 
  message = "Refining Language...", 
  showMessage = true 
}: LuxuryLoadingProps) {
  const [currentLetter, setCurrentLetter] = useState(0);
  const [messageVisible, setMessageVisible] = useState(false);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    // Letter rotation every 400ms for smooth progression
    const letterInterval = setInterval(() => {
      setCurrentLetter((prev) => (prev + 1) % alphabet.length);
    }, 400);

    // Message fade in/out every 12 seconds
    const messageInterval = setInterval(() => {
      setMessageVisible(prev => !prev);
    }, 12000);

    // Initial message show after 2 seconds
    const initialTimeout = setTimeout(() => {
      setMessageVisible(true);
    }, 2000);

    return () => {
      clearInterval(letterInterval);
      clearInterval(messageInterval);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div className={cn(
      "relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden",
      "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
      className
    )}>
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-amber-100 to-transparent animate-pulse" />
      </div>

      {/* Main Compass Container */}
      <div className="relative">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full animate-pulse">
          <div className="w-64 h-64 rounded-full border border-amber-400/20 shadow-2xl shadow-amber-400/10" />
        </div>

        {/* Main Compass Ring */}
        <div className="relative w-64 h-64 rounded-full border-2 border-amber-400 shadow-inner animate-spin" style={{ animationDuration: '20s' }}>
          {/* Alphabet Letters */}
          {alphabet.map((letter, index) => {
            const angle = (index * 360) / alphabet.length;
            const isActive = index === currentLetter;
            
            return (
              <div
                key={letter}
                className="absolute w-6 h-6 flex items-center justify-center"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-110px) rotate(-${angle}deg)`,
                }}
              >
                <span
                  className={cn(
                    "text-sm font-serif transition-all duration-700 ease-out",
                    isActive 
                      ? "text-white drop-shadow-lg scale-110 font-bold" 
                      : "text-gray-400 scale-90"
                  )}
                >
                  {letter}
                </span>
              </div>
            );
          })}

          {/* Center Infinity Symbol */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl text-amber-400 font-serif animate-pulse drop-shadow-lg">
                ∞
              </span>
            </div>
          </div>

          {/* Inner Ring Highlight */}
          <div className="absolute inset-4 rounded-full border border-amber-400/30 shadow-inner" />
        </div>

        {/* Outer Decorative Elements */}
        <div className="absolute -inset-8">
          {[0, 90, 180, 270].map((angle, index) => (
            <div
              key={index}
              className="absolute w-2 h-2 bg-gray-400/40 rounded-full animate-pulse"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-140px)`,
                animationDelay: `${index * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading Message */}
      {showMessage && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <div
            className={cn(
              "transition-all duration-1000 ease-in-out",
              messageVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-gray-300 font-serif text-lg tracking-wider text-center">
              {message}
            </p>
            <p className="text-gray-500 font-serif text-sm tracking-widest text-center mt-2 italic">
              A Journey Through Every Word Ever Spoken
            </p>
          </div>
        </div>
      )}

      {/* Ambient Light Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full animate-bounce"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}