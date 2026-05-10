import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const certId = parseInt(id, 10);

  if (isNaN(certId)) return notFound();

  const certificate = await db.certificate.findUnique({
    where: { id: certId },
    include: {
      enrollment: {
        include: {
          user: true,
          course: {
            include: {
              instructor: true
            }
          }
        }
      }
    }
  });

  if (!certificate || certificate.isDeleted === 1) {
    return notFound();
  }

  const studentName = certificate.enrollment.user.name;
  const courseTitle = certificate.enrollment.course.title;
  const instructorName = certificate.enrollment.course.instructor.name;
  const dateStr = certificate.issuedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
      
      {/* ── Print Controls (Hidden in Print) ── */}
      <div className="mb-8 flex gap-4 print:hidden">
        <button 
          className="bg-[#FF6B4A] hover:bg-[#fa5a36] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95"
          style={{ cursor: "pointer" }}
        >
          {/* A tiny bit of client-side logic to trigger print */}
          <script dangerouslySetInnerHTML={{ __html: `
            document.currentScript.parentElement.onclick = function() { window.print(); }
          `}} />
          <Download size={18} /> Download / Print PDF
        </button>
      </div>

      {/* ── Certificate Container ── */}
      <div 
        className="relative bg-white w-full max-w-[1050px] aspect-[1.414/1] shadow-2xl overflow-hidden print:shadow-none print:w-[100vw] print:h-[100vh] print:max-w-none print:aspect-auto"
      >
        {/* Decorative Borders */}
        <div className="absolute inset-4 border-[12px] border-slate-100 print:inset-0 print:border-8"></div>
        <div className="absolute inset-8 border border-slate-300 print:inset-4"></div>
        
        {/* Corner Ornaments */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-orange-400 print:top-4 print:left-4"></div>
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-orange-400 print:top-4 print:right-4"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-orange-400 print:bottom-4 print:left-4"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-orange-400 print:bottom-4 print:right-4"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-24 print:px-12">
          
          <div className="mb-6">
            {/* Logo placeholder */}
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B4A] to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md transform rotate-3">
              L
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-widest uppercase mt-4">Learnify</h2>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-6 text-balance">
            Certificate of Completion
          </h1>

          <p className="text-lg text-slate-500 font-medium uppercase tracking-widest mb-4">
            This is proudly presented to
          </p>

          <h3 className="text-4xl font-black text-[#FF6B4A] mb-8 font-serif italic border-b border-slate-200 pb-2 inline-block px-12">
            {studentName}
          </h3>

          <p className="text-slate-600 font-medium max-w-2xl text-lg text-balance leading-relaxed mb-12">
            For successfully completing the comprehensive course<br/>
            <strong className="text-xl text-slate-800">"{courseTitle}"</strong><br/>
            and demonstrating outstanding dedication to learning.
          </p>

          {/* Footer Grid */}
          <div className="w-full grid grid-cols-3 gap-8 items-end mt-4">
            <div className="flex flex-col items-center">
              <p className="text-lg font-bold text-slate-800 mb-1">{dateStr}</p>
              <div className="w-32 h-[1px] bg-slate-300 mb-2"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date Issued</p>
            </div>
            
            <div className="flex flex-col items-center pb-2">
              <div className="w-24 h-24 bg-orange-50 rounded-full border border-orange-100 flex items-center justify-center shadow-inner relative">
                {/* Ribbon decoration */}
                <div className="absolute -bottom-2 w-16 h-6 bg-yellow-400 -rotate-12 rounded-sm shadow-sm" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }}></div>
                <div className="absolute -bottom-2 w-16 h-6 bg-yellow-500 rotate-12 rounded-sm shadow-sm" style={{ clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)", zIndex: -1 }}></div>
                <span className="text-[#FF6B4A] font-black text-xs uppercase tracking-widest absolute">Verified</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-lg font-black font-serif italic text-slate-800 mb-1 signature-font">{instructorName}</p>
              <div className="w-40 h-[1px] bg-slate-300 mb-2"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instructor</p>
            </div>
          </div>

          <p className="absolute bottom-12 text-[10px] text-slate-300 font-mono tracking-wider">
            Credential ID: {certificate.certificateNumber}
          </p>

        </div>
      </div>
      
      {/* ── CSS for print ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: landscape; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />
    </div>
  );
}
