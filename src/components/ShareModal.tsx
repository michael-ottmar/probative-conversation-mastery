'use client';

import { useState } from 'react';
import { X, Copy, Mail, Link2, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
}

export function ShareModal({ isOpen, onClose, documentName, documentId }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  if (!isOpen) return null;

  const shareLink = `${window.location.origin}/conversation/${documentId}${isViewOnly ? '?view=readonly' : ''}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !invitedEmails.includes(email)) {
      setInvitedEmails([...invitedEmails, email]);
      setEmail('');
      // In real app, send invitation here
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share "{documentName}"</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Email invite section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invite people
          </label>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Invite
            </button>
          </form>
          
          {invitedEmails.length > 0 && (
            <div className="mt-3 space-y-1">
              {invitedEmails.map((email) => (
                <div key={email} className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{email} - Invitation sent</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link sharing section */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share link
          </label>
          
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="viewOnly"
              checked={isViewOnly}
              onChange={(e) => setIsViewOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="viewOnly" className="text-sm text-gray-700">
              View only access
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}