"use client";

import React from 'react';
import { FiBarChart2, FiTrendingUp, FiAward } from 'react-icons/fi';
import Link from 'next/link';

export function Sidebar({
  currentUser,
  isAdmin,
  is2FAEnabled,
  onLogout,
  on2FASetup,
  on2FADisable,
  show2FASetup,
  qrCode,
  secret,
  onClose2FASetup,
  isOpen,
  onToggle
}) {
  return (
    <aside className={`w-56 bg-gradient-to-b from-purple-700 to-purple-900 p-4 text-white shadow-xl transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-56'}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-purple-200">Explore your data structures</p>
      </div>

      <nav className="space-y-3">
        <NavItem text="Dashboard" icon={<FiBarChart2 />} active />
        <NavItem text="Data Structures" icon={<FiTrendingUp />} />
        <NavItem text="Verify Knowledge" icon={<FiAward />} />
        <NavItem text="Profile" />
        <NavItem text="Leaderboard" />
        <NavItem text="Favorites" />
        {isAdmin && (
          <>
            <Link href="/logs">
              <NavItem text="View Logs" />
            </Link>
            <Link href="/logs/monitored">
              <NavItem text="Suspicious Users" />
            </Link>
          </>
        )}
      </nav>

      <div className="mt-10 space-y-3">
        <Link href="/login">
          <NavItem text="Login" />
        </Link>
        <Link href="/signup">
          <NavItem text="Sign Up" />
        </Link>
        <NavItem text="Settings" />
        <NavItem text="Log Out" onClick={onLogout} />
      </div>

      {currentUser && (
        <div className="mt-6 p-4 bg-purple-800/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Two-Factor Authentication</h3>
          {!is2FAEnabled ? (
            <button
              onClick={on2FASetup}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              Enable 2FA
            </button>
          ) : (
            <button
              onClick={on2FADisable}
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              Disable 2FA
            </button>
          )}
          {show2FASetup && qrCode && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <p className="text-sm mb-2">Scan this QR code with your authenticator app:</p>
              <img src={qrCode} alt="2FA QR Code" className="w-full mb-2" />
              <p className="text-xs text-purple-200 mb-2">Or enter this secret manually:</p>
              <code className="block p-2 bg-purple-900/50 rounded text-sm font-mono text-purple-100 break-all">
                {secret}
              </code>
              <button
                onClick={onClose2FASetup}
                className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-16 p-4 bg-purple-800/30 rounded-lg">
        <p className="text-sm text-purple-200">Need help?</p>
        <p className="text-purple-100 font-medium">Contact Support</p>
      </div>

      <button
        onClick={onToggle}
        className="absolute top-4 right-4 p-2 text-white hover:bg-purple-800/50 rounded-lg transition-all"
      >
        {isOpen ? '←' : '→'}
      </button>
    </aside>
  );
}

function NavItem({ text, icon, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
        active
          ? "bg-purple-600/20 text-white font-medium"
          : "text-purple-200 hover:bg-purple-800/30"
      }`}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </div>
  );
} 