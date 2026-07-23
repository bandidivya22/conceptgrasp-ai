import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  Search,
  FileText,
  Trash2,
  Pencil,
  Eye,
  File,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { documentService } from '../services/documentService';
import type { DocumentItem } from '../types';
import { Card, Button, Input, EmptyState, Modal, ConfirmDialog, Badge, useToast, Spinner } from '../components/ui';
import { formatFileSize, formatDate, cn } from '../utils/format';

export default function Documents() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', subject: 'General', tags: '' });
  const [editForm, setEditForm] = useState({ title: '', description: '', subject: 'General', tags: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page, search, subject],
    queryFn: () => documentService.getAll({ page, limit: 9, search, subject }),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: typeof uploadForm }) =>
      documentService.upload(file, metadata),
    onSuccess: () => {
      toast('Document uploaded successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setUploadOpen(false);
      setFile(null);
      setUploadForm({ title: '', description: '', subject: 'General', tags: '' });
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: typeof editForm }) =>
      documentService.update(id, {
        title: payload.title,
        description: payload.description,
        subject: payload.subject,
        tags: payload.tags,
      }),
    onSuccess: () => {
      toast('Document updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setEditDoc(null);
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.delete,
    onSuccess: () => {
      toast('Document deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setDeleteId(null);
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      if (!uploadForm.title) setUploadForm((p) => ({ ...p, title: f.name.replace(/\.[^/.]+$/, '') }));
    }
  }, [uploadForm.title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!uploadForm.title) setUploadForm((p) => ({ ...p, title: f.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const openEdit = (doc: DocumentItem) => {
    setEditDoc(doc);
    setEditForm({
      title: doc.title,
      description: doc.description || '',
      subject: doc.subject,
      tags: doc.tags.join(', '),
    });
  };

  const downloadDoc = async (doc: DocumentItem) => {
    let content = doc.content || '';
    if (!content) {
      try {
        content = await documentService.getContent(doc.id);
      } catch {
        content = '';
      }
    }
    const blob = new Blob([content], { type: doc.file_type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.file_name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openPreview = async (doc: DocumentItem) => {
    setPreviewDoc(doc);
    if (!doc.content) {
      try {
        const content = await documentService.getContent(doc.id);
        setPreviewDoc({ ...doc, content });
      } catch {
        // keep preview without content
      }
    }
  };

  const subjects = ['All', 'General', 'Mathematics', 'Science', 'History', 'Computer Science', 'Literature'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your study materials</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <select
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setPage(1); }}
          className="input-field sm:w-48 cursor-pointer"
        >
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : data?.documents.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card hover className="flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{doc.title}</h3>
                      <p className="text-xs text-slate-500 truncate">{doc.file_name}</p>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">{doc.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge color="primary">{doc.subject}</Badge>
                    <Badge color="slate">{formatFileSize(doc.file_size)}</Badge>
                    <Badge color="slate">{formatDate(doc.created_at)}</Badge>
                  </div>

                  <div className="mt-auto flex items-center gap-1 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <Button variant="ghost" size="sm" onClick={() => openPreview(doc)}>
                      <Eye className="h-4 w-4" /> View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadDoc(doc)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(doc)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleteId(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Page {page} of {data.pagination.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<File className="h-8 w-8" />}
          title="No documents yet"
          description="Upload your first study material to get started"
          action={<Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" /> Upload Document</Button>}
        />
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document" size="md">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition',
            dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-300">
              <FileText className="h-5 w-5" />
              <span className="font-medium">{file.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="ml-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT (max 20MB)</p>
            </>
          )}
        </div>

        {file && (
          <div className="space-y-4 mt-4">
            <Input label="Title" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="Document title" />
            <Input label="Description" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} placeholder="Optional description" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Subject" value={uploadForm.subject} onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })} placeholder="Subject" />
              <Input label="Tags (comma separated)" value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })} placeholder="tag1, tag2" />
            </div>
            <Button
              className="w-full"
              loading={uploadMutation.isPending}
              onClick={() => file && uploadMutation.mutate({ file, metadata: uploadForm })}
            >
              Upload Document
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={!!editDoc} onClose={() => setEditDoc(null)} title="Edit Document" size="md">
        <div className="space-y-4">
          <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <Input label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Subject" value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} />
            <Input label="Tags (comma separated)" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
          </div>
          <Button
            className="w-full"
            loading={updateMutation.isPending}
            onClick={() => editDoc && updateMutation.mutate({ id: editDoc.id, payload: editForm })}
          >
            Save Changes
          </Button>
        </div>
      </Modal>

      <Modal open={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc?.title || 'Document'} size="lg">
        {previewDoc && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge color="primary">{previewDoc.subject}</Badge>
              <Badge color="slate">{formatFileSize(previewDoc.file_size)}</Badge>
              <Badge color="slate">{formatDate(previewDoc.created_at)}</Badge>
            </div>
            {previewDoc.description && <p className="text-sm text-slate-600 dark:text-slate-300">{previewDoc.description}</p>}
            {previewDoc.content ? (
              <pre className="w-full h-[50vh] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-mono">
                {previewDoc.content}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-300 mb-4">Text preview not available for this file type</p>
                <Button onClick={() => downloadDoc(previewDoc)}>
                  Download to view
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
