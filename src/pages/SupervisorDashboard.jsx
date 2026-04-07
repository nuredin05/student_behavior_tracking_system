import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Clock, 
  User, 
  Calendar, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

const SupervisorDashboard = () => {
  const [pendingRecords, setPendingRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchPendingRecords();
  }, []);

  const fetchPendingRecords = async () => {
    try {
      const response = await api.get('/behaviors/records/pending');
      setPendingRecords(response.data);
    } catch (error) {
      console.error('Error fetching pending records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id, decision) => {
    setProcessingId(id);
    setStatus({ type: '', message: '' });

    try {
      await api.patch(`/behaviors/records/${id}/review`, { status: decision });
      
      // Update local state by filter out the processed record
      setPendingRecords(prev => prev.filter(r => r.id !== id));
      
      setStatus({ 
        type: 'success', 
        message: `Incident ${decision === 'approved' ? 'Approved' : 'Rejected'} successfully.` 
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to review incident' 
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center -mt-20">
        <Loader2 size={48} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primaryClr mb-2">Supervisor Review Queue</h1>
          <p className="text-secondaryClr text-lg">Validate behavior logs submitted by teachers.</p>
        </div>
        <div className="bg-bgDark/60 p-4 rounded-2xl flex items-center gap-4 border border-white/5 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-primaryClr/20 flex items-center justify-center text-primaryClr">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-wider">Pending Tasks</p>
            <p className="text-xl font-bold">{pendingRecords.length} Incidents</p>
          </div>
        </div>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-fadeInUp ${
          status.type === 'success' ? 'bg-accentClr/10 text-accentClr border border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border border-dangerClr/20'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{status.message}</span>
        </div>
      )}

      {pendingRecords.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-accentClr/10 text-accentClr flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-bold text-primaryClrText mb-2">Review Queue Empty</h3>
          <p className="text-secondaryClr max-w-md">All submitted incidents have been processed. Great job keeping the school culture in check!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingRecords.map((record) => (
            <div key={record.id} className="glass-card overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
              {/* Student Identification */}
              <div className="flex items-center gap-4 lg:col-span-1">
                <div className="w-16 h-16 rounded-2xl border-2 border-white/5 overflow-hidden">
                  <img src={record.student_photo || 'https://placehold.co/100x100?text=Student'} alt="student" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{record.student_first_name} {record.student_last_name}</h4>
                  <p className="text-xs text-secondaryClr">{record.admission_number}</p>
                  <p className="text-xs text-primaryClr font-medium mt-1">Grade {record.grade_level}-{record.section}</p>
                </div>
              </div>

              {/* Behavior Details */}
              <div className="lg:col-span-2 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    record.category_type === 'positive' ? 'bg-accentClr/10 text-accentClr' : 'bg-dangerClr/10 text-dangerClr'
                  }`}>
                    {record.category_name}
                  </span>
                  <span className="text-secondaryClr text-xs flex items-center gap-1">
                    <Calendar size={12} /> {new Date(record.incident_date).toLocaleDateString()}
                  </span>
                  <span className="text-secondaryClr text-xs flex items-center gap-1">
                    <User size={12} /> By {record.teacher_first_name} {record.teacher_last_name}
                  </span>
                </div>
                <p className="text-primaryClrText font-medium text-sm leading-relaxed mb-3">
                  {record.comment || 'No description provided by teacher.'}
                </p>
                {record.evidence_url && (
                  <a 
                    href={record.evidence_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-primaryClr hover:underline"
                  >
                    <ExternalLink size={14} /> View Evidence Photo
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-1 flex flex-row lg:flex-col items-center justify-center gap-4">
                <div className={`text-2xl font-bold mb-0 lg:mb-4 ${record.points_applied >= 0 ? 'text-accentClr' : 'text-dangerClr'}`}>
                  {record.points_applied >= 0 ? '+' : ''}{record.points_applied}
                </div>
                <div className="flex gap-2 w-full max-w-[200px]">
                  <button 
                    onClick={() => handleReview(record.id, 'approved')}
                    disabled={processingId === record.id}
                    className="flex-1 btn-primary py-3 px-3 bg-accentClr hover:bg-accentClrDark flex items-center justify-center disabled:opacity-50"
                  >
                    {processingId === record.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={24} />}
                  </button>
                  <button 
                    onClick={() => handleReview(record.id, 'rejected')}
                    disabled={processingId === record.id}
                    className="flex-1 py-3 px-3 border border-dangerClr/20 hover:bg-dangerClr/10 text-dangerClr rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  >
                    {processingId === record.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={24} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
