"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5"; // Back icon

export default function DataStructurePage({ params }) {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [dataStructure, setDataStructure] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    }
    fetchParams();
  }, [params]);

  useEffect(() => {
    if (id !== null) {
      const storedItems = sessionStorage.getItem("dataStructures");
      if (storedItems) {
        const parsedData = JSON.parse(storedItems);
        if (parsedData[id]) {
          setDataStructure(parsedData[id]);
        }
      }
    }
  }, [id]);

  const handleEditClick = (index) => {
    if (!dataStructure || !dataStructure.paragraphs) return;
    setEditingIndex(index);
    setEditedText(dataStructure.paragraphs[index].text);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && dataStructure) {
      const updatedData = { ...dataStructure };
      updatedData.paragraphs[editingIndex].text = editedText;

      const storedItems = JSON.parse(sessionStorage.getItem("dataStructures"));
      storedItems[id] = updatedData;
      sessionStorage.setItem("dataStructures", JSON.stringify(storedItems));

      setDataStructure(updatedData);
      setEditingIndex(null);
    }
  };

  const handleDelete = () => {
    const storedItems = JSON.parse(sessionStorage.getItem("dataStructures"));
    storedItems.splice(id, 1);
    sessionStorage.setItem("dataStructures", JSON.stringify(storedItems));
    router.push("/");
  };

  const handleBack = () => {
    router.push("/"); // Navigate back to Data Structures list
  };

  return (
    <div className="flex h-screen bg-purple-100">
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
      <main className="flex-1 px-12 py-8 flex flex-col">
        {/* Search Bar */}
        <div className="relative flex items-center mb-6 w-full max-w-3xl">
          <FiSearch className="absolute left-4 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search Data Structure by Name"
            className="w-full py-3 pl-12 pr-4 bg-white rounded-full shadow-md border focus:outline-none"
          />
        </div>

        {dataStructure ? (
          <>
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center text-purple-600 font-bold mb-6 hover:text-purple-800 transition"
            >
              <IoArrowBack size={24} className="mr-2" /> Back to Data Structures
            </button>

            {/* Title and Heart Button */}
            <div className="flex justify-between items-center">
              <h1 className="text-5xl font-bold text-black">{dataStructure.title}</h1>
              <button onClick={() => setIsFavorite(!isFavorite)}>
                {isFavorite ? (
                  <FaHeart className="text-pink-500" size={30} />
                ) : (
                  <FaRegHeart className="text-gray-400" size={30} />
                )}
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-700 mt-2 text-lg">{dataStructure.description}</p>

            {/* Grid Layout for Paragraphs & Images */}
            <div className="mt-6 space-y-6">
              {dataStructure.paragraphs.map((para, index) => (
                <div
                  key={index}
                  className="flex items-center bg-white p-4 rounded-lg shadow-md cursor-pointer"
                >
                  {/* Left: Paragraph */}
                  <div className="w-2/3 pr-4">
                    {editingIndex === index ? (
                      <div>
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p
                        className="text-gray-700 hover:underline cursor-pointer"
                        onClick={() => handleEditClick(index)}
                      >
                        {para.text}
                      </p>
                    )}
                  </div>

                  {/* Right: Image or Placeholder */}
                  <div className="w-1/3 flex justify-center">
                    {para.file ? (
                      <img
                        src={para.file}
                        alt={`Image for paragraph ${index}`}
                        className="w-[400px] h-[400px] object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-[400px] h-[400px] bg-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No Image Available</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Delete Button at Bottom */}
            <div className="mt-auto flex justify-center pb-10">
              <button
                onClick={handleDelete}
                className="bg-white text-purple-500 text-lg font-bold px-10 py-4 rounded-full shadow-lg hover:text-purple-700 transition"
              >
                Delete data structure
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-600 text-xl font-semibold">🔄 Loading...</p>
        )}
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
