"use client";

import React from 'react';

export function Button({ 
  children, 
  onClick, 
  variant = 'default',
  className = '',
  ...props 
}) {
  const baseStyles = "px-4 py-2 rounded-lg transition-all duration-200";
  const variants = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-50",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 