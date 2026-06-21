import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ScanLine, Camera, Plus, Check, FileImage, Trash2 } from 'lucide-react';
import { useData } from '../providers/DataProvider';
import { useNotifications } from '../providers/NotificationProvider';
import { useGamification } from '../providers/GamificationProvider';
import { ScannedItem } from '../types';
import { generateId, formatCO2 } from '../lib/utils';

const MOCK_SCAN_RESULTS: ScannedItem[][] = [
  [
    { id: generateId(), name: 'Organic Milk (1L)', category: 'food', co2Amount: 1.3, sustainabilityScore: 65, alternatives: ['Oat Milk (0.3 kg CO₂)', 'Almond Milk (0.4 kg CO₂)'], quantity: 1 },
    { id: generateId(), name: 'Chicken Breast (500g)', category: 'food', co2Amount: 3.45, sustainabilityScore: 45, alternatives: ['Tofu (0.2 kg CO₂)', 'Lentils (0.4 kg CO₂)'], quantity: 1 },
    { id: generateId(), name: 'Plastic Bags (5)', category: 'shopping', co2Amount: 0.5, sustainabilityScore: 15, alternatives: ['Canvas Tote Bag', 'Paper Bags'], quantity: 5 },
    { id: generateId(), name: 'Bottled Water (6-pack)', category: 'shopping', co2Amount: 0.6, sustainabilityScore: 20, alternatives: ['Reusable Water Bottle', 'Filtered Tap Water'], quantity: 6 },
  ],
  [
    { id: generateId(), name: 'Cotton T-Shirt', category: 'shopping', co2Amount: 8.0, sustainabilityScore: 35, alternatives: ['Organic Cotton', 'Second-hand'], quantity: 1 },
    { id: generateId(), name: 'Jeans', category: 'shopping', co2Amount: 33.4, sustainabilityScore: 25, alternatives: ['Recycled Denim', 'Second-hand'], quantity: 1 },
    { id: generateId(), name: 'Sneakers', category: 'shopping', co2Amount: 14.0, sustainabilityScore: 30, alternatives: ['Eco-friendly brands', 'Repaired shoes'], quantity: 1 },
  ],
];

export default function ScannerPage() {
  const { addLog } = useData();
  const { showToast } = useNotifications();
  const { addXp, completeMission } = useGamification();
  
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScannedItem[] | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScan = (file: File) => {
    setImagePreview(URL.createObjectURL(file));
    setScanning(true);
    setResults(null);
    setSavedItems(new Set());
    
    // Simulate AI scan delay
    setTimeout(() => {
      setResults(MOCK_SCAN_RESULTS[Math.floor(Math.random() * MOCK_SCAN_RESULTS.length)]);
      setScanning(false);
      addXp(15, 'Scanned and analyzed shopping receipt');
      completeMission('scan_item');
      showToast('Scan complete! AI detected several products.', 'success');
    }, 2800);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      startScan(file);
    } else {
      showToast('Please upload a valid image file', 'warning');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startScan(file);
    }
  };

  const handleUploadClick = () => {
    if (scanning) return;
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setImagePreview(null);
    setResults(null);
    setSavedItems(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveItem = (item: ScannedItem) => {
    addLog({
      category: item.category as any,
      subCategory: item.name,
      value: item.quantity,
      unit: 'item',
      co2Amount: item.co2Amount,
      impactScore: Math.min(100, Math.round((item.co2Amount / 22) * 100)),
      date: new Date().toISOString().split('T')[0],
    });
    setSavedItems(prev => new Set([...prev, item.id]));
    showToast(`Logged "${item.name}" to carbon log!`, 'success');
  };

  const totalCO2 = results?.reduce((s, r) => s + r.co2Amount, 0) || 0;

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Eco Scanner AI</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Scan receipts, items, or food photos to compute instant carbon impact insights</p>
        </div>
        {imagePreview && (
          <button 
            onClick={handleClear} 
            className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Image
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div>
          <motion.div
            whileHover={scanning ? {} : { scale: 1.005 }}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`stat-card stat-card--empty relative overflow-hidden flex flex-col items-center justify-center min-h-[340px] border-2 border-dashed transition-all cursor-pointer ${
              dragOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800'
            }`}
          >
            {/* Real Laser Scanning Animation */}
            {scanning && (
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: 340 }}
                transition={{ duration: 1.4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] z-30"
              />
            )}

            {imagePreview ? (
              <div className="relative w-full h-full max-h-[300px] flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Upload Preview"
                  className={`max-h-[260px] object-contain rounded-xl transition-all ${
                    scanning ? 'opacity-70 blur-[0.5px]' : ''
                  }`}
                />
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-emerald-500/5 border border-emerald-500/10">
                  <Upload className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Drag & Drop Receipt / Image</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Drop an image here or click to browse files
                </p>
                <p className="text-[10px] mt-4" style={{ color: 'var(--text-tertiary)' }}>
                  Supports JPEG, PNG up to 5MB (Receipts, barcodes, grocery carts)
                </p>
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
          </motion.div>

          {/* Quick Demo Upload Buttons */}
          {!imagePreview && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { icon: FileImage, label: 'Simulate Receipt', desc: 'Mock Grocery Scan' },
                { icon: Camera, label: 'Simulate Meal', desc: 'Dietary AI Analyzer' },
                { icon: ScanLine, label: 'Simulate Barcode', desc: 'Product UPC Scanner' },
              ].map((btn, i) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    // Create a simulated File object to start the scanner
                    const mockFile = new File([''], `demo_scan_${i}.png`, { type: 'image/png' });
                    // We can just use a placeholder image URL for visual preview
                    setImagePreview('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
                    startScan(mockFile);
                  }}
                  className="stat-card stat-card--compact text-center cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <btn.icon className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
                  <p className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{btn.label}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{btn.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
 
        {/* Results Panel */}
        <div>
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.div
                key="scanning-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="stat-card stat-card--spacious flex flex-col items-center justify-center min-h-[340px] space-y-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent flex items-center justify-center"
                />
                <h3 className="text-sm font-bold text-emerald-500">AI Deep Scanning...</h3>
                <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                  Extracting receipt items and matching them against climate emission database tables
                </p>
              </motion.div>
            ) : results ? (
              <motion.div
                key="results-state"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="stat-card flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Scan Results</h3>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      Detected {results.length} items • Total Carbon Cost: {formatCO2(totalCO2)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-500">+15 XP earned</span>
                </div>
 
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                  {results.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="stat-card stat-card--compact flex flex-col justify-between border"
                      style={
                        savedItems.has(item.id)
                          ? { borderColor: 'rgba(34, 197, 94, 0.3)' }
                          : { borderColor: 'var(--border-color)' }
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            <span className="text-emerald-500 font-bold">{formatCO2(item.co2Amount)}</span>
                            <span className={`px-1.5 py-0.5 rounded-full ${item.sustainabilityScore > 50 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              Score: {item.sustainabilityScore}/100
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSaveItem(item)}
                          disabled={savedItems.has(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                          style={
                            savedItems.has(item.id)
                              ? { background: 'rgba(34, 197, 94, 0.15)' }
                              : { background: 'rgba(16, 185, 129, 0.1)' }
                          }
                        >
                          {savedItems.has(item.id) ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </motion.button>
                      </div>
 
                      {item.alternatives && item.alternatives.length > 0 && (
                        <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                          <p className="text-[9px] font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>🌿 Eco-friendly alternative options:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.alternatives.map(alt => (
                              <span key={alt} className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="stat-card stat-card--spacious flex flex-col items-center justify-center min-h-[340px] text-center text-slate-400 space-y-4 border">
                <ScanLine className="w-12 h-12 text-slate-700" />
                <h3 className="text-sm font-bold">Waiting for Scan</h3>
                <p className="text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                  Once you drop or choose a photo, the AI model will parse and extract emission data.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
