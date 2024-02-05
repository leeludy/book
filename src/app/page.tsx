import Link from "next/link"

import { api } from "~/trpc/server"
import { CreateLibrary } from "./_components/create-library"

export default async function Home() {
  const hello = await api.post.hello.query({ text: "from somewhere" })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Follow your <span className="text-[hsl(280,100%,70%)]">Books</span> around
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="https://create.t3.gg/en/usage/first-steps"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">First Steps →</h3>
            <div className="text-lg">
              Just the basics - Everything you need to set up your book and send it in the big
              world.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="https://create.t3.gg/en/introduction"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">About →</h3>
            <div className="text-lg">
              Learn more about the nomad books concept, the street libraries it uses, and how it s
              been created.
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">{hello ? hello.greeting : "Loading tRPC query..."}</p>
        </div>

        <CrudShowcase />
      </div>
    </main>
  )
}

async function CrudShowcase() {
  const latestBook = await api.book.getLatest.query()

  return (
    <div className="w-full max-w-xs">
      {latestBook ? (
        <p className="truncate">Your most recent added book: {latestBook.title}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <CreateLibrary />
    </div>
  )
}
