import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <main className="flex flex-col items-center text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Welcome to AssetCore
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive asset management platform for tracking, maintaining, and optimizing your physical assets and components.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white font-medium h-11 px-8 transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-background font-medium h-11 px-8 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
