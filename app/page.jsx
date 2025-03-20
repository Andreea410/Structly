"use client"; // Ensure it's a client component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [dataStructures, setDataStructures] = useState([]);

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

  const handleDelete = (index) => {
    const updatedList = [...dataStructures];
    updatedList.splice(index, 1); 
    setDataStructures(updatedList);
    sessionStorage.setItem("dataStructures", JSON.stringify(updatedList));
  };

  const handleViewPage = (index) => {
    router.push(`/data-structure/${index}`); // Navigate to details page
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
        <h2 className="text-2xl font-bold mb-4">Data Structures</h2>

        {/* Display added data structures */}
        <div className="space-y-4">
          {dataStructures.length === 0 ? (
            <p className="text-gray-600">No data structures added yet.</p>
          ) : (
            dataStructures.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-700">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-2">
                  {/* View Page Button */}
                  <button
                    onClick={() => handleViewPage(index)}
                    style={{ backgroundColor: "green", color: "white", padding: "5px 10px" }}
                  >
                    View
                  </button>


                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700"
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
