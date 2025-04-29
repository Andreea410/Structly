"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiTrendingUp, FiBarChart2, FiAward } from "react-icons/fi";
import { generateFakeDataStructures } from "../utils/generateFakeData";
import UsageChart from "../components/usageChart";
import { motion } from "framer-motion";
import useNetworkStatus from "../hooks/useNetworkStatus";
import NetworkBanner from "../components/NetworkBanner";
import { queueOperation, processQueue } from "../services/offlineQueueService";
import useSocket from "../hooks/useSocket";

export default function HomePage() {
  const router = useRouter();
  const [dataStructures, setDataStructures] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;
  const { socket, isConnected } = useSocket();
  const { networkOnline, serverOnline } = useNetworkStatus();
  const observer = useRef();
  const [statistics, setStatistics] = useState({

    mostUsed: { title: "N/A", usageCount: 0 },
    leastUsed: { title: "N/A", usageCount: 0 },
    averageUsage: 0,
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    setIsClient(true);
    setHasMore(true);
    setPage(1);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("NEW_ENTITY", (newEntity) => {
      setDataStructures(prev => {
        const exists = prev.some(ds => ds.id === newEntity.id);
        if (exists) return prev;
        
        return [newEntity, ...prev];
      });
      calculateStatistics([newEntity, ...dataStructures]);
    });

    socket.on("ENTITY_UPDATED", (updatedEntity) => {
      setDataStructures(prev => 
        prev.map(ds => ds.id === updatedEntity.id ? updatedEntity : ds)
      );
    });
  
    socket.on("ENTITY_DELETED", ({ id }) => {
      setDataStructures(prev => prev.filter(ds => ds.id !== id));
    });
  
    return () => {
      socket.off("NEW_ENTITY");
      socket.off("ENTITY_UPDATED");
      socket.off("ENTITY_DELETED");
    };
  }, [socket, dataStructures]);

  useEffect(() => {
    if (!isClient) return;
    setDataStructures([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, isClient]);

  useEffect(() => {
    if (networkOnline && serverOnline) {
      processQueue().then(() => {
        setDataStructures([]);
        setPage(1);
        setHasMore(true);
        fetchData(1);
      });
    }
  }, [networkOnline, serverOnline]);

  useEffect(() => {
    if (!isClient || page < 1) return;
    fetchData(page);
  }, [page, isClient, searchQuery]); 
  
  

  const fetchData = async (pageToFetch = 1) => {
    if (isLoading || !hasMore) return;
  
  setIsLoading(true);
  
  try {
    if (pageToFetch === 1 && !networkOnline) {
      const cached = localStorage.getItem("offline-home-data");
      if (cached) {
        const offlineData = JSON.parse(cached);
        if (offlineData.length > 0) {
          setDataStructures(offlineData);
          calculateStatistics(offlineData);
          setHasMore(false);
          return;
        }
      }
    }
    if (!networkOnline || !serverOnline) {
      const cached = localStorage.getItem("offline-home-data");
      if (cached) {
        const offlineData = JSON.parse(cached);
        setDataStructures(offlineData);
        calculateStatistics(offlineData);
        setHasMore(false);
        return;
      }
    }
  
      const url = `/api/entities?page=${pageToFetch}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch data");
  
      const newData = await res.json();
  
      let updatedData;
      if (pageToFetch === 1) {
        updatedData = newData;
      } else {
        updatedData = [...dataStructures, ...newData];
      }
      setDataStructures(updatedData);
      localStorage.setItem("offline-home-data", JSON.stringify(updatedData));
  
      if (newData.length < limit) setHasMore(false);
  
      calculateStatistics(pageToFetch === 1 ? newData : [...dataStructures, ...newData]);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const calculateStatistics = (data) => {
    if (data.length === 0) {
      setStatistics({
        mostUsed: { title: "N/A", usageCount: 0 },
        leastUsed: { title: "N/A", usageCount: 0 },
        averageUsage: 0,
      });
      return;
    }
    const mostUsed = data.reduce((prev, curr) =>
      (prev.usageCount || 0) > (curr.usageCount || 0) ? prev : curr
    );
    const leastUsed = data.reduce((prev, curr) =>
      (prev.usageCount || 0) < (curr.usageCount || 0) ? prev : curr
    );
    const avg = data.reduce((sum, ds) => sum + (ds.usageCount || 0), 0) / data.length;
    setStatistics({
      mostUsed,
      leastUsed,
      averageUsage: avg.toFixed(2),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this data structure?")) return;

    if (!networkOnline || !serverOnline) {
      queueOperation({ url: `/api/entities/${id}`
        , method: "DELETE" });
      setDataStructures((prev) => prev.filter((ds) => ds.id !== id));
      return;
    }

    try {
      await fetch(`/api/entities/${id}`, { method: "DELETE" });
      setDataStructures((prev) => prev.filter((ds) => ds.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleViewPage = async (item) => {
    const updatedItem = {
      ...item,
      usageCount: (item.usageCount || 0) + 1,
    };
  
    localStorage.setItem(`offline-view-${item.id}`, JSON.stringify(updatedItem));
  
    if (!networkOnline || !serverOnline) {
      queueOperation({
        url: `/api/entities/${item.id}`,
        method: "PATCH",
        body: updatedItem,
      });
  
      router.push(`/data-structure/${item.id}`);
      return;
    }
  
    try {
      await fetch(`/api/entities/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
  
      router.push(`/data-structure/${item.id}`);
    } catch (err) {
      console.error("View error:", err);
      router.push(`/data-structure/${item.id}`);
    }
  };
  

  const handleGenerateMockData = async () => {
    const mockData = generateFakeDataStructures(10);
  
    if (!networkOnline || !serverOnline) {
      mockData.forEach((data) => {
        queueOperation({ url: "/api/entities", method: "POST", body: data });
      });
      setDataStructures((prev) => [...mockData, ...prev]);
      return;
    }
  
    try {
      await Promise.all(
        mockData.map((data) =>
          fetch("/api/entities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        )
      );
  
      setDataStructures([]);    
      setPage(1);              
      setHasMore(true);        
      fetchData(1);             
    } catch (err) {
      console.error("Mock generate error:", err);
    }
  };
  

  const handleAddDataStructure = () => router.push("/add-data-structure");

  if (!isClient) return <LoadingSkeleton />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-purple-700 to-purple-900 p-6 text-white shadow-xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-purple-200">Explore your data structures</p>
        </motion.div>

        <nav className="space-y-3">
          <NavItem text="Dashboard" icon={<FiBarChart2 />} active />
          <NavItem text="Data Structures" icon={<FiTrendingUp />} />
          <NavItem text="Verify Knowledge" icon={<FiAward />} />
          <NavItem text="Profile" />
          <NavItem text="Leaderboard" />
          <NavItem text="Favorites" />
        </nav>

        <div className="mt-10 space-y-3">
          <NavItem text="Settings" />
          <NavItem text="Log Out" />
        </div>

        <div className="mt-16 p-4 bg-purple-800/30 rounded-lg">
          <p className="text-sm text-purple-200">Need help?</p>
          <p className="text-purple-100 font-medium">Contact Support</p>
        </div>
      </aside>

      {/* Network Banner */}
      {(!networkOnline || !serverOnline) && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <NetworkBanner networkOnline={networkOnline} serverOnline={serverOnline} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Most Used"
            value={statistics.mostUsed.title}
            secondaryValue={`${statistics.mostUsed.usageCount} views`}
            icon={<FiTrendingUp className="text-green-500" size={24} />}
            color="from-green-100 to-green-50"
          />
          <StatCard
            title="Average Usage"
            value={statistics.averageUsage}
            secondaryValue="across all"
            icon={<FiBarChart2 className="text-blue-500" size={24} />}
            color="from-blue-100 to-blue-50"
          />
          <StatCard
            title="Total Structures"
            value={dataStructures.length}
            secondaryValue="in collection"
            icon={<FiAward className="text-purple-500" size={24} />}
            color="from-purple-100 to-purple-50"
          />
        </div>

        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md z-50">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {isConnected ? 'Live updates connected' : 'Disconnected'}
          </span>
        </div>

        {/* Usage Chart */}
        <UsageChart dataStructures={dataStructures} />

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <FiSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search data structures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-12 pr-4 text-lg bg-white rounded-full shadow-sm border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-purple-300"
            />
          </div>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateMockData}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Generate Data
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddDataStructure}
              className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-full shadow-lg hover:bg-purple-50 transition-all flex items-center gap-2"
            >
              + New Structure
            </motion.button>
          </div>
        </div>

        {/* Data Structures List with Infinite Scroll */} 
        <div className="space-y-4 mb-8">
          {dataStructures.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No data structures found</p>
              <button
                onClick={handleGenerateMockData}
                className="mt-4 text-purple-600 hover:underline"
              >
                Generate sample data
              </button>
            </div>
          ) : (
            dataStructures.map((item, index) => (
              <div key={item._id || item.id || index} ref={index === dataStructures.length - 1 ? lastElementRef : null}>
                <DataStructureCard
                  item={item}
                  statistics={statistics}
                  onView={handleViewPage}
                  onDelete={handleDelete}
                />
              </div>
            ))
          )}
          {isLoading && <div className="text-center py-6 text-purple-600">Loading more...</div>}
        </div>
          {/* Upload Section */}
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow p-6 mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📤 Upload a File
      </h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const file = e.target.fileInput.files[0];
          if (!file) return alert("Please select a file first.");

          const formData = new FormData();
          formData.append("file", file);

          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const json = await res.json();
            alert(`Uploaded: ${json.filename}`);
            setUploadedFile(json.filename);
          } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed. Check console.");
          }
        }}
  >
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <label
        htmlFor="fileInput"
        className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow cursor-pointer hover:bg-purple-700"
      >
        Select File
      </label>

      <input
        type="file"
        name="file"
        id="fileInput"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          setUploadedFile(file ? file.name : null);
        }}
      />

      <button
        type="submit"
        className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-all"
      >
        Upload
      </button>
    </div>
  </form>

  {uploadedFile && (
    <p className="mt-4 text-green-700 text-sm">
      Uploaded:{" "}
      <a
        className="underline text-blue-600"
        href={`/uploads/${uploadedFile}`}
        download
      >
        {uploadedFile}
      </a>
    </p>
  )}
</div>
      </main>
      
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 text-center text-purple-400">Loading...</div>
  );
}

function StatCard({ title, value, secondaryValue, icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-xl shadow-sm border border-purple-100 bg-gradient-to-r ${color}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-purple-600 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
          <p className="text-xs text-purple-500 mt-1">{secondaryValue}</p>
        </div>
        <div className="p-2 bg-white rounded-lg shadow-inner">{icon}</div>
      </div>
    </motion.div>
  );
}

function DataStructureCard({ item, statistics, onView, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex justify-between items-center ${
        item.usageCount === statistics.mostUsed.usageCount
          ? "bg-gradient-to-r from-green-50 to-white border-l-4 border-green-500"
          : item.usageCount === statistics.leastUsed.usageCount
          ? "bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500"
          : "bg-white"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
          {item.usageCount === statistics.mostUsed.usageCount && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1">
              <FiTrendingUp size={12} /> Most Popular
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
        <div className="flex items-center gap-4">
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
            {item.usageCount || 0} views
          </span>
          <span className="text-xs text-gray-500">
            Last viewed: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onView({ ...item, id: item._id }) }
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
        >
          View
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(item._id)}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center mt-8">
      <div className="inline-flex rounded-lg shadow-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-l-lg hover:bg-purple-50 transition-all disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`px-4 py-2 border-t border-b border-purple-200 transition-all ${
              i + 1 === currentPage
                ? "bg-purple-600 text-white"
                : "bg-white text-purple-600 hover:bg-purple-50"
            } ${i === 0 ? "border-l" : ""} ${i === totalPages - 1 ? "border-r" : ""}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-r-lg hover:bg-purple-50 transition-all disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function NavItem({ text, icon, active }) {
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
      active
        ? "bg-purple-600/20 text-white font-medium"
        : "text-purple-200 hover:bg-purple-800/30"
    }`}>
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </div>
  );
}