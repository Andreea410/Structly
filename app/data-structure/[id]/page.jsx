"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiArrowLeft, FiEdit3, FiTrash2, FiMessageCircle, FiHeart } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";

export default function DataStructurePage() {
  const router = useRouter();
  const { id } = useParams();
  const [dataStructure, setDataStructure] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchEntity = async () => {
      if (!id) return;
  
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/entities/${id}`, { headers });
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
      } finally {
        setLoading(false);
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
      const token = localStorage.getItem("token");
  
      if (!token) {
        alert("You need to log in to edit anything or to add any data structure.");
        return;
      }
  
      try {
        const updatedParagraphs = [...dataStructure.paragraphs];
        updatedParagraphs[editingIndex].text = editedText;
  
        const updated = {
          ...dataStructure,
          paragraphs: updatedParagraphs,
        };
  
        const res = await fetch(`/api/entities/${dataStructure._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        });
  
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const message = errorData.error || "Failed to update";  
          console.warn("Update blocked:", message);
          alert(message); 
          return; 
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
    const confirmDelete = confirm("Are you sure you want to delete this data structure?");
    if (!confirmDelete) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to delete this data structure.");
      return;
    }
  
    try {
      const res = await fetch(`/api/entities/${dataStructure._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        router.push("/");
      } else {
        const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
        alert("Delete failed: " + error);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed. Check console.");
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
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
        setCommentText("");
      } else {
        alert("Failed to post comment");
      }
    } catch (err) {
      console.error("Comment error:", err);
      alert("Failed to post comment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 text-lg font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!dataStructure) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-600 text-lg font-medium">Data structure not found</p>
          <Button onClick={handleBack} className="mt-4">
            <FiArrowLeft className="mr-2" />
            Back to Data Structures
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={handleBack}
              variant="outline"
              className="mb-6 text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <FiArrowLeft className="mr-2" />
              Back to Data Structures
            </Button>

            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-purple-800 mb-2">{dataStructure.title}</h1>
                <p className="text-gray-600 text-lg">{dataStructure.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {dataStructure.usageCount || 0} views
                  </Badge>
                  <Badge variant="outline" className="border-purple-200 text-purple-600">
                    {dataStructure.paragraphs?.length || 0} sections
                  </Badge>
                </div>
              </div>
              <Button
                onClick={toggleFavorite}
                variant="ghost"
                size="lg"
                className="text-2xl hover:bg-purple-50"
              >
                {isFavorite ? (
                  <FiHeart className="text-pink-500 fill-current" />
                ) : (
                  <FiHeart className="text-gray-400 hover:text-pink-300" />
                )}
              </Button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6 mb-12">
            {dataStructure.paragraphs?.map((para, index) => (
              <Card key={index} className="overflow-hidden border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`grid gap-6 ${para.link?.file ? 'md:grid-cols-3' : 'grid-cols-1'}`}>
                    <div className={`${para.link?.file ? 'md:col-span-2' : 'col-span-1'}`}>
                      {editingIndex === index ? (
                        <div className="space-y-4">
                          <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full p-4 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            rows={6}
                          />
                          <div className="flex gap-3">
                            <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700">
                              <FiEdit3 className="mr-2" />
                              Save Changes
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingIndex(null)}
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="relative group cursor-text"
                          onClick={() => handleEditClick(index)}
                        >
                          <p className="text-gray-700 text-lg leading-relaxed group-hover:bg-purple-50 p-4 rounded-lg transition-colors">
                            {para.text}
                          </p>
                          <div className="absolute -left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiEdit3 className="text-purple-400 text-sm" />
                          </div>
                        </div>
                      )}
                    </div>

                    {para.link?.file && (
                      <div className="flex justify-center items-start">
                        {para.link.type === 'video' ? (
                          <video 
                            controls 
                            className="w-full rounded-lg shadow-md" 
                            src={para.link.file.data}
                          />
                        ) : (
                          <img
                            src={para.link.file.data}
                            alt={`Content for ${dataStructure.title}`}
                            className="w-full rounded-lg shadow-md object-cover"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='16' dy='.35em' text-anchor='middle' x='200' y='150'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comments Section */}
          <Card className="border-purple-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <FiMessageCircle className="text-purple-600" />
                Comments ({dataStructure.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this data structure..."
                  className="w-full p-4 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="3"
                />
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <FiMessageCircle className="mr-2" />
                  Add Comment
                </Button>
              </form>

              <div className="space-y-4">
                {(dataStructure.comments || []).map((comment, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-50 border border-purple-100 p-4 rounded-lg"
                  >
                    <p className="text-gray-800 mb-2">{comment.text}</p>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delete Button */}
          <div className="mt-12 flex justify-center">
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="lg"
              className="bg-red-500 hover:bg-red-600 shadow-lg"
            >
              <FiTrash2 className="mr-2" />
              Delete Data Structure
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}