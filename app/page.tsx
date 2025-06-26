import { Suspense } from "react";
import DictionarySearch from "@/components/dictionary-search";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthDialog } from "@/components/auth-dialog";

export default function Home() {
  return (
    <main className="light-gradient min-h-screen">
      <div className="sparrow-gradient flex min-h-screen w-full flex-col p-2 sm:p-4 md:p-6 lg:p-8">
        {/* Hackathon Badge - Upper Left Corner */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6 z-10">
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-transform hover:scale-105"
          >
            <img
              src="/black_circle_360x360.svg"
              alt="World's Largest Hackathon Badge"
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
            />
          </a>
        </div>

        <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col">
          {/* Header with responsive navigation */}
          <header className="mb-4 sm:mb-6 md:mb-8 lg:mb-12 flex items-center justify-between">
            <div className="flex-1" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white text-center">
              Sentelly
            </h1>
            <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
              <ModeToggle />
              <AuthDialog />
            </div>
          </header>

          {/* Main content area - this will handle the vertical centering */}
          <div className="flex-1 flex flex-col">
            <div className="w-full max-w-6xl mx-auto">
              <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="text-white/60 text-sm sm:text-base">Loading...</div>
                </div>
              }>
                <DictionarySearch />
              </Suspense>
            </div>
          </div>

          {/* Footer spacer */}
          <div className="h-4 sm:h-6 md:h-8 lg:h-12" />
        </div>
      </div>
    </main>
  );
}