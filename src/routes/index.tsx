import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Charlie Oconus" },
      { name: "description", content: "The home of Charlie Oconus." },
      { property: "og:title", content: "Charlie Oconus" },
      { property: "og:description", content: "The home of Charlie Oconus." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <h1 className="text-center font-display text-5xl font-semibold tracking-tight text-primary sm:text-7xl">
        CHARLIE OCONUS
      </h1>
    </main>
  );
}
