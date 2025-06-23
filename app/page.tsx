import { Suspense } from "react";
import DictionarySearch from "@/components/dictionary-search";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthDialog } from "@/components/auth-dialog";

export default function Home() {
  return (
    <main className="light-gradient">
      <div className="sparrow-gradient flex h-screen w-full flex-col items-center justify-center p-4 md:p-8">
        <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col">
          <header className="mb-4 md:mb-8 flex-1 text-center">
            <div className="absolute right-2 top-2 md:right-4 md:top-4 flex items-center gap-1 md:gap-2">
              <AuthDialog />
              <ModeToggle />
            </div>
            <h1 className="mt-4 md:mt-8 text-3xl md:text-4xl lg:text-5xl font-bold">Sendelly</h1>
          </header>

          <div className="px-2 md:px-0">
            <Suspense fallback={<div>Loading...</div>}>
              <DictionarySearch />
            </Suspense>
          </div>

          <div className="flex-1"></div>
        </div>
      </div>
    </main>
  );
}