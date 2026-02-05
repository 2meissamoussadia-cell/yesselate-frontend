/**
 * InvoiceFormModal
 * Modale pour créer ou modifier une facture
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  X,
  Plus,
  Trash2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Save,
  Send,
} from 'lucide-react';
import type { Invoice, InvoiceItem } from '@/lib/data/finances/mockData';

interface InvoiceFormModalProps {
  invoice?: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
}

export function InvoiceFormModal({
  invoice,
  isOpen,
  onClose,
  onSave,
}: InvoiceFormModalProps) {
  const [formData, setFormData] = useState<Partial<Invoice>>({
    client: '',
    clientEmail: '',
    project: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    currency: 'XOF',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    paymentStatus: 'unpaid',
    amountPaid: 0,
    bureau: 'BTP',
    notes: '',
    termsConditions: 'Paiement sous 30 jours.',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
      setItems(invoice.items || []);
    }
  }, [invoice]);

  useEffect(() => {
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = 0; // No tax for now
    const total = subtotal + tax;

    setFormData((prev) => ({ ...prev, subtotal, tax, total }));
  }, [items]);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: String(items.length + 1), description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (action: 'save' | 'send') => {
    const status = action === 'send' ? 'sent' : 'draft';
    onSave({ ...formData, items, status });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-200">
                  {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
                </h2>
                {invoice && (
                  <p className="text-sm text-slate-400">{invoice.invoiceNumber}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informations client
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Nom du client *</label>
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) =>
                        setFormData({ ...formData, client: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                      placeholder="Alpha Corporation"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Email *</label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, clientEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                      placeholder="finance@alphacorp.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Projet</label>
                    <input
                      type="text"
                      value={formData.project}
                      onChange={(e) =>
                        setFormData({ ...formData, project: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                      placeholder="PROJ-2024-045"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Bureau</label>
                    <Select value={formData.bureau} onValueChange={(v) => setFormData({ ...formData, bureau: v })}>
                      <SelectTrigger className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-cyan-500/30">
                        <SelectValue placeholder="Bureau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTP">BTP</SelectItem>
                        <SelectItem value="BJ">BJ</SelectItem>
                        <SelectItem value="BS">BS</SelectItem>
                        <SelectItem value="BME">BME</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Date d'émission *</label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, issueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Date d'échéance *</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Articles
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 space-y-3"
                    >
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-5 space-y-1">
                          <label className="text-xs text-slate-400">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, 'description', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                            placeholder="Description de l'article"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs text-slate-400">Quantité</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', Number(e.target.value))
                            }
                            min="1"
                            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs text-slate-400">Prix unitaire</label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(index, 'unitPrice', Number(e.target.value))
                            }
                            min="0"
                            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs text-slate-400">Total</label>
                          <div className="px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm font-semibold">
                            {new Intl.NumberFormat('fr-FR').format(item.total)}
                          </div>
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="h-10 w-10 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Sous-total:</span>
                    <span className="font-semibold text-slate-200">
                      {new Intl.NumberFormat('fr-FR').format(formData.subtotal || 0)} XOF
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Taxes:</span>
                    <span className="font-semibold text-slate-200">
                      {new Intl.NumberFormat('fr-FR').format(formData.tax || 0)} XOF
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-base font-semibold text-slate-200">Total:</span>
                    <span className="text-2xl font-bold text-cyan-400">
                      {new Intl.NumberFormat('fr-FR').format(formData.total || 0)} XOF
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 resize-none"
                    placeholder="Notes additionnelles..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Conditions de paiement</label>
                  <textarea
                    value={formData.termsConditions}
                    onChange={(e) =>
                      setFormData({ ...formData, termsConditions: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 resize-none"
                    placeholder="Conditions de paiement..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/60">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-700 text-slate-400 hover:text-slate-200"
            >
              Annuler
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit('save')}
                className="border-slate-700 text-slate-300 hover:text-slate-100"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer brouillon
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSubmit('send')}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer la facture
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

