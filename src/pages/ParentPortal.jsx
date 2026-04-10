import React, { useState } from 'react';
import axios from 'axios';
import { 
  Search, 
  Phone, 
  User, 
  Trophy, 
  Activity, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  ChevronRight, 
  ShieldCheck,
  Award,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://amana.be.yegofi.com';

const ParentPortal = () => {
  const navigate = useNavigate();
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!admissionNumber || !parentPhone) {
      setError('Please provide both admission number and registered phone number.');
      return;
    }

    setIsLoading(true);
    setError('');
    setStudentData(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/students/public-profile`, {
        admission_number: admissionNumber.trim(),
        parent_phone: parentPhone.trim()
      });
      setStudentData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Could not find student records. Please ensure both admission number and the registered phone number are correct (phone must match the one used during registration).');
      } else {
        setError(err.response?.data?.error || 'System error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (student) => {
    if (!student || !student.photo_url) return `https://ui-avatars.com/api/?name=${student?.first_name || 'S'}&background=6c5dd3&color=fff`;
    if (student.photo_url.startsWith('http')) return student.photo_url;
    return `${API_BASE_URL}${student.photo_url}`;
  };

  return (
    <div className="min-h-screen bg-bgDarkAll text-primaryClrText selection:bg-primaryClr/30">
      {/* Mesh Gradient background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primaryClr/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accentClr/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-secondaryClr hover:text-primaryClr transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-display font-black text-primaryClr uppercase tracking-tighter">Parent Portal</h1>
          </div>
        </div>

        {!studentData ? (
          <div className="max-w-md mx-auto animate-fadeInUp">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-primaryClr/10 rounded-3xl flex items-center justify-center text-primaryClr mx-auto mb-6 border border-primaryClr/20">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-3xl font-black mb-3">Track Your Child</h2>
              <p className="text-secondaryClr">Securely access your child's behavior records and point balance using their official credentials.</p>
            </div>

            <div className="glass-card !p-8 border-t border-white/10 shadow-2xl">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Admission Number</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr group-focus-within:text-primaryClr transition-colors" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. AMSS/2026/001"
                      className="input-field pl-12"
                      value={admissionNumber}
                      onChange={(e) => setAdmissionNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Parent Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr group-focus-within:text-primaryClr transition-colors" size={18} />
                    <input 
                      type="tel" 
                      required
                      placeholder="Enter registered mobile number"
                      className="input-field pl-12"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-dangerClr/10 border border-dangerClr/20 text-dangerClr flex items-center gap-3 text-sm font-bold animate-shake">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(108,93,211,0.3)]"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Verify & Access Results
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-secondaryClr uppercase tracking-widest leading-relaxed">
              If you don't have these details, please contact the school office <br /> for access credentials.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeInUp">
            {/* Success View */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Left Column: Student Card */}
              <div className="w-full md:w-80 space-y-6">
                <div className="glass-card text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primaryClr to-accentClr"></div>
                  <div className="w-32 h-32 rounded-3xl mx-auto mb-6 border-4 border-white/5 overflow-hidden shadow-2xl group hover:scale-105 transition-transform duration-500">
                    <img 
                      src={getImageUrl(studentData.student)} 
                      alt="Student" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-black mb-1">{studentData.student.first_name} {studentData.student.last_name}</h2>
                  <p className="text-xs text-secondaryClr font-bold uppercase tracking-widest mb-4">{studentData.student.admission_number}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-bgDark rounded-full border border-white/5 text-[10px] font-black uppercase tracking-tighter text-secondaryClr">
                    Grade {studentData.student.grade_level}-{studentData.student.section}
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-3">
                    <div className="p-4 bg-primaryClr/10 border border-primaryClr/20 rounded-2xl">
                      <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold mb-1">Impact Score</p>
                      <p className="text-3xl font-black text-primaryClr">{studentData.student.current_points} pts</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 bg-accentClr/5 border-accentClr/20">
                  <div className="flex items-center gap-3 mb-4 text-accentClr">
                    <Award size={24} />
                    <h3 className="font-bold">Recent Rewards</h3>
                  </div>
                  <p className="text-xs text-secondaryClr italic">
                    Students can redeem their points for various school incentives. Check with the administration for the current rewards catalog.
                  </p>
                </div>
              </div>

              {/* Right Column: Records */}
              <div className="flex-1 space-y-8">
                {/* Statistics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card p-6 border-l-4 border-accentClr flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-accentClr/10 text-accentClr flex items-center justify-center">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold">Positive Acts</p>
                      <p className="text-2xl font-black">{studentData.history.filter(h => h.category_type === 'positive').length}</p>
                    </div>
                  </div>
                  <div className="glass-card p-6 border-l-4 border-dangerClr flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-dangerClr/10 text-dangerClr flex items-center justify-center">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold">Critical Incidents</p>
                      <p className="text-2xl font-black">{studentData.history.filter(h => h.category_type === 'negative').length}</p>
                    </div>
                  </div>
                </div>

                {/* History list */}
                <div className="glass-card !p-0 overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                      <Calendar size={20} className="text-primaryClr" /> Behavior History
                    </h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {studentData.history.length > 0 ? (
                      studentData.history.map((record, idx) => (
                        <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 p-2 rounded-lg ${record.category_type === 'positive' ? 'bg-accentClr/10 text-accentClr' : 'bg-dangerClr/10 text-dangerClr'}`}>
                              {record.category_type === 'positive' ? <Trophy size={18} /> : <AlertCircle size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-primaryClrText">{record.category_name}</p>
                              <p className="text-xs text-secondaryClr mt-1 leading-relaxed">{record.comment || 'No additional details provided.'}</p>
                              <p className="text-[10px] text-secondaryClr font-bold mt-2 flex items-center gap-1 opacity-60">
                                <Calendar size={10} /> {new Date(record.incident_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className={`text-xl font-black text-right ${record.points_applied >= 0 ? 'text-accentClr' : 'text-dangerClr'}`}>
                            {record.points_applied > 0 ? '+' : ''}{record.points_applied}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-secondaryClr italic opacity-50">
                        No behavior records found for this student yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Interventions */}
                {studentData.interventions.length > 0 && (
                  <div className="glass-card !p-0 overflow-hidden border-primaryClr/20">
                    <div className="p-6 bg-primaryClr/5 border-b border-white/5">
                      <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                        <Activity size={20} className="text-primaryClr" /> Official Action Plans
                      </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {studentData.interventions.map((action, idx) => (
                        <div key={idx} className="p-6 bg-bgDarkAll/30">
                          <div className="flex items-center justify-between mb-3">
                             <p className="text-xs font-black uppercase tracking-widest text-primaryClr">Intervention Record</p>
                             <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                               action.status === 'completed' ? 'bg-accentClr/20 text-accentClr' : 'bg-primaryClr/20 text-primaryClr'
                             }`}>
                               {action.status}
                             </span>
                          </div>
                          <p className="text-sm border-l-2 border-primaryClr pl-4 italic text-primaryClrLight leading-relaxed">
                            "{action.action_taken}"
                          </p>
                          <p className="text-[10px] text-secondaryClr mt-4 text-right opacity-50">
                            Recorded on {new Date(action.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentPortal;
