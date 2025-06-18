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
import Link from "next/link";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast";
import { Sidebar } from "../components/Sidebar";
import { StatisticsCards } from "../components/StatisticsCards";
import { DataStructureList } from "../components/DataStructureList";
import { FileUploadSection } from "../components/FileUploadSection";
import { TwoFactorSetup } from "../components/TwoFactorSetup";

export default function HomePage() {
  const router = useRouter();
  const [dataStructures, setDataStructures] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState("default");
  const limit = 5;
  const [currentUser, setCurrentUser] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const { socket, isConnected } = useSocket();
  const { networkOnline, serverOnline } = useNetworkStatus();
  const [isAdmin, setIsAdmin] = useState(false);
  const observer = useRef();
  const [statistics, setStatistics] = useState({
    mostUsed: { title: "N/A", usageCount: 0 },
    leastUsed: { title: "N/A", usageCount: 0 },
    averageUsage: 0,
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    fetchData(1);  
  }, [searchQuery, sortOption, isClient]);
  
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
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const base64Payload = token.split(".")[1];
      if (!base64Payload) return;
  
      const jsonPayload = JSON.parse(atob(base64Payload));
      setCurrentUser(jsonPayload);
      if (jsonPayload?.role === "admin") {
        setIsAdmin(true);
      }
      setIs2FAEnabled(jsonPayload.isTwoFAEnabled || false);
    } catch (err) {
      console.warn("Invalid token format or Base64 decode failed:", err);
      setCurrentUser(null);
      setIsAdmin(false);
      setIs2FAEnabled(false);
    }
  }, []);

  const fetchData = async (pageToFetch) => {
    if (isLoading || !hasMore) return;
  
    setIsLoading(true);
  
    try {
      const url = `/api/entities?page=${pageToFetch}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&sort=${sortOption}`;
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch data");
  
      let newData = await res.json();
      // Ensure every item has an _id property
      newData = newData.map(ds => ({ ...ds, _id: ds._id || ds.id }));
      console.log('Fetched data:', newData);
  
      let updatedData;
      if (pageToFetch === 1) {
        updatedData = newData;
      } else {
        updatedData = deduplicateById([...dataStructures, ...newData]);
      }
  
      setDataStructures(updatedData);
      setHasMore(newData.length >= limit);
      calculateStatistics(updatedData);
    } catch (err) {
      console.error("Fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to fetch data structures",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  function deduplicateById(data) {
    const seen = new Set();
    return data.filter((item) => {
      if (seen.has(item._id)) return false;
      seen.add(item._id);
      return true;
    });
  }

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

  const lastElementRef = useCallback((node) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this data structure?")) return;
  
    if (!networkOnline || !serverOnline) {
      queueOperation({ url: `/api/entities/${id}`, method: "DELETE" });
      setDataStructures((prev) => prev.filter((ds) => ds._id !== id));  
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "You need to be logged in to delete a data structure.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      const res = await fetch(`/api/entities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Failed to delete" }));
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }
      setDataStructures((prev) => prev.filter((ds) => ds._id !== id));
      toast({
        title: "Success",
        description: "Data structure deleted successfully",
      });
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Error",
        description: "Failed to delete data structure",
        variant: "destructive",
      });
    }
  };

  const handleViewPage = async (item) => {
    console.log('handleViewPage item:', item);
    const updatedItem = {
      ...item,
      usageCount: (item.usageCount || 0) + 1,
    };
  
    localStorage.setItem(`offline-view-${item._id}`, JSON.stringify(updatedItem));
  
    if (!networkOnline || !serverOnline) {
      queueOperation({
        url: `/api/entities/${item._id}`,
        method: "PATCH",
        body: updatedItem,
      });
  
      router.push(`/data-structure/${item._id}`);
      return;
    }
  
    try {
      const token = localStorage.getItem("token");

      await fetch(`/api/entities/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ usageCount: updatedItem.usageCount }),
      });

      router.push(`/data-structure/${item._id}`);
    } catch (err) {
      console.error("View error:", err);
      router.push(`/data-structure/${item._id}`);
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
      toast({
        title: "Success",
        description: "Generated 10 mock data structures",
      });
    } catch (err) {
      console.error("Mock generate error:", err);
      toast({
        title: "Error",
        description: "Failed to generate mock data",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsAdmin(false);
    setIs2FAEnabled(false);
    router.push("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const handleAddDataStructure = () => router.push("/add-data-structure");

  const simulateAttack = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to simulate the attack.",
        variant: "destructive",
      });
      return;
    }
  
    for (let i = 0; i < 15; i++) {
      await fetch("/api/entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `SimAttack ${i + 1}`,
          description: "High frequency insert for test",
          usageCount: Math.floor(Math.random() * 10),
        })
      });
      console.log(`Simulated POST ${i + 1}`);
    }
  
    toast({
      title: "Attack Simulated",
      description: "15 POST operations completed",
      variant: "destructive",
    });
  };

  const handle2FASetup = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQrCode(data.qr);
      setSecret(data.secret);
      setShow2FASetup(true);
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        setIs2FAEnabled(true);
      }
      toast({
        title: "2FA Setup",
        description: "Two-factor authentication setup initiated",
      });
    } catch (err) {
      console.error("2FA setup error:", err);
      toast({
        title: "Error",
        description: "Failed to setup 2FA",
        variant: "destructive",
      });
    }
  };

  const handle2FADisable = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        setIs2FAEnabled(false);
        handleLogout();
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
      }
    } catch (err) {
      console.error("2FA disable error:", err);
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
    }
  };

  if (!isClient) return <LoadingSkeleton />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        isAdmin={isAdmin}
        is2FAEnabled={is2FAEnabled}
        onLogout={handleLogout}
        on2FASetup={handle2FASetup}
        on2FADisable={handle2FADisable}
        show2FASetup={show2FASetup}
        qrCode={qrCode}
        secret={secret}
        onClose2FASetup={() => {
          setShow2FASetup(false);
          handleLogout();
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Network Banner */}
      {(!networkOnline || !serverOnline) && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <NetworkBanner networkOnline={networkOnline} serverOnline={serverOnline} />
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 p-6 overflow-auto transition-all duration-300 ${sidebarOpen ? 'pl-24' : 'pl-2'}`}>
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <div className="bg-white rounded-lg shadow px-4 py-2 text-sm text-gray-700">
              {currentUser ? (
                <span>
                  Logged in as <strong>{currentUser.email}</strong> ({currentUser.role})
                </span>
              ) : (
                <span>You are not logged in.</span>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-4">
            <StatisticsCards statistics={statistics} dataStructures={dataStructures} />
          </div>

          {/* Usage Chart */}
          <div className="mb-4">
            <Card className="min-h-[420px] h-[420px] w-full p-6 flex items-center justify-center">
              <UsageChart dataStructures={dataStructures} />
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Data Structures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-start items-center mb-6 gap-4">
                {/* Search */}
                <div className="relative w-full md:w-96">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search data structures..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 pl-12 pr-4 text-base bg-white rounded-full shadow-sm border border-purple-400 placeholder:text-gray-700 placeholder:font-medium focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full md:w-48 py-3 px-4 bg-white rounded-full border border-purple-300 text-purple-600 shadow-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="default">Sort By</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="most-used">Most Used</option>
                  <option value="least-used">Least Used</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>

                {/* Action Buttons */}
                <div className="flex flex-row flex-nowrap gap-x-3 items-center w-full overflow-x-auto ml-6">
                  <Button
                    onClick={handleAddDataStructure}
                    className="btn-primary px-4 py-2 rounded-md font-semibold text-sm"
                  >
                    + New Structure
                  </Button>

                  <Button
                    onClick={handleGenerateMockData}
                    className="btn-secondary px-4 py-2 rounded-md font-semibold text-sm"
                  >
                    Generate Data
                  </Button>

                  <Button
                    onClick={simulateAttack}
                    className="btn-secondary px-4 py-2 rounded-md font-semibold text-sm"
                  >
                    Simulate Attack
                  </Button>
                </div>
              </div>

              {/* Data Structures List */}
              <DataStructureList
                dataStructures={dataStructures}
                statistics={statistics}
                onView={handleViewPage}
                onDelete={handleDelete}
                isLoading={isLoading}
                lastElementRef={lastElementRef}
              />
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <FileUploadSection
            uploadedFile={uploadedFile}
            onFileUploaded={setUploadedFile}
          />
        </div>

        {/* Connection Status */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md z-50">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {isConnected ? 'Live updates connected' : 'Disconnected'}
          </span>
        </div>
      </main>

      {/* 2FA Setup Modal */}
      <TwoFactorSetup
        show={show2FASetup}
        qrCode={qrCode}
        secret={secret}
        onClose={() => {
          setShow2FASetup(false);
          handleLogout();
        }}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 text-center text-purple-400">Loading...</div>
  );
}