"use client"; // Ensure it's a client component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi"; // Search icon

export default function HomePage() {
  const router = useRouter();
  const [dataStructures, setDataStructures] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 Search state

  useEffect(() => {
    const isVisited = sessionStorage.getItem("visited");
    const storedItems = sessionStorage.getItem("dataStructures");

    if (!isVisited) {
      console.log("First visit or page refresh detected. Clearing session storage.");
      sessionStorage.removeItem("dataStructures");
      setDataStructures([]);
      sessionStorage.setItem("visited", "true");
    } else if (storedItems) {
      console.log("Loading stored data structures...");
      setDataStructures(JSON.parse(storedItems));
    }

    const loadData = () => {
      const updatedData = sessionStorage.getItem("dataStructures");
      if (updatedData) {
        setDataStructures(JSON.parse(updatedData));
      }
    };

    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  // 🔹 Filter data structures based on search query
  const filteredDataStructures = dataStructures.filter((ds) =>
    ds.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔹 Handle Delete Data Structure
  const handleDelete = (index) => {
    const updatedList = [...dataStructures];
    updatedList.splice(index, 1); // Remove selected item
    setDataStructures(updatedList);
    sessionStorage.setItem("dataStructures", JSON.stringify(updatedList));
  };

  // 🔹 Handle View Page Navigation
  const handleViewPage = (index) => {
    router.push(`/data-structure/${index}`); 
  };

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
        {/* 🔹 Enhanced Search Bar */}
        <div className="relative flex items-center mb-6 w-full max-w-3xl">
        {/* Search Icon Inside Input */}
          <FiSearch className="absolute left-4 text-gray-500" size={22} />
  
          <input
            type="text"
            placeholder="🔎 Search Data Structures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-12 pr-4 text-lg bg-white rounded-full shadow-lg border border-gray-300 
               focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-500"
            />
        </div>


        <h2 className="text-2xl font-bold mb-4">Data Structures</h2>

        {/* Display filtered data structures */}
        <div className="space-y-4">
          {filteredDataStructures.length === 0 ? (
            <p className="text-gray-600">No matching data structures found.</p>
          ) : (
            filteredDataStructures.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-700">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>

                {/* Buttons */}
                {/* Buttons */}
<div className="flex space-x-2">
  {/* View Page Button */}
  <button
    onClick={() => handleViewPage(index)}
    className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:bg-green-700 hover:shadow-lg"
  >
    View
  </button>

  {/* Delete Button */}
  <button
    onClick={() => handleDelete(index)}
    className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:bg-red-700 hover:shadow-lg"
  >
    Delete
  </button>
</div>

              </div>
            ))
          )}
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
    <div
      className={`flex items-center space-x-3 ${
        active ? "text-purple-600 font-bold" : "text-gray-700"
      } cursor-pointer`}
    >
      <span>•</span>
      <span>{text}</span>
    </div>
  );
}
