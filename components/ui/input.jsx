"use client";

import React from 'react';

export function Input({ 
  className = '',
  ...props 
}) {
  return (
    <input
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
      {...props}
    />
  );
} 