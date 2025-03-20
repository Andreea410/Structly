"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DataStructurePage({ params }) {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [dataStructure, setDataStructure] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");

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
        setDataStructure(parsedData[id]);
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
    router.push("/"); 
  };

  return (
    <div className="flex h-screen bg-purple-200">
      <aside className="w-64 bg-purple-300 p-6 text-black">
        <h1 className="text-3xl font-bold mb-6">Welcome User!</h1>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {dataStructure ? (
          <>
            {/* Title and Description */}
            <h1 className="text-4xl font-bold text-white">{dataStructure.title}</h1>
            <p className="text-white mt-4">{dataStructure.description}</p>

            {/* Display Paragraphs and Images */}
            <div className="mt-6 space-y-6">
              {dataStructure.paragraphs.map((para, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md cursor-pointer">
                  {/* Check if in edit mode */}
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

                  {/* Render image if present */}
                  {para.file && typeof para.file === "string" && (
                    <img
                      src={para.file}
                      alt={`Uploaded content ${index}`}
                      className="mt-2 w-full rounded-md shadow-md"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Buttons Section */}
            <div className="mt-8 flex gap-20">
              {/*  Back Button */}
              <button
                onClick={handleBack}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700 transition-all"
              >
                ⬅ Back
              </button>

              {/* 🔹 Delete Button */}
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-all"
              >
                🗑 Delete Data Structure
              </button>
            </div>
          </>
        ) : (
          <p className="text-white text-xl font-semibold">🔄 Loading...</p>
        )}
      </main>
    </div>
  );
}
