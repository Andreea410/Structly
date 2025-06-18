"use client";

import React from 'react';
import { FiUpload } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function FileUploadSection({ uploadedFile, onFileUploaded }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUploaded(file);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Upload Data Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-all"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUpload className="w-10 h-10 mb-3 text-purple-500" />
              <p className="mb-2 text-sm text-purple-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-purple-400">
                JSON or CSV files only
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".json,.csv"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {uploadedFile && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-700">
              File uploaded: {uploadedFile.name}
            </p>
            <Button
              onClick={() => onFileUploaded(null)}
              variant="outline"
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 