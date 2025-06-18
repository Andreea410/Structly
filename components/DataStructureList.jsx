"use client";

import React from 'react';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function DataStructureList({
  dataStructures,
  statistics,
  onView,
  onDelete,
  isLoading,
  lastElementRef
}) {
  if (dataStructures.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data structures found. Try adjusting your search or create a new one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dataStructures.map((item, index) => (
        <div
          key={item._id}
          ref={index === dataStructures.length - 1 ? lastElementRef : null}
          className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-2 text-sm">{item.description}</p>
              <div className="flex gap-1">
                <Badge variant="secondary">
                  Used {item.usageCount || 0} times
                </Badge>
                {item.usageCount === statistics.mostUsed.usageCount && (
                  <Badge variant="default">Most Used</Badge>
                )}
                {item.usageCount === statistics.leastUsed.usageCount && (
                  <Badge variant="outline">Least Used</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onView(item)}
                variant="outline"
                className="px-4 py-2 text-sm rounded-full text-purple-600 hover:text-purple-700 border border-purple-300"
              >
                <FiEye className="mr-1" />
                View
              </Button>
              <Button
                onClick={() => onDelete(item._id)}
                variant="destructive"
                className="px-4 py-2 text-sm rounded-full text-white bg-red-500 hover:bg-red-600 border-none"
              >
                <FiTrash2 className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          Loading more data structures...
        </div>
      )}
    </div>
  );
} 