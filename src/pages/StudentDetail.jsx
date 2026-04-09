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
  FileText,
  PlusCircle,
  X,
  Save,
  Smile,
  Frown,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
   const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Log State
  const [isLogging, setIsLogging] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    points_applied: 0,
    comment: '',
    incident_date: new Date().toISOString().split('T')[0],
  });
  const [evidence, setEvidence] = useState(null);
  const [preview, setPreview] = useState(null);
  const [logStatus, setLogStatus] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Frontend fetching profile for student ID:', id);
      try {
        const apiUrl = `/students/${id}/full-profile`;
        const [profileRes, catRes] = await Promise.all([
          api.get(apiUrl),
          api.get('/behaviors/categories')
        ]);
        setData(profileRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error fetching student profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleLogBehavior = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsSaving(true);
    setLogStatus({ type: '', message: '' });

    const payload = new FormData();
    payload.append('student_id', id);
    payload.append('category_id', selectedCategory.id);
    payload.append('points_applied', formData.points_applied);
    payload.append('comment', formData.comment);
    payload.append('incident_date', formData.incident_date);
    if (evidence) payload.append('evidence', evidence);

    try {
      await api.post('/behaviors/records', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogStatus({ type: 'success', message: 'Behavior logged! Pending review.' });
      setTimeout(() => {
        setIsLogging(false);
        setLogStatus({ type: '', message: '' });
      }, 2000);
    } catch (err) {
      setLogStatus({ type: 'error', message: 'Failed to log behavior' });
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-secondaryClr hover:text-primaryClr transition-colors font-medium group self-start"
        >
          <div className="p-2 rounded-xl bg-bgDark border border-white/5 group-hover:bg-primaryClr group-hover:text-white transition-all">
            <ArrowLeft size={20} />
          </div>
          Back to Registry
        </button>
        <div className="flex flex-wrap gap-2">
          {(['supervisor', 'admin', 'manager'].includes(currentUser?.role)) && (
            <button 
              onClick={() => navigate(`/certificate/${id}`)}
              className="btn-secondary px-4 py-2 text-xs flex items-center gap-2 border-accentClr/30 text-accentClr hover:bg-accentClr/10"
            >
              <Trophy size={14} /> Generate Certificate
            </button>
          )}
          <button 
            onClick={() => navigate(`/report/${id}`)}
            className="btn-secondary px-4 py-2 text-xs"
          >
            Print Report
          </button>
          <button 
            onClick={() => setIsLogging(true)}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-2"
          >
            <PlusCircle size={14} /> Log Behavior
          </button>
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h1 className="text-2xl md:text-4xl font-display font-bold text-primaryClrText">{student.first_name} {student.last_name}</h1>
              <span className="px-4 py-1 rounded-full bg-bgDark border border-white/5 text-primaryClr font-mono text-sm">
                ID: {student.admission_number}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold mb-1">Conduct Rating</p>
                <span className={`text-[10px] sm:text-xs uppercase font-black px-3 py-1 rounded-full border ${
                  student.current_points >= 80 ? 'bg-accentClr/10 text-accentClr border-accentClr/20' :
                  student.current_points >= 40 ? 'bg-primaryClr/10 text-primaryClr border-primaryClr/20' :
                  'bg-dangerClr/10 text-dangerClr border-dangerClr/20'
                }`}>
                  {student.current_points >= 100 ? 'Outstanding' :
                   student.current_points >= 80 ? 'Excellent' :
                   student.current_points >= 60 ? 'Very Good' :
                   student.current_points >= 40 ? 'Good' :
                   student.current_points >= 20 ? 'Satisfactory' :
                   'Needs Improvement'}
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

      {/* Quick Log Modal */}
      {isLogging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bgDarkAll/80 backdrop-blur-md" onClick={() => setIsLogging(false)}></div>
          <div className="glass-card !p-0 w-full max-w-2xl relative z-60 animate-scaleIn">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Quick Log: {student.first_name}</h3>
              <button onClick={() => setIsLogging(false)} className="text-secondaryClr"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleLogBehavior} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Category Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black text-secondaryClr uppercase tracking-widest">Select Behavior</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setFormData({...formData, points_applied: cat.default_points});
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedCategory?.id === cat.id 
                        ? 'bg-primaryClr border-primaryClr text-white shadow-xl scale-[1.02]' 
                        : 'bg-bgDark border-white/5 text-secondaryClr hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {cat.type === 'positive' ? <Smile size={16} /> : <Frown size={16} />}
                        <span className="font-bold text-sm">{cat.name}</span>
                      </div>
                      <p className="text-[10px] opacity-60 line-clamp-1">{cat.description || 'No description'}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCategory && (
                <div className="animate-fadeIn space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-secondaryClr uppercase tracking-widest">Points Applied</label>
                      <input 
                        type="number" 
                        className="input-field"
                        value={formData.points_applied}
                        onChange={(e) => setFormData({...formData, points_applied: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-secondaryClr uppercase tracking-widest">Date</label>
                      <input 
                        type="date" 
                        className="input-field"
                        value={formData.incident_date}
                        onChange={(e) => setFormData({...formData, incident_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondaryClr uppercase tracking-widest">Evidence Photo (Optional)</label>
                    <div className="flex gap-4">
                      <label className="flex-1 h-32 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primaryClr/20 transition-all bg-bgDark">
                        {preview ? (
                          <img src={preview} alt="preview" className="h-full w-full object-cover rounded-2xl" />
                        ) : (
                          <>
                            <Camera className="text-secondaryClr mb-2" size={32} />
                            <span className="text-xs text-secondaryClr">Upload Evidence</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          hidden 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setEvidence(file);
                              setPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                      <div className="flex-1 space-y-2">
                         <label className="text-xs font-black text-secondaryClr uppercase tracking-widest">Comments</label>
                         <textarea 
                           className="input-field h-[104px] resize-none"
                           placeholder="Additional details..."
                           value={formData.comment}
                           onChange={(e) => setFormData({...formData, comment: e.target.value})}
                         />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {logStatus.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                  logStatus.type === 'success' ? 'bg-accentClr/10 text-accentClr border border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border border-dangerClr/20'
                }`}>
                  {logStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {logStatus.message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSaving || !selectedCategory}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Confirm Log Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
