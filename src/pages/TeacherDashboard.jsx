import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Camera, 
  ShieldAlert, 
  Smile, 
  Frown,
  PlusCircle,
  History
} from 'lucide-react';

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    points_applied: 0,
    comment: '',
    incident_date: new Date().toISOString().split('T')[0],
  });
  const [evidence, setEvidence] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [myHistory, setMyHistory] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      try {
        const [studentRes, catRes, historyRes, assignRes] = await Promise.all([
          api.get('/students'),
          api.get('/behaviors/categories'),
          api.get('/behaviors/records/history'),
          api.get('/assignments/my-assignments')
        ]);
        setStudents(studentRes.data);
        setCategories(catRes.data);
        setMyHistory(historyRes.data.history);
        setTodayCount(historyRes.data.todayCount);
        setMyAssignments(assignRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setFormData(prev => ({ ...prev, points_applied: cat.default_points }));
  };

  const handleEvidenceChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidence(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCategory) {
      setStatus({ type: 'error', message: 'Please select a student and a behavior category.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    const data = new FormData();
    data.append('student_id', selectedStudent.id);
    data.append('category_id', selectedCategory.id);
    data.append('points_applied', formData.points_applied);
    data.append('comment', formData.comment);
    data.append('incident_date', formData.incident_date);
    if (evidence) data.append('evidence', evidence);

    try {
      await api.post('/behaviors/records', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: 'Behavior logged successfully! Pending supervisor review.' });
      
      // Reset form
      setSelectedStudent(null);
      setSelectedCategory(null);
      setSearchTerm('');
      setFormData({ points_applied: 0, comment: '', incident_date: new Date().toISOString().split('T')[0] });
      setEvidence(null);
      setPreview(null);
      
      // Refresh history
      const historyRes = await api.get('/behaviors/records/history');
      setMyHistory(historyRes.data.history);
      setTodayCount(historyRes.data.todayCount);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to log behavior' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primaryClr mb-2">Behavior Logger</h1>
          <p className="text-secondaryClr text-lg">Record student achievements or incidents for review.</p>
        </div>
        <div className="bg-bgDark/60 p-4 rounded-2xl flex items-center gap-4 border border-white/5 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-accentClr/20 flex items-center justify-center text-accentClr">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-wider">Your Logs Today</p>
            <p className="text-xl font-bold">{todayCount} Records</p>
          </div>
        </div>
      </div>

      {/* Assignment Context */}
      {myAssignments.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {myAssignments.map(as => (
            <div key={as.id} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondaryClr">
              <span className="text-primaryClr">Grade {as.grade_level}-{as.section}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              {as.subject_name}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Selection & Form */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Step 1: Select Student */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primaryClr/20 text-primaryClr flex items-center justify-center text-sm">1</span>
              Select Student
            </h3>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr" size={20} />
              <input 
                type="text" 
                placeholder="Search by name or admission number..."
                className="input-field pl-12 py-4 text-lg"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedStudent) setSelectedStudent(null);
                }}
              />
              
              {searchTerm && !selectedStudent && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-bgDark border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => {
                          setSelectedStudent(s);
                          setSearchTerm(`${s.first_name} ${s.last_name}`);
                        }}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                      >
                        <div>
                          <p className="font-bold">{s.first_name} {s.last_name}</p>
                          <p className="text-xs text-secondaryClr">{s.admission_number} • Grade {s.grade_level}-{s.section}</p>
                        </div>
                        <PlusCircle size={20} className="text-primaryClr" />
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-secondaryClr text-sm">No students found</div>
                  )}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="mt-6 p-4 bg-primaryClr/10 border border-primaryClr/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedStudent.photo_url || `https://ui-avatars.com/api/?name=${selectedStudent.first_name}+${selectedStudent.last_name}&background=6c5dd3&color=fff`} 
                    alt="profile" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-primaryClr"
                  />
                  <div>
                    <p className="font-bold text-primaryClr">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                    <p className="text-xs text-secondaryClr">Currently Selected</p>
                  </div>
                </div>
                <button 
                  onClick={() => {setSelectedStudent(null); setSearchTerm('');}}
                  className="text-xs text-secondaryClr hover:text-dangerClr transition-colors underline"
                >
                  Change Student
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Select Behavior */}
          <div className={`glass-card transition-opacity duration-300 ${!selectedStudent ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primaryClr/20 text-primaryClr flex items-center justify-center text-sm">2</span>
              Behavior Type
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${
                    selectedCategory?.id === cat.id
                    ? 'bg-primaryClr/10 border-primaryClr ring-4 ring-primaryClr/10'
                    : 'bg-bgDark border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl ${
                      cat.type === 'positive' ? 'bg-accentClr/20 text-accentClr' : 'bg-dangerClr/20 text-dangerClr'
                    }`}>
                      {cat.type === 'positive' ? <Smile size={24} /> : <Frown size={24} />}
                    </div>
                    <span className={`text-xl font-bold ${
                      cat.type === 'positive' ? 'text-accentClr' : 'text-dangerClr'
                    }`}>
                      {cat.default_points > 0 ? '+' : ''}{cat.default_points}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg group-hover:text-primaryClr transition-colors">{cat.name}</h4>
                  <p className="text-xs text-secondaryClr mt-1 line-clamp-1">{cat.description || 'Standard incident type'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Details & Evidence */}
        <div className={`space-y-8 transition-opacity duration-300 ${!selectedCategory ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6">Incident Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Adjust Points (if applicable)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    className="flex-1 accent-primaryClr"
                    value={formData.points_applied}
                    onChange={(e) => setFormData({...formData, points_applied: parseInt(e.target.value)})}
                  />
                  <span className={`w-12 text-center font-bold text-lg ${formData.points_applied >= 0 ? 'text-accentClr' : 'text-dangerClr'}`}>
                    {formData.points_applied}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Evidence Photo</label>
                <div 
                  className={`relative h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group ${
                    preview ? 'border-primaryClr/50' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {preview ? (
                    <img src={preview} alt="evidence" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera size={32} className="text-secondaryClr mb-2 group-hover:text-primaryClr" />
                      <p className="text-xs text-secondaryClr">Capture or upload photo</p>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleEvidenceChange} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Comments</label>
                <textarea 
                  rows={4}
                  placeholder="Describe the incident briefly..."
                  className="input-field resize-none"
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                ></textarea>
              </div>

              {status.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                  status.type === 'success' ? 'bg-accentClr/10 text-accentClr border border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border border-dangerClr/20'
                }`}>
                  {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <span>{status.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <ShieldAlert size={20} />
                    Submit for Review
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <History size={20} className="text-primaryClr" /> Recent Submissions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bgDark">
              <tr className="border-b border-white/5">
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-secondaryClr">Student</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-secondaryClr">Behavior</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-secondaryClr text-center">Points</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-secondaryClr">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myHistory.map(h => (
                <tr key={h.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <p className="font-bold">{h.student_first_name} {h.student_last_name}</p>
                    <p className="text-[10px] text-secondaryClr font-mono uppercase">{h.admission_number}</p>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-medium">{h.category_name}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`font-black ${h.points_applied >= 0 ? 'text-accentClr' : 'text-dangerClr'}`}>
                      {h.points_applied >= 0 ? '+' : ''}{h.points_applied}
                    </span>
                  </td>
                  <td className="p-6 text-sm">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      h.status === 'approved' ? 'bg-accentClr/10 text-accentClr' :
                      h.status === 'pending' ? 'bg-primaryClr/10 text-primaryClr' :
                      'bg-dangerClr/10 text-dangerClr'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
              {myHistory.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-secondaryClr italic opacity-50">
                    No behavior records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
