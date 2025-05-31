import { Suspense } from 'react';
import DictionarySearch from '@/components/dictionary-search';
import { ModeToggle } from '@/components/mode-toggle';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center p-4 md:p-8 sparrow-gradient">
      <div className="max-w-[1200px] flex flex-col h-full w-full mx-auto">
        <header className="mb-8 flex-1 text-center">
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-8">Sendelly</h1>
        </header>

        <div className="">
          <Suspense fallback={<div>Loading...</div>}>
            <DictionarySearch />
          </Suspense>
        </div>

        <div className="flex-1"></div>
      </div>
    </main>
  );
}
