"use client";

import { useState, useCallback } from 'react';

export function toast({ title, description, variant = 'default' }) {
  const variants = {
    default: 'bg-white text-gray-900',
    destructive: 'bg-red-100 text-red-900',
  };

  const toastElement = document.createElement('div');
  toastElement.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${variants[variant]} z-50`;
  
  const content = `
    <div class="flex items-start">
      <div class="flex-1">
        <h4 class="font-medium">${title}</h4>
        <p class="text-sm opacity-90">${description}</p>
      </div>
      <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
        ×
      </button>
    </div>
  `;
  
  toastElement.innerHTML = content;
  document.body.appendChild(toastElement);
  
  setTimeout(() => {
    toastElement.remove();
  }, 5000);
} 