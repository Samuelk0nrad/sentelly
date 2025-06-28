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
      "bg-gradient-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#1A1A1A]",
      className
    )}>
      {/* Breathing Background Texture */}
      <div className="absolute inset-0 opacity-[0.02] animate-breathing">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#D4D0CD]/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4D0CD" fill-opacity="0.05"%3E%3Cpath d="M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      </div>

      {/* Main Compass Container */}
      <div className="relative">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full animate-compass-glow">
          <div className="w-64 h-64 rounded-full border border-[#FFD700]/20 shadow-[0_0_60px_rgba(255,215,0,0.1)]" />
        </div>

        {/* Main Compass Ring */}
        <div className="relative w-64 h-64 rounded-full border-2 border-[#FFD700] shadow-[inset_0_0_30px_rgba(255,215,0,0.2),0_0_40px_rgba(255,215,0,0.15)] animate-compass-rotate">
          {/* Golden Refraction Band */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-0 left-1/2 w-32 h-8 -translate-x-1/2 -translate-y-4 bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent blur-sm animate-refraction-sweep" />
          </div>

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
                      ? "text-[#FDFCF7] drop-shadow-[0_0_8px_rgba(253,252,247,0.6)] scale-110" 
                      : "text-[#D4D0CD]/60 scale-90"
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
              <span className="text-2xl text-[#FFD700] font-serif animate-center-pulse drop-shadow-[0_0_12px_rgba(255,215,0,0.4)]">
                ∞
              </span>
            </div>
          </div>

          {/* Inner Ring Highlight */}
          <div className="absolute inset-4 rounded-full border border-[#FFD700]/30 shadow-[inset_0_0_20px_rgba(255,215,0,0.1)]" />
        </div>

        {/* Outer Decorative Elements */}
        <div className="absolute -inset-8">
          {[0, 90, 180, 270].map((angle, index) => (
            <div
              key={index}
              className="absolute w-2 h-2 bg-[#D4D0CD]/40 rounded-full animate-pulse"
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
              "transition-all duration-[3000ms] ease-in-out",
              messageVisible 
                ? "opacity-100 translate-y-0 blur-0" 
                : "opacity-0 translate-y-4 blur-sm"
            )}
          >
            <p className="text-[#D4D0CD]/80 font-serif text-lg tracking-wider text-center">
              {message}
            </p>
            <p className="text-[#D4D0CD]/40 font-serif text-sm tracking-widest text-center mt-2 italic">
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
            className="absolute w-1 h-1 bg-[#FFD700]/20 rounded-full animate-float"
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