import { Button } from '@styles/ui/button'
import { Input } from '@styles/ui/input'

export function CtaSection() {
  return (
    <section className="glass-panel rounded-lg p-7 sm:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            See your kitchen clearly.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Join the early access group and get a walkthrough tailored to your
            restaurant group.
          </p>
        </div>
        <form className="flex w-full max-w-sm gap-2" onSubmit={(event) => event.preventDefault()}>
          <Input placeholder="Work email" type="email" required />
          <Button type="submit">Request</Button>
        </form>
      </div>
    </section>
  )
}
