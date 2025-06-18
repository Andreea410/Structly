"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function TwoFactorSetup({ show, qrCode, secret, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Two-Factor Authentication Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Scan this QR code with your authenticator app to enable two-factor authentication.
            </p>
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            {secret && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Or enter this secret manually:
                </p>
                <code className="block p-3 bg-gray-100 rounded text-sm font-mono text-gray-800 break-all">
                  {secret}
                </code>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button
                onClick={onClose}
                variant="outline"
                className="text-purple-600 hover:text-purple-700"
              >
                Done
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 