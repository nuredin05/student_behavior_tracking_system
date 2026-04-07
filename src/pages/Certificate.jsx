import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Loader2, Printer, ArrowLeft, Trophy, ShieldCheck, Award } from 'lucide-react';

const Certificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await api.get(`/behaviors/certificate/${id}`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching certificate:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-bgDarkAll text-white">
      <Loader2 className="animate-spin text-primaryClr" size={48} />
    </div>
  );

  if (!data) return <div className="p-8 text-center text-dangerClr font-bold">Data could not be loaded.</div>;

  const { student, stats, conductGrade, schoolName, academicYear, generatedAt } = data;

  return (
    <div className="min-h-screen bg-bgDarkAll p-4 md:p-10 flex flex-col items-center">
      {/* Action Bar (Hidden on print) */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondaryClr hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px] font-black"
        >
          <ArrowLeft size={16} /> Close Preview
        </button>
        <button 
          onClick={handlePrint}
          className="btn-primary px-6 py-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <Printer size={18} /> Print Certificate
        </button>
      </div>

      {/* The Certificate Paper */}
      <div 
        ref={printRef}
        className="certificate-paper w-full max-w-[800px] aspect-[1/1.414] bg-white text-slate-900 overflow-hidden relative shadow-2xl p-4 sm:p-8"
        style={{ color: '#1e293b' }}
      >
        {/* Ornate Border */}
        <div className="absolute inset-4 border-[12px] border-double border-primaryClr/30 rounded-sm pointer-events-none"></div>
        <div className="absolute inset-8 border border-primaryClr/20 rounded-sm pointer-events-none"></div>
        
        {/* Corner Decors */}
        <div className="absolute top-4 left-4 w-24 h-24 border-t-8 border-l-8 border-primaryClr rounded-tl-sm"></div>
        <div className="absolute top-4 right-4 w-24 h-24 border-t-8 border-r-8 border-primaryClr rounded-tr-sm"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 border-b-8 border-l-8 border-primaryClr rounded-bl-sm"></div>
        <div className="absolute bottom-4 right-4 w-24 h-24 border-b-8 border-r-8 border-primaryClr rounded-br-sm"></div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col items-center text-center px-12 py-16">
          <div className="mb-4">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-primaryClr/20 p-2">
                <img src="/logo.png" alt="School Logo" className="w-full h-full object-contain" />
             </div>
             <h3 className="text-sm uppercase tracking-[0.3em] font-black italic text-secondaryClr/60 mb-1">{schoolName}</h3>
             <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-10">Bishoftu, Ethiopia</h4>
          </div>

          <div className="space-y-4 mb-12">
            <h1 className="text-6xl font-serif font-black tracking-tight text-slate-800" style={{ fontFamily: "'Times New Roman', serif" }}>
              Conduct Certificate
            </h1>
            <div className="h-1 w-24 bg-primaryClr mx-auto"></div>
          </div>

          <p className="text-lg font-serif italic text-slate-600 mb-8" style={{ fontFamily: "'Times New Roman', serif text-xl" }}>
            This is to certify that
          </p>

          <div className="mb-10 w-full">
            <h2 className="text-5xl font-black text-primaryClr border-b-2 border-slate-200 pb-4 inline-block px-12 min-w-[60%]">
              {student.first_name} {student.last_name}
            </h2>
          </div>

          <div className="max-w-xl text-center space-y-6 mb-16">
             <p className="text-lg leading-relaxed text-slate-700">
               Has been a student of <span className="font-bold">Grade {student.grade_level}-{student.section}</span> 
               during the Academic Year <span className="font-bold">{academicYear}</span>. 
               Their general conduct and overall behavior throughout this period has been:
             </p>

             <div className="p-8 rounded-3xl bg-primaryClr/5 border-2 border-primaryClr/10 inline-block px-16 relative">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-white text-[10px] font-black uppercase tracking-widest text-primaryClr">Behavior Rating</div>
                 <span className="text-4xl font-black text-primaryClr uppercase tracking-widest">
                   {conductGrade}
                 </span>
             </div>
          </div>

          {/* Detailed Stats (Small) */}
          <div className="grid grid-cols-3 gap-8 mb-20 w-full max-w-md opacity-70">
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Net Balance</p>
              <p className="font-bold text-lg">{student.current_points} pts</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Positive Acts</p>
              <p className="font-bold text-lg">{stats.total_positive || 0}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Violations</p>
              <p className="font-bold text-lg">{stats.total_negative || 0}</p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-auto w-full flex justify-between px-10 items-end">
            <div className="text-center">
              <div className="w-48 border-b border-slate-400 mb-2"></div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Class Teacher</p>
              <p className="text-[10px] font-bold">{student.teacher_first_name} {student.teacher_last_name}</p>
            </div>

            <div className="text-center relative">
               {/* School Seal Placeholder */}
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-dashed border-primaryClr/20 flex items-center justify-center opacity-40">
                  <span className="text-[8px] font-black text-primaryClr uppercase text-center">Amana School <br/> Seal</span>
               </div>
               <p className="text-xs font-black text-slate-300 pointer-events-none mt-10">____________________</p>
               <p className="text-xs font-black uppercase tracking-widest text-primaryClr mt-2">Supervisor Signature</p>
               <p className="text-[8px] text-slate-400 mt-1">Ref: {id.substring(0,8).toUpperCase()}</p>
            </div>

            <div className="text-center">
              <div className="w-48 border-b border-slate-400 mb-2"></div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">School Principal</p>
              <p className="text-[10px] font-bold">Authorized Signatory</p>
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
             <ShieldCheck size={400} />
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-paper, .certificate-paper * {
            visibility: visible;
          }
          .certificate-paper {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            width: 100%;
            height: 100%;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Certificate;
