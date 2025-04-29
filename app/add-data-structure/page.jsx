"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiLink, FiPlus, FiTrash2, FiInfo, FiCheckCircle } from "react-icons/fi";

export default function AddDataStructure() {
  const router = useRouter();
  const steps = ["Title", "Description", "Content", "Preview"];
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prevStepRef = useRef(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [paragraphs, setParagraphs] = useState([
    { text: "", addLink: false, linkType: "", file: null, linkUrl: "" },
  ]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // base64 string
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const newDataStructure = {
        title,
        description,
        paragraphs: await Promise.all(paragraphs.map(async (p) => {
          if (p.linkUrl && !p.linkUrl.startsWith('blob:')) {
            return {
              text: p.text,
              ...(p.addLink && p.linkType && {
                link: {
                  type: p.linkType,
                  url: p.linkUrl
                }
              })
            };
          }
  
          if (p.file) {
            const fileData = await fileToBase64(p.file);
            return {
              text: p.text,
              ...(p.addLink && p.linkType && {
                link: {
                  type: p.linkType,
                  file: {
                    data: fileData,
                    type: p.file.type
                  }
                }
              })
            };
          }
  
          return {
            text: p.text
          };
        })),
        usageCount: 0
      };
  
      const res = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDataStructure)
      });
  
      if (!res.ok) {
        throw new Error(await res.text());
      }
  
      router.push("/");
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    if (step === 0 && !title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (step === 1 && !description.trim()) {
      alert("Please enter a description");
      return;
    }
    prevStepRef.current = step;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const back = () => {
    prevStepRef.current = step;
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error(await res.text());
      }
  
      const data = await res.json();
      
      const updatedParagraphs = [...paragraphs];
      updatedParagraphs[index] = {
        ...updatedParagraphs[index],
        linkUrl: data.url,
        file: {
          name: data.filename,
          data: data.url,
          type: data.type
        }
      };
      
      setParagraphs(updatedParagraphs);
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    }
  };
  
  
  const removeParagraph = (index) => {
    if (paragraphs.length > 1) {
      const copy = [...paragraphs];
      copy.splice(index, 1);
      setParagraphs(copy);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
        {/* Progress Bar */}
        <div className="h-1.5 bg-purple-50">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500" 
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Step Indicator */}
          <div className="flex justify-between mb-8">
            {steps.map((label, i) => (
              <div 
                key={i} 
                className={`flex flex-col items-center flex-1 relative cursor-pointer`}
                onClick={() => i <= step && setStep(i)}
              >
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all 
                    ${i === step ? 'bg-purple-600 text-white shadow-md scale-110' : 
                     i < step ? 'bg-green-500 text-white shadow-sm' : 'bg-purple-100 text-purple-600'}`}
                >
                  {i < step ? <FiCheckCircle size={18} /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i <= step ? 'text-purple-800' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`absolute top-4 left-2/3 w-1/3 h-1 ${i < step ? 'bg-green-400' : 'bg-purple-100'}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step > prevStepRef.current ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step > prevStepRef.current ? -50 : 50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-purple-800">What's the title of your data structure?</h2>
                    <p className="text-purple-600">Choose a clear and descriptive title</p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full p-4 border-2 border-purple-100 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-800"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Binary Search Tree, Hash Table"
                      required
                      autoFocus
                    />
                    <div className="absolute right-3 top-3 text-purple-300 text-sm">
                      {title.length}/50
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
                      <FiInfo className="text-purple-500" />
                      Tips for a great title
                    </h4>
                    <ul className="text-sm text-purple-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        Be specific and concise (e.g., "Binary Search Tree Operations")
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        Use standard terminology (avoid jargon unless defined)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        Avoid abbreviations unless they're universally recognized
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-purple-800">Describe your data structure</h2>
                    <p className="text-purple-600">Explain its purpose and key characteristics</p>
                  </div>
                  <div className="relative">
                    <textarea
                      className="w-full p-4 border-2 border-purple-100 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all min-h-[150px] text-gray-800"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description that explains the purpose and key characteristics..."
                      maxLength={250}
                      autoFocus
                    />
                    <div className="absolute right-3 bottom-3 text-purple-300 text-sm">
                      {description.length}/250
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-purple-600 bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <FiInfo className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>This description will appear in search results and overview cards. Focus on clarity and key features.</span>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-purple-800">Add your content</h2>
                    <p className="text-purple-600">Break down your explanation into paragraphs</p>
                  </div>
                  
                  {paragraphs.map((p, i) => (
                    <div key={i} className="p-5 rounded-xl border-2 border-purple-50 hover:border-purple-100 transition-all group relative">
                      {paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParagraph(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                      
                      <h3 className="font-medium text-purple-700 mb-3">Paragraph {i + 1}</h3>
                      
                      <textarea
                        className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all min-h-[100px]"
                        placeholder="Enter paragraph content..."
                        value={p.text}
                        onChange={(e) => {
                          const copy = [...paragraphs];
                          copy[i].text = e.target.value;
                          setParagraphs(copy);
                        }}
                      />
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={p.addLink} 
                            onChange={() => {
                              const copy = [...paragraphs];
                              copy[i].addLink = !copy[i].addLink;
                              setParagraphs(copy);
                            }} 
                            className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                          />
                          <span className="text-sm font-medium text-gray-700">Add supporting resource</span>
                        </label>
                        
                        {p.addLink && (
                          <div className="space-y-3 pl-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                              <select
                                value={p.linkType}
                                onChange={(e) => {
                                  const copy = [...paragraphs];
                                  copy[i].linkType = e.target.value;
                                  copy[i].file = null;
                                  copy[i].linkUrl = "";
                                  setParagraphs(copy);
                                }}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all text-gray-700"
                              >
                                <option value="">Select resource type</option>
                                <option value="video">Video Explanation</option>
                                <option value="tutorial">Tutorial</option>
                                <option value="github">GitHub Repository</option>
                                <option value="article">Article</option>
                                <option value="image">Diagram/Image</option>
                              </select>
                            </div>
                            
                            {p.linkType && (
  (p.linkType === "image" || p.linkType === "video") ? (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload {p.linkType === "video" ? "Video" : "Image"}
      </label>
      <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition-all">
        <FiUpload className="text-purple-400 mb-2" size={20} />
        <p className="text-sm text-purple-600 text-center">
          {p.file ? p.file.name : `Click to upload ${p.linkType}`}
        </p>
        <input
  type="file"
  accept="image/*,video/*" // allow both
  onChange={(e) => handleFileUpload(e, i)}
/>

      </label>
    </div>
  ) : (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL</label>
      <input
        type="url"
        value={p.linkUrl}
        onChange={(e) => {
          const copy = [...paragraphs];
          copy[i].linkUrl = e.target.value;
          setParagraphs(copy);
        }}
        placeholder={`Enter ${p.linkType} URL`}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all"
      />
    </div>
  )
)}

                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setParagraphs([...paragraphs, { text: "", addLink: false, linkType: "", file: null, linkUrl: "" }])}
                    className="flex items-center justify-center w-full p-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-all group"
                  >
                    <FiPlus className="mr-2 text-purple-500 group-hover:text-purple-700" />
                    <span className="font-medium">Add Another Paragraph</span>
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-purple-800">Preview Your Data Structure</h2>
                    <p className="text-purple-600">Review your content before submitting</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-r from-purple-50 to-white rounded-xl shadow-sm border border-purple-100">
                      <h3 className="text-xl font-bold text-purple-800 mb-2">{title || "[Title]"}</h3>
                      <p className="text-gray-700">{description || "[Description]"}</p>
                    </div>
                    
                    {paragraphs.map((p, i) => (
                      <div key={i} className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-700 mb-3">{p.text || "[Paragraph content]"}</p>
                        
                        {p.addLink && p.linkType && (
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center text-purple-600 gap-2">
                              <FiLink className="flex-shrink-0" />
                              <span className="font-medium capitalize">{p.linkType} Resource:</span>
                              <span className="text-purple-500 truncate">
                                {p.file ? p.file.name : p.linkUrl || "[Resource link]"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={back}
                  className="px-6 py-3 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex justify-end">
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Data Structure"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}