import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight text-center">
        Stop chasing unpaid invoices.
      </h1>
      <p className="max-w-xl text-center text-lg text-gray-600">
        Send invoices. We automatically remind your clients until they pay.
        Add late fees. Get paid faster.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        Login
      </Link>
    </main>
  );
}
