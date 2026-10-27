"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileSpreadsheet, Upload, Check, AlertCircle, Loader2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
}

export function ImportExcelModal({
  isOpen,
  onClose,
  onImport,
}: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        setError("Please upload a valid Excel or CSV file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        if (json.length === 0) {
          setError("The file appears to be empty.");
          return;
        }

        // Validate structure
        const firstRow = json[0] as any;
        const hasRequired = ('Name' in firstRow || 'name' in firstRow) && ('Date' in firstRow || 'date' in firstRow || 'Birthday' in firstRow);
        
        if (!hasRequired) {
          setError("File must have columns: 'Name' and 'Date' (YYYY-MM-DD).");
          return;
        }

        const mapped = json.map((row: any) => ({
          name: row.Name || row.name,
          date: formatDate(row.Date || row.date || row.Birthday),
          relationship: row.Relationship || row.relationship || "Friend",
          notes: row.Notes || row.notes || "",
          reminder_6am: true,
          reminder_6pm: false
        })).filter((item: any) => item.name && item.date);

        setPreview(mapped);
      } catch (err) {
        setError("Error parsing file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const formatDate = (val: any) => {
    if (!val) return "";
    if (typeof val === 'number') {
      // Excel date (number of days since 1900-01-01)
      const date = XLSX.SSF.parse_date_code(val);
      const y = date.y;
      const m = String(date.m).padStart(2, '0');
      const d = String(date.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Try string parse
    const s = String(val).trim();
    if (s.match(/^\d{4}-\d{2}-\d{2}$/)) return s;
    if (s.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [d, m, y] = s.split('/');
        return `${y}-${m}-${d}`;
    }
    return s; // Fallback
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    try {
      await onImport(preview);
      onClose();
      setFile(null);
      setPreview([]);
    } catch (err) {
      setError("Failed to import data.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Name: "John Doe", Date: "1995-05-20", Relationship: "Friend", Notes: "Likes coffee" },
      { Name: "Jane Smith", Date: "1998-12-15", Relationship: "Family", Notes: "" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Birthdays");
    XLSX.writeFile(wb, "birthday_template.xlsx");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[111] px-4 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="glass shadow-2xl rounded-[32px] p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <FileSpreadsheet size={24} />
                  </div>
                  Import from Excel
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {!file ? (
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-[32px] p-12 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-emerald-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Click to upload</h3>
                    <p className="text-slate-500 text-sm">Download our template or use your own .xlsx / .csv</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept=".xlsx, .xls, .csv" 
                      className="hidden" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Check size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Need a template?</p>
                        <p className="text-xs text-slate-500">Includes correct column names</p>
                      </div>
                    </div>
                    <button 
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400">
                      <AlertCircle className="shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold text-sm">Upload Error</p>
                        <p className="text-xs opacity-80">{error}</p>
                        <button 
                          onClick={() => setFile(null)}
                          className="mt-2 text-xs font-black uppercase tracking-widest hover:underline"
                        >
                          Try different file
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                            <FileSpreadsheet size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{file.name}</p>
                            <p className="text-xs text-slate-500">{preview.length} rows found</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setFile(null)}
                          className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white"
                        >
                          Change
                        </button>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-white/5 bg-white/5 no-scrollbar">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-white/5 text-slate-500 sticky top-0">
                            <tr>
                              <th className="p-4 font-black uppercase tracking-widest text-[10px]">Name</th>
                              <th className="p-4 font-black uppercase tracking-widest text-[10px]">Date</th>
                              <th className="p-4 font-black uppercase tracking-widest text-[10px]">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {preview.map((row, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium">{row.name}</td>
                                <td className="p-4 text-slate-400 font-mono text-xs">{row.date}</td>
                                <td className="p-4">
                                  <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-slate-500">{row.relationship}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button
                        onClick={handleImport}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl p-4 font-bold text-lg flex items-center justify-center gap-2 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] active:scale-95 transition-all text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Check size={20} />
                            Save {preview.length} Birthdays
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
