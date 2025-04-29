"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function DataStructurePage() {
  const router = useRouter();
  const { id } = useParams();
  const [dataStructure, setDataStructure] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchEntity = async () => {
      if (!id) return;
  
      try {
        const res = await fetch(`/api/entities/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDataStructure(data);
  
          const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
          setIsFavorite(favorites.includes(data.id || data._id));
        } else {
          alert("Failed to load data structure.");
        }
      } catch (err) {
        console.error("Error fetching entity:", err);
      }
    };
  
    fetchEntity();
  }, [id]);
  

  const handleEditClick = (index) => {
    if (!dataStructure?.paragraphs) return;
    setEditingIndex(index);
    setEditedText(dataStructure.paragraphs[index].text);
  };

  const handleSaveEdit = async () => {
    if (editingIndex !== null && dataStructure) {
      try {
        const updatedParagraphs = [...dataStructure.paragraphs];
        updatedParagraphs[editingIndex].text = editedText;
  
        const updated = {
          ...dataStructure,
          paragraphs: updatedParagraphs,
        };
  
        const res = await fetch(`/api/entities/${dataStructure.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
  
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update");
        }
  
        const json = await res.json();
        setDataStructure(json);
        setEditingIndex(null);
      } catch (err) {
        console.error("Update error:", err);
        alert(err.message || "Failed to update");
      }
    }
  };

const handleDelete = async () => {
  const res = await fetch(`/api/entities/${dataStructure.id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    router.push("/");
  } else {
    alert("Failed to delete.");
  }
};


  const handleBack = () => {
    router.push("/");
  };

  const toggleFavorite = () => {
    if (!dataStructure) return;
    
    const favorites = JSON.parse(sessionStorage.getItem("favorites") || "[]");
    const newFavorites = isFavorite
      ? favorites.filter(favId => favId !== dataStructure.id)
      : [...favorites, dataStructure.id];
    
    sessionStorage.setItem("favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-purple-100 flex">
      <aside className="w-64 bg-purple-300 p-6 text-black flex-shrink-0 h-screen sticky top-0">
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

      <main className="flex-1 px-8 py-6 bg-white min-h-screen">
        <button
          onClick={handleBack}
          className="flex items-center text-purple-600 font-bold mb-6 hover:text-purple-800 transition"
        >
          <svg className="mr-2" fill="currentColor" height="24" viewBox="0 0 512 512" width="24">
            <path d="M244 400 100 256l144-144M120 256h292" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="48"/>
          </svg>
          Back to Data Structures
        </button>

        {dataStructure ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-purple-800">{dataStructure.title}</h1>
              <button 
                onClick={toggleFavorite}
                className="p-2 hover:bg-purple-100 rounded-full transition"
              >
                {isFavorite ? (
                  <FaHeart className="text-pink-500" size={28} />
                ) : (
                  <FaRegHeart className="text-gray-400 hover:text-pink-300" size={28} />
                )}
              </button>
            </div>

            <p className="text-gray-700 text-lg mb-8 border-b pb-6">{dataStructure.description}</p>

            <div className="space-y-8">
              {dataStructure.paragraphs?.map((para, index) => (
                <div key={index} className={`group flex flex-col md:flex-row gap-6 p-6 rounded-xl transition-all ${para.link?.file ? 'bg-white shadow-lg' : 'bg-purple-50'}`}>
                  <div className={`flex-1 ${para.link?.file ? 'md:w-2/3' : 'w-full'}`}>
                    {editingIndex === index ? (
                      <div className="space-y-4">
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full p-4 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={5}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative" onClick={() => handleEditClick(index)}>
                        <p className="text-gray-700 text-lg leading-relaxed cursor-text group-hover:bg-purple-50 p-2 rounded transition">
                          {para.text}
                        </p>
                        <span className="absolute -left-6 top-0 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition">
                          Click to edit
                        </span>
                      </div>
                    )}
                  </div>

                  {para.link?.file && (
                    <div className="md:w-1/3 flex justify-center items-start">
                      {para.link.type === 'video' ? (
                        <video controls className="w-full max-w-md rounded-lg shadow-md" src={para.link.file.data}/>
                      ) : (
                        <img
                          src={para.link.file.data}
                          alt={`Content for ${dataStructure.title}`}
                          className="w-full max-w-md h-auto rounded-lg shadow-md object-cover"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='16' dy='.35em' text-anchor='middle' x='200' y='150'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-purple-700">Comments</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const commentText = e.target.comment.value;
                const res = await fetch("/api/comments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: commentText, dataStructureId: dataStructure._id }),
                });
                if (res.ok) {
                  const newComment = await res.json();
                  setDataStructure((prev) => ({
                    ...prev,
                    comments: [...(prev.comments || []), newComment],
                  }));
                  e.target.reset();
                } else {
                  alert("Failed to post comment");
                }
              }}
              className="space-y-4"
            >
              <textarea
                name="comment"
                placeholder="Write your thoughts..."
                className="w-full p-4 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows="3"
              ></textarea>
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Add Comment
              </button>
            </form>

            <div className="mt-6 space-y-4">
              {(dataStructure.comments || []).map((comment, idx) => (
                <div
                  key={idx}
                  className="bg-purple-50 border border-purple-200 p-4 rounded-lg shadow-sm"
                >
                  <p className="text-gray-800">{comment.text}</p>
                  <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>


            <div className="mt-12 flex justify-center">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-8 py-3 rounded-full shadow-lg hover:bg-red-600 transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Delete Data Structure
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600 text-xl font-semibold animate-pulse">
              Loading content...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function NavItem({ text, active }) {
  return (
    <div className={`flex items-center space-x-3 p-2 rounded-lg transition ${active ? "text-purple-700 bg-purple-100 font-bold" : "text-gray-700 hover:bg-purple-50"} cursor-pointer`}>
      <span>•</span>
      <span>{text}</span>
    </div>
  );
}