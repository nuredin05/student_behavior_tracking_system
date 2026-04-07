import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Loader2, 
  Printer, 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  History,
  LifeBuoy
} from 'lucide-react';

const StudentReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await api.get(`/students/${id}/full-profile`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-bgDarkAll text-white font-display">
      <div className="text-center">
        <Loader2 className="animate-spin text-primaryClr mx-auto mb-4" size={48} />
        <p className="text-secondaryClr uppercase tracking-widest text-xs font-bold">Generating Report...</p>
      </div>
    </div>
  );

  if (!data) return <div className="p-8 text-center text-dangerClr font-bold">Failed to load student narrative report.</div>;

  const { student, history, interventions } = data;

  const positiveCount = history.filter(h => h.category_type === 'positive').length;
  const negativeCount = history.filter(h => h.category_type === 'negative').length;

  return (
    <div className="min-h-screen bg-bgDarkAll p-4 md:p-10 flex flex-col items-center">
      {/* Action Bar (Hidden on print) */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondaryClr hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px] font-black"
        >
          <ArrowLeft size={16} /> Exit Report View
        </button>
        <button 
          onClick={handlePrint}
          className="btn-primary px-6 py-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <Printer size={18} /> Print Behavior Report
        </button>
      </div>

      {/* The Report Paper */}
      <div className="report-paper w-full max-w-[900px] bg-white text-slate-900 shadow-2xl p-10 font-serif" style={{ minHeight: '1120px' }}>
        
        {/* School Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8 text-slate-800">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-slate-900 text-white rounded flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Amana Model Secondary School</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Student Affairs Development Office</p>
              <p className="text-[10px] text-slate-400">Bishoftu, Ethiopia • Tel: +251 114 33 00 00</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-slate-100 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-1">Official Narrative Report</div>
            <p className="text-[10px]">Academic Year: 2023/2024</p>
            <p className="text-[10px]">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Student Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
             <h2 className="text-sm font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block -skew-x-12">Student Profile</h2>
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Full Name:</span>
                <span className="font-bold">{student.first_name} {student.last_name}</span>
                
                <span className="text-slate-400 uppercase text-[10px] font-bold">Admission #:</span>
                <span className="font-bold">{student.admission_number}</span>
                
                <span className="text-slate-400 uppercase text-[10px] font-bold">Grade/Section:</span>
                <span className="font-bold">Grade {student.grade_level}-{student.section}</span>

                <span className="text-slate-400 uppercase text-[10px] font-bold">Current Conduct:</span>
                <span className={`font-black uppercase text-xs ${student.current_points >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                   {student.current_points} Net Points
                </span>
             </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Behavioral Metrics</h2>
             <div className="flex justify-around items-center text-center">
                <div>
                   <p className="text-2xl font-black text-green-600">{positiveCount}</p>
                   <p className="text-[8px] uppercase font-bold text-slate-500">Positives</p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                   <p className="text-2xl font-black text-red-600">{negativeCount}</p>
                   <p className="text-[8px] uppercase font-bold text-slate-500">Violations</p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                   <p className="text-2xl font-black text-slate-800">{history.length}</p>
                   <p className="text-[8px] uppercase font-bold text-slate-500">Total Logs</p>
                </div>
             </div>
          </div>
        </div>

        {/* Narrative Timeline */}
        <div className="mb-12">
          <h2 className="text-sm font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block -skew-x-12 mb-6">Incident History & Narrative Log</h2>
          {history.length === 0 ? (
            <div className="border border-dashed border-slate-300 p-8 text-center text-slate-400">
               <History size={32} className="mx-auto mb-2 opacity-20" />
               <p className="text-xs uppercase font-bold">No historical incidents recorded.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-[10px] uppercase font-black text-slate-500">
                  <th className="py-2 px-2 w-[15%]">Date</th>
                  <th className="py-2 px-2 w-[25%]">Category</th>
                  <th className="py-2 px-2 w-[10%]">Points</th>
                  <th className="py-2 px-2 w-[50%]">Supervisor/Teacher Observations</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {history.map((record, idx) => (
                  <tr key={idx} className="border-b border-slate-100 align-top">
                    <td className="py-3 px-2 font-bold">{new Date(record.incident_date).toLocaleDateString()}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${record.category_type === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-bold">{record.category_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                       <span className={`font-black ${record.points_applied >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {record.points_applied >= 0 ? '+' : ''}{record.points_applied}
                       </span>
                    </td>
                    <td className="py-3 px-2 italic text-slate-600 leading-normal">
                      "{record.comment || 'No narrative provided.'}"
                      <p className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter not-italic">— Logged by {record.teacher_first_name} {record.teacher_last_name}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Interventions & Counseling Support */}
        <div className="mb-12">
          <h2 className="text-sm font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block -skew-x-12 mb-6">Support Measures & Interventions</h2>
          {interventions.filter(i => i.status !== 'rejected').length === 0 ? (
            <div className="border border-dashed border-slate-300 p-8 text-center text-slate-400">
               <LifeBuoy size={32} className="mx-auto mb-2 opacity-20" />
               <p className="text-xs uppercase font-bold">No active counseling or support measures on record.</p>
            </div>
          ) : (
             <div className="space-y-4">
                {interventions.filter(i => i.status !== 'rejected').map((action, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border-l-4 border-slate-900 rounded-sm">
                    <div className="flex justify-between items-start mb-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action Plan #{idx + 1}</p>
                       <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded uppercase font-black">{action.status}</span>
                    </div>
                    <p className="text-xs font-bold mb-1 leading-normal text-slate-800">{action.action_taken}</p>
                    <p className="text-[9px] text-slate-500 italic">Initiated on {new Date(action.created_at).toLocaleDateString()} by {action.creator_first_name} {action.creator_last_name}</p>
                  </div>
                ))}
             </div>
          )}
        </div>

        {/* Admin Footer */}
        <div className="mt-auto pt-16 grid grid-cols-3 gap-12 text-center text-slate-400">
           <div>
              <div className="border-b-2 border-slate-200 mb-2"></div>
              <p className="text-[9px] uppercase font-black tracking-widest">Class Teacher</p>
           </div>
           <div>
              <div className="border-b-2 border-slate-200 mb-2"></div>
              <p className="text-[9px] uppercase font-black tracking-widest">Counselor / Supervisor</p>
           </div>
           <div>
              <div className="border-b-2 border-slate-200 mb-2"></div>
              <p className="text-[9px] uppercase font-black tracking-widest">School Principal</p>
           </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center opacity-30 select-none">
           <p className="text-[8px] uppercase font-bold text-slate-500 max-w-sm mx-auto">
             This document is a confidential narrative of student conduct at Amana Model School. 
             Unauthorized distribution is strictly prohibited. Generated via AMSS Behavior Management Portal.
           </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .report-paper, .report-paper * {
            visibility: visible;
          }
          .report-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentReport;
