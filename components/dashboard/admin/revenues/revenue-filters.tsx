"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RevenueFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [start, setStart] = useState(searchParams.get("start") || "");
  const [end, setEnd] = useState(searchParams.get("end") || "");
  const [isExporting, setIsExporting] = useState(false);

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (start) params.set("start", start);
    else params.delete("start");
    if (end) params.set("end", end);
    else params.delete("end");
    
    // Reset to page 1 when filtering
    params.delete("page");
    
    router.push(`?${params.toString()}`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    let url = "/api/admin/revenues/export";
    if (start && end) {
      url += `?startDate=${start}&endDate=${end}`;
    }
    
    // Trigger download via anchor
    const link = document.createElement("a");
    link.href = url;
    link.download = "Laporan.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between w-full gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-1.5 rounded-[1.25rem] shadow-sm border border-slate-100 w-full lg:w-auto">
        <div className="flex flex-col px-3 py-1 w-full sm:w-auto">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dari Tanggal</label>
          <input 
            type="date" 
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="text-sm font-bold text-slate-700 outline-none bg-transparent"
          />
        </div>
        <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
        <div className="flex flex-col px-3 py-1 w-full sm:w-auto">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sampai Tanggal</label>
          <input 
            type="date" 
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="text-sm font-bold text-slate-700 outline-none bg-transparent"
          />
        </div>
        <Button 
          onClick={handleFilter}
          className="w-full sm:w-auto rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 h-11"
        >
          Filter
        </Button>
      </div>
      
      <Button 
        onClick={handleExport}
        disabled={isExporting}
        className="w-full lg:w-auto h-12 px-6 bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-[1.25rem] flex items-center gap-2 font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
      >
        <Download size={16} /> 
        {isExporting ? "Memproses..." : "Export Report (.xlsx)"}
      </Button>
    </div>
  );
}
