export default function BrowserShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full p-3 sm:p-6">
      <section className="mx-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-[1700px] flex-col overflow-hidden rounded-3xl border border-white/90 bg-white/70 shadow-[0_24px_64px_-24px_rgba(16,185,129,0.35)] backdrop-blur-xl sm:h-[calc(100dvh-3rem)] sm:rounded-[28px]">
        {children}
      </section>
    </main>
  );
}
