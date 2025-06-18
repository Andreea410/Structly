"use client";

import React from 'react';
import { FiTrendingUp, FiBarChart2, FiAward } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function StatisticsCards({ statistics, dataStructures }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Most Used Structure</CardTitle>
          <FiTrendingUp className="h-4 w-4 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.mostUsed.title}</div>
          <p className="text-xs text-purple-200">
            Used {statistics.mostUsed.usageCount} times
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Least Used Structure</CardTitle>
          <FiBarChart2 className="h-4 w-4 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.leastUsed.title}</div>
          <p className="text-xs text-purple-200">
            Used {statistics.leastUsed.usageCount} times
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Usage</CardTitle>
          <FiAward className="h-4 w-4 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.averageUsage}</div>
          <p className="text-xs text-purple-200">
            Across {dataStructures.length} structures
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 