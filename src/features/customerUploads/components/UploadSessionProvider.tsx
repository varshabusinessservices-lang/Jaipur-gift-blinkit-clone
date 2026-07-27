import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerUploadsService } from '../services/customerUploadsService';
import { UploadSession, CustomerUpload, CustomerUploadRole } from '../types/customerUploads';

interface UploadSessionContextType {
  session: UploadSession | null;
  uploads: CustomerUpload[];
  loading: boolean;
  error: string | null;
  initSession: (productId: string, personalisationFormId: string, variationId?: string | null) => Promise<UploadSession>;
  loadSession: (token: string) => Promise<void>;
  uploadFile: (fieldId: string, role: CustomerUploadRole, file: File) => Promise<CustomerUpload>;
  deleteUpload: (uploadId: string) => Promise<void>;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
}

const UploadSessionContext = createContext<UploadSessionContextType | undefined>(undefined);

export const UploadSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UploadSession | null>(null);
  const [uploads, setUploads] = useState<CustomerUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to load session details
  const fetchSessionDetails = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerUploadsService.getSession(token);
      setSession(data.session);
      setUploads(data.uploads);
    } catch (err: any) {
      console.error('Failed to load upload session:', err);
      setError(err.message || 'FAILED_TO_LOAD_SESSION');
      // If session is expired or not found, clear storage
      localStorage.removeItem(`upload_token_${session?.productId}`);
    } finally {
      setLoading(false);
    }
  }, [session?.productId]);

  // Create or load session
  const initSession = useCallback(async (
    productId: string,
    personalisationFormId: string,
    variationId?: string | null
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to find existing cached token in localStorage for this product
      const cachedToken = localStorage.getItem(`upload_token_${productId}`);
      if (cachedToken) {
        try {
          const data = await customerUploadsService.getSession(cachedToken);
          // Check if expired
          if (new Date(data.session.expiresAt) > new Date()) {
            setSession(data.session);
            setUploads(data.uploads);
            setLoading(false);
            return data.session;
          }
        } catch {
          // Cached token is invalid/not found, ignore and create new
          localStorage.removeItem(`upload_token_${productId}`);
        }
      }

      // Create new session
      const newSession = await customerUploadsService.createSession({
        productId,
        personalisationFormId,
        variationId,
        source: 'WEBSITE'
      });

      localStorage.setItem(`upload_token_${productId}`, newSession.publicToken);
      setSession(newSession);
      setUploads([]);
      return newSession;
    } catch (err: any) {
      setError(err.message || 'FAILED_TO_CREATE_SESSION');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (token: string) => {
    await fetchSessionDetails(token);
  }, [fetchSessionDetails]);

  // Upload file inside active session
  const uploadFile = useCallback(async (
    fieldId: string,
    role: CustomerUploadRole,
    file: File
  ) => {
    if (!session) {
      throw new Error('NO_ACTIVE_SESSION');
    }

    // Prepare a temporary upload entry in state for progress tracking
    const tempUploadId = `temp-${Date.now()}`;
    const tempUpload: CustomerUpload = {
      id: tempUploadId,
      uploadSessionId: session.id,
      fileAssetId: '',
      productId: session.productId,
      variationId: session.variationId,
      personalisationFormId: session.personalisationFormId,
      personalisationFieldId: fieldId,
      fieldKey: null,
      uploadRole: role,
      lifecycleStatus: 'UPLOADING',
      originalFileName: file.name,
      safeFileName: file.name,
      mimeType: file.type,
      extension: file.name.split('.').pop() || '',
      sizeBytes: file.size,
      width: null,
      height: null,
      orientation: null,
      checksum: null,
      sortOrder: uploads.length,
      isPrimary: uploads.length === 0,
      isCustomerDeleted: false,
      isAdminProtected: false,
      protectionReason: null,
      retentionStartsAt: null,
      retentionExpiresAt: null,
      purgedAt: null,
      metadataJson: null,
      validationResultJson: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
    };

    setUploads((prev) => [...prev, tempUpload]);

    try {
      const completedUpload = await customerUploadsService.uploadFile(
        session.publicToken,
        fieldId,
        role,
        file,
        (progress) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === tempUploadId ? { ...u, progress } : u))
          );
        }
      );

      // Replace temporary upload with the completed server upload record
      setUploads((prev) =>
        prev.map((u) => (u.id === tempUploadId ? completedUpload : u))
      );
      return completedUpload;
    } catch (err: any) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === tempUploadId
            ? { ...u, lifecycleStatus: 'VALIDATION_FAILED', progress: undefined, error: err.message || 'UPLOAD_FAILED' }
            : u
        )
      );
      throw err;
    }
  }, [session, uploads.length]);

  // Soft delete file from session
  const deleteUpload = useCallback(async (uploadId: string) => {
    if (!session) return;

    try {
      // Optimistically remove/mark deleted in UI
      setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      await customerUploadsService.deleteUpload(session.publicToken, uploadId);
    } catch (err) {
      console.error('Failed to delete upload:', err);
      // Re-fetch state on failure to stay synchronized
      await fetchSessionDetails(session.publicToken);
    }
  }, [session, fetchSessionDetails]);

  const clearSession = useCallback(() => {
    if (session) {
      localStorage.removeItem(`upload_token_${session.productId}`);
    }
    setSession(null);
    setUploads([]);
    setError(null);
  }, [session]);

  const refreshSession = useCallback(async () => {
    if (session) {
      await fetchSessionDetails(session.publicToken);
    }
  }, [session, fetchSessionDetails]);

  return (
    <UploadSessionContext.Provider
      value={{
        session,
        uploads,
        loading,
        error,
        initSession,
        loadSession,
        uploadFile,
        deleteUpload,
        clearSession,
        refreshSession,
      }}
    >
      {children}
    </UploadSessionContext.Provider>
  );
};

export const useUploadSession = () => {
  const context = useContext(UploadSessionContext);
  if (!context) {
    throw new Error('useUploadSession must be used within an UploadSessionProvider');
  }
  return context;
};
