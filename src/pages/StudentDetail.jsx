import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  ArrowLeft, 
  Trophy, 
  AlertTriangle, 
  Calendar, 
  User, 
  School, 
  Shield, 
  Clock,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Frontend fetching profile for student ID:', id);
      try {
        const apiUrl = `/students/${id}/full-profile`;
        console.log('Full API path being requested:', apiUrl);
        const response = await api.get(apiUrl);
        console.log('Response from API:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching student profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center -mt-20">
        <Loader2 size={48} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-dangerClr font-bold">Student not found</div>;

  const { student, history, interventions } = data;

  return (
    <div className="space-y-8 animate-fadeInUp pb-20">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-secondaryClr hover:text-primaryClr transition-colors font-medium group"
        >
          <div className="p-2 rounded-xl bg-bgDark border border-white/5 group-hover:bg-primaryClr group-hover:text-white transition-all">
            <ArrowLeft size={20} />
          </div>
          Back to Registry
        </button>
        <div className="flex gap-3">
          <button className="btn-secondary px-4 py-2 text-xs">Print Report</button>
          <button className="btn-primary px-4 py-2 text-xs">Log New Behavior</button>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="glass-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <School size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl border-4 border-white/5 overflow-hidden shadow-2xl relative z-10">
              <img 
                src={student.photo_url || `https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=6c5dd3&color=fff&size=512`} 
                alt="student" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-bgDark shadow-xl z-20 ${student.current_points >= 0 ? 'bg-accentClr text-white' : 'bg-dangerClr text-white'}`}>
              {student.current_points >= 0 ? <Trophy size={20} /> : <AlertTriangle size={20} />}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-4xl font-display font-bold text-primaryClrText">{student.first_name} {student.last_name}</h1>
              <span className="px-4 py-1 rounded-full bg-bgDark border border-white/5 text-primaryClr font-mono text-sm">
                ID: {student.admission_number}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold mb-1">Grade Level</p>
                <p className="text-lg font-bold">Grade {student.grade_level}-{student.section}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold mb-1">Current Balance</p>
                <p className={`text-lg font-bold ${student.current_points >= 0 ? 'text-accentClr' : 'text-dangerClr'}`}>
                  {student.current_points} Points
                </p>
              </div>
              <div>
                <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold mb-1">Total Incidents</p>
                <p className="text-lg font-bold">{history.length} Approved</p>
              </div>
              <div>
                <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold mb-1">Status</p>
                <span className="inline-flex items-center gap-1.5 text-accentClr text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-accentClr"></span>
                  Active
                </span>
              </div>
              <div>
                <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold mb-1">Guardian Contact</p>
                <p className="text-lg font-bold">{student.parent_phone || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Clock className="text-primaryClr" /> Behavior Timeline
            </h3>
            <div className="flex items-center gap-2 text-xs text-secondaryClr">
              <span className="w-3 h-3 rounded-full bg-accentClr/20 border border-accentClr"></span> Positive
              <span className="w-3 h-3 rounded-full bg-dangerClr/20 border border-dangerClr ml-2"></span> Negative
            </div>
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="glass-card py-16 text-center opacity-40">
                <p>No behavioral history recorded yet.</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <div key={item.id} className="relative pl-10 group">
                  {/* Timeline connector line */}
                  {idx !== history.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-white/5"></div>
                  )}
                  
                  {/* Timeline indicator */}
                  <div className={`absolute left-0 top-2 w-10 h-10 rounded-xl border-2 border-bgDark flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${item.points_applied >= 0 ? 'bg-accentClr/10 text-accentClr' : 'bg-dangerClr/10 text-dangerClr'}`}>
                    {item.points_applied >= 0 ? <Trophy size={16} /> : <AlertTriangle size={16} />}
                  </div>

                  <div className="glass-card hover:border-primaryClr/20 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-primaryClrText">{item.category_name}</h4>
                          <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${item.points_applied >= 0 ? 'bg-accentClr/10 text-accentClr' : 'bg-dangerClr/10 text-dangerClr'}`}>
                            {item.points_applied >= 0 ? '+' : ''}{item.points_applied} Points
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-secondaryClr">
                          <span className="flex items-center gap-1.5">
                            <User size={12} /> {item.teacher_first_name} {item.teacher_last_name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} /> {new Date(item.incident_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {item.comment && (
                      <div className="p-4 rounded-xl bg-bgDark/50 border border-white/5 text-sm text-secondaryClr italic leading-relaxed">
                        "{item.comment}"
                      </div>
                    )}
                    {item.evidence_url && (
                      <a 
                        href={item.evidence_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-4 flex items-center gap-2 text-[10px] text-primaryClr hover:underline uppercase font-bold tracking-widest"
                      >
                        <FileText size={12} /> View Attached Evidence
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Side Panel (Right 1 col) */}
        <div className="space-y-8">
          {/* Active Interventions */}
          <div className="glass-card h-fit">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
              <Shield size={18} className="text-primaryClr" /> Follow-ups
            </h3>
            <div className="space-y-4">
              {interventions.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-30">
                  <p className="text-sm">No active interventions</p>
                </div>
              ) : (
                interventions.map(action => (
                  <div key={action.id} className="p-4 rounded-2xl bg-bgDark border border-white/5 hover:border-primaryClr/20 transition-all">
                    <p className="text-xs text-secondaryClr uppercase tracking-widest font-bold mb-2">{action.status}</p>
                    <p className="font-bold text-sm mb-3">{action.action_taken}</p>
                    <div className="flex items-center justify-between text-[10px] text-secondaryClr">
                      <span>By {action.creator_first_name}</span>
                      <span>{new Date(action.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
              {interventions.length > 0 && (
                <button className="w-full py-3 text-xs font-bold text-secondaryClr hover:text-primaryClr transition-colors border-t border-white/5 mt-4">
                  View Management Archive
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-primaryClr/20 to-transparent border border-primaryClr/10">
            <h4 className="font-bold text-primaryClr text-sm mb-4">Term Performance</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs text-secondaryClr font-medium uppercase tracking-widest">Attendance</span>
                <span className="font-bold">94%</span>
              </div>
              <div className="w-full h-1.5 bg-bgDark rounded-full overflow-hidden">
                <div className="h-full bg-primaryClr w-[94%]"></div>
              </div>
              <div className="flex justify-between items-end mt-6">
                <span className="text-xs text-secondaryClr font-medium uppercase tracking-widest">Behavior Rank</span>
                <span className="font-bold">Top 15%</span>
              </div>
              <div className="w-full h-1.5 bg-bgDark rounded-full overflow-hidden">
                <div className="h-full bg-accentClr w-[85%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
