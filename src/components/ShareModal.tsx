'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Mail, Link2, Check, Trash2, ChevronDown } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
}

interface Share {
  user: {
    id: string;
    name?: string;
    email: string;
  };
  role: string;
  isOwner?: boolean;
  shareId?: string;
}

export function ShareModal({ isOpen, onClose, documentName, documentId }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [copied, setCopied] = useState(false);
  const [shares, setShares] = useState<Share[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchShares();
    }
  }, [isOpen, documentId]);

  const fetchShares = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/share`);
      if (response.ok) {
        const data = await response.json();
        setShares(data);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
    }
  };

  if (!isOpen) return null;

  const shareLink = `${window.location.origin}/conversation/${documentId}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });

      if (response.ok) {
        setEmail('');
        fetchShares(); // Refresh the shares list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to share document');
      }
    } catch (error) {
      setError('Failed to share document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId })
      });

      if (response.ok) {
        fetchShares(); // Refresh the shares list
      }
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  const getInitial = (user: Share['user']) => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
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
            Add people
          </label>
          <form onSubmit={handleInvite} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Can view</option>
                <option value="editor">Can edit</option>
              </select>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Share
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </form>
        </div>

        {/* People with access */}
        <div className="flex-1 overflow-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3">People with access</h3>
          <div className="space-y-2">
            {shares.map((share) => (
              <div key={share.user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                    {getInitial(share.user)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {share.user.name || share.user.email}
                    </div>
                    <div className="text-xs text-gray-500">{share.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {share.isOwner ? 'Owner' : share.role === 'editor' ? 'Can edit' : 'Can view'}
                  </span>
                  {!share.isOwner && (
                    <button
                      onClick={() => handleRemoveShare(share.shareId!)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Remove access"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link sharing section */}
        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share link
          </label>
          
          <div className="text-sm text-gray-600 mb-3">
            Anyone with the link can edit this document. They'll need to sign in with Google first.
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
                  Copy link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}