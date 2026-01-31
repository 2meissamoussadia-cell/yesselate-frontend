/**
 * Modal de commentaire pour alertes
 * Support Markdown, mentions, et upload de fichiers
 */

'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Upload,
  Image as ImageIcon,
  File,
  X,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Code,
  Eye,
  Edit3,
  AtSign,
  Hash,
} from 'lucide-react';

// ================================
// TYPES
// ================================

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  alert: {
    id: string;
    title: string;
    type: string;
    severity: 'critical' | 'warning' | 'info';
  } | null;
  onConfirm: (comment: {
    content: string;
    mentions: string[];
    attachments: File[];
  }) => void;
}

interface AttachmentPreview {
  id: string;
  file: File;
  preview?: string;
}

// ================================
// COMPONENT
// ================================

export function CommentModal({ open, onClose, alert, onConfirm }: CommentModalProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Suggestions de mentions
  const mentionSuggestions = [
    { id: 'user-001', name: 'Jean Dupont', role: 'Manager' },
    { id: 'user-002', name: 'Marie Martin', role: 'Opérateur' },
    { id: 'user-003', name: 'Pierre Dubois', role: 'Admin' },
  ];

  // Extraire les mentions du contenu
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map((m) => m.slice(1)) : [];
  };

  // Insérer du texte à la position du curseur
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    setContent(newContent);

    // Repositionner le curseur
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  // Formater le texte sélectionné
  const formatSelection = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      const newContent =
        content.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        content.substring(end);
      setContent(newContent);

      setTimeout(() => {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = end + prefix.length;
        textarea.focus();
      }, 0);
    } else {
      insertAtCursor(prefix + suffix);
    }
  };

  // Gérer l'upload de fichiers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      const preview: AttachmentPreview = {
        id: Math.random().toString(36),
        file,
      };

      // Créer une preview pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.preview = e.target?.result as string;
          setAttachments((prev) => [...prev, preview]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments((prev) => [...prev, preview]);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Supprimer un attachement
  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Render Markdown preview (simplifié)
  const renderMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-slate-700 text-blue-400 text-xs">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 underline">$1</a>')
      .replace(/@(\w+)/g, '<span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-sm">@$1</span>')
      .replace(/#(\w+)/g, '<span class="text-blue-400">#$1</span>')
      .replace(/\n/g, '<br />');
  };

  const handleConfirm = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    
    onConfirm({
      content,
      mentions: extractMentions(content),
      attachments: attachments.map((a) => a.file),
    });

    setIsSubmitting(false);
    setContent('');
    setAttachments([]);
    setShowPreview(false);
    onClose();
  };

  if (!alert) return null;

  const characterCount = content.length;
  const hasContent = content.trim().length > 0;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Ajouter un commentaire"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Alert Preview */}
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">{alert.id}</span>
            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'warning'}>
              {alert.severity}
            </Badge>
            <span className="text-sm text-slate-300 truncate">{alert.title}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <button
            onClick={() => formatSelection('**')}
            className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
            title="Gras (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatSelection('*')}
            className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
            title="Italique (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatSelection('`')}
            className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button
            onClick={() => insertAtCursor('- ')}
            className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
            title="Liste"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatSelection('[', '](url)')}
            className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
            title="Lien"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button
            onClick={() => insertAtCursor('@')}
            className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
            title="Mentionner"
          >
            <AtSign className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertAtCursor('#')}
            className="p-2 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
            title="Tag"
          >
            <Hash className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              'p-2 rounded transition-colors',
              showPreview
                ? 'bg-blue-500/20 text-blue-400'
                : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
            )}
            title="Prévisualiser"
          >
            {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Editor / Preview */}
        <div className="relative">
          {showPreview ? (
            <div
              className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 text-sm text-slate-200 prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content || '_Aucun contenu..._') }}
            />
          ) : (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ajoutez votre commentaire... Utilisez @ pour mentionner, # pour les tags, et Markdown pour formater."
                className="w-full min-h-[200px] max-h-[400px] px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-mono"
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {characterCount} caractères
              </div>
            </div>
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Fichiers joints ({attachments.length})
            </label>
            <div className="grid grid-cols-4 gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative group rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden"
                >
                  {attachment.preview ? (
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 flex flex-col items-center justify-center">
                      <File className="w-8 h-8 text-slate-400 mb-1" />
                      <p className="text-xs text-slate-400 px-2 truncate w-full text-center">
                        {attachment.file.name}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FluentButton
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5"
          >
            <Upload className="w-4 h-4 mr-2" />
            Joindre des fichiers (images, PDF, documents)
          </FluentButton>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-slate-400">
            💡 <strong className="text-blue-400">Astuce:</strong> Utilisez <code className="px-1 py-0.5 rounded bg-slate-700 text-blue-400">@nom</code> pour mentionner quelqu'un, 
            <code className="px-1 py-0.5 rounded bg-slate-700 text-blue-400 ml-1">#tag</code> pour catégoriser, 
            et <code className="px-1 py-0.5 rounded bg-slate-700 text-blue-400 ml-1">**gras**</code> ou <code className="px-1 py-0.5 rounded bg-slate-700 text-blue-400">*italique*</code> pour formater.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <FluentButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting || !hasContent}
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Publication...' : 'Publier le commentaire'}
          </FluentButton>
          <FluentButton variant="ghost" onClick={onClose}>
            Annuler
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

