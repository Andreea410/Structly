"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddDataStructure() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [paragraphs, setParagraphs] = useState([
    { text: "", addLink: false, linkType: "", file: null },
  ]);

  const handleTextChange = (index, value) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index].text = value;
    setParagraphs(newParagraphs);
  };

  const toggleAddLink = (index) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index].addLink = !newParagraphs[index].addLink;
    setParagraphs(newParagraphs);
  };

  const handleLinkTypeChange = (index, value) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index].linkType = value;
    setParagraphs(newParagraphs);
  };

  const handleFileChange = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const newParagraphs = [...paragraphs];
        newParagraphs[index].file = reader.result; 
        setParagraphs(newParagraphs);
      };
    }
  };
  
  

  // Add a new paragraph section
  const addParagraph = () => {
    setParagraphs([...paragraphs, { text: "", addLink: false, linkType: "", file: null }]);
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault(); 

    const newDataStructure = { title, description, paragraphs };
    const storedItems = sessionStorage.getItem("dataStructures");
    const updatedList = storedItems ? JSON.parse(storedItems) : [];

    updatedList.push(newDataStructure);
    sessionStorage.setItem("dataStructures", JSON.stringify(updatedList));

    // Redirect back to the main page
    router.push("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-purple-200 overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Data Structure</h2>
        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <input
            type="text"
            placeholder="Data Structure Title"
            className="w-full p-2 border rounded mb-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Description Input */}
          <textarea
            placeholder="Description"
            className="w-full p-2 border rounded mb-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Loop through paragraphs */}
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="mb-6 border-b pb-4">
              {/* Paragraph Text Input */}
              <textarea
                placeholder="Write paragraph..."
                className="w-full p-2 border rounded mb-2"
                value={paragraph.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
              />

              {/* Checkbox for Adding a Link */}
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={paragraph.addLink}
                  onChange={() => toggleAddLink(index)}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">
                  Do you want to add a link in the paragraph?
                </label>
              </div>

              {/* Dropdown appears when checkbox is checked */}
              {paragraph.addLink && (
                <div className="mt-3">
                  <label className="block text-gray-700 text-sm">Select Link Type:</label>
                  <select
                    className="w-full p-2 border rounded mt-1"
                    value={paragraph.linkType}
                    onChange={(e) => handleLinkTypeChange(index, e.target.value)}
                  >
                    <option value="">-- Choose Link Type --</option>
                    <option value="video">Video</option>
                    <option value="tutorial">YouTube Tutorial</option>
                    <option value="github">GitHub Repository</option>
                    <option value="photo">Photo</option>
                  </select>
                </div>
              )}

              {/* File Upload Appears When an Option is Selected */}
              {paragraph.addLink && paragraph.linkType && paragraph.linkType !== "github" && (
                <div className="mt-3">
                  <label className="block text-gray-700 text-sm">Upload {paragraph.linkType}:</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                    accept={
                      paragraph.linkType === "video"
                        ? "video/*"
                        : paragraph.linkType === "photo"
                        ? "image/*"
                        : "*"
                    }
                    className="w-full p-2 border rounded mt-1"
                  />
                  {paragraph.file && (
                    <p className="text-sm text-gray-500 mt-1">Selected File: {paragraph.file.name}</p>
                  )}
                </div>
              )}

              {/* Add Another Paragraph Checkbox */}
              {index === paragraphs.length - 1 && (
                <div className="flex items-center space-x-2 mt-4">
                  <input type="checkbox" onChange={addParagraph} className="w-4 h-4" />
                  <label className="text-sm text-gray-700">Add another paragraph?</label>
                </div>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700 mt-4 w-full"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
