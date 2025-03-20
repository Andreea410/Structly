"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-purple-200">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-300 p-6 text-black">
        <h1 className="text-3xl font-bold mb-6">Welcome User!</h1>
        <nav className="space-y-4">
          <NavItem text="Dashboard" />
          <NavItem text="Data Structures" active />
          <NavItem text="Verify your knowledge" />
          <NavItem text="Profile" />
          <NavItem text="Leaderboard" />
          <NavItem text="Favorites" />
        </nav>
        <div className="mt-10 space-y-3">
          <NavItem text="Settings" />
          <NavItem text="Log Out" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Search Bar */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Search Data Structure by Name"
            className="w-96 p-3 rounded-xl bg-white shadow-md focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
              You have 12 new action items!
            </span>
            <span className="bg-white p-3 rounded-full shadow-md">🔔</span>
            <span className="bg-white p-3 rounded-full shadow-md">⚪</span>
          </div>
        </div>

        {/* Data Structure List */}
        <div className="mt-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <DataStructureCard key={i} />
          ))}
        </div>

        {/* Add Data Structure Button */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => router.push("/add-data-structure")}
            className="bg-white text-purple-500 text-lg font-bold px-10 py-4 rounded-full shadow-lg hover:text-purple-700 transition"
          >
            Add new <span className="underline">data structure</span>
          </button>
        </div>
      </main>
    </div>
  );
}

// Sidebar Navigation Item
function NavItem({ text, active }) {
  return (
    <div className={`flex items-center space-x-3 ${active ? "text-purple-600 font-bold" : "text-gray-700"} cursor-pointer`}>
      <span>•</span>
      <span>{text}</span>
    </div>
  );
}

// Data Structure Card
function DataStructureCard() {
  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
      <img src="https://i.ytimg.com/vi/Qmt0QwzEmh0/maxresdefault.jpg" width={250} height={250} alt="Thumbnail" className="rounded-lg" />
      <div className="ml-4">
        <h3 className="text-lg font-bold text-gray-700">Data Structure</h3>
        <p className="text-gray-500 text-sm">content content content content content content content</p>
      </div>
      <button className="ml-auto bg-purple-500 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700">
        Show more
      </button>
    </div>
  );
}
