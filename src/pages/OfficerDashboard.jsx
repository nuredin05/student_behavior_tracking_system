import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Camera, CheckCircle, AlertCircle, Loader2, Users } from 'lucide-react';

const OfficerDashboard = () => {
  const [formData, setFormData] = useState({
    admission_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    class_id: '',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch classes for dropdown
    const fetchClasses = async () => {
      try {
        const response = await api.get('/school/classes');
        setClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      setStatus({ type: 'error', message: 'Student photo is mandatory' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('photo', photo);

    try {
      await api.post('/students', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: 'Student registered successfully!' });
      setFormData({ admission_number: '', first_name: '', last_name: '', date_of_birth: '', gender: 'male', class_id: '' });
      setPhoto(null);
      setPreview(null);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to register student' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primaryClr mb-2">Student Enrollment</h1>
          <p className="text-secondaryClr">Register new students with mandatory identity photos.</p>
        </div>
        <div className="bg-bgDark/60 p-4 rounded-2xl flex items-center gap-4 border border-white/5 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-primaryClrLight/20 flex items-center justify-center text-primaryClr">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-wider">Active Students</p>
            <p className="text-xl font-bold">1,248</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-2 glass-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Admission Number</label>
                <input
                  type="text"
                  required
                  placeholder="STU-2026-XXXX"
                  className="input-field"
                  value={formData.admission_number}
                  onChange={(e) => setFormData({...formData, admission_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Grade / Class</label>
                <select
                  required
                  className="input-field appearance-none"
                  value={formData.class_id}
                  onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                >
                  <option value="">Select a class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      Grade {c.grade_level} - {c.section}
                    </option>
                  ))}
                  {!classes.length && <option disabled>No classes found</option>}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">First Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Last Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Gender</label>
                <div className="flex gap-4">
                  {['male', 'female', 'other'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 capitalize ${
                        formData.gender === g 
                        ? 'bg-primaryClr/20 border-primaryClr text-primaryClr' 
                        : 'border-white/10 text-secondaryClr hover:border-white/20'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Date of Birth</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
              </div>
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
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <UserPlus size={24} />
                  Complete Registration
                </>
              )}
            </button>
          </form>
        </div>

        {/* Photo Upload Card */}
        <div className="space-y-8">
          <div className="glass-card flex flex-col items-center text-center">
            <h3 className="text-xl font-bold mb-6">Student Photo</h3>
            <div className="relative group w-full aspect-square max-w-[240px]">
              <div className="w-full h-full rounded-2xl bg-bgDarkAll/50 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primaryClr/50">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={48} className="text-secondaryClr mb-4 group-hover:text-primaryClr transition-colors duration-300" />
                    <p className="text-sm text-secondaryClr px-4">Click below to upload mandatory photo</p>
                  </>
                )}
              </div>
              <label className="absolute inset-0 cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
            
            <div className="mt-8 w-full p-4 bg-primaryClrDark/30 rounded-xl border border-primaryClr/20">
              <p className="text-xs text-primaryClrLight leading-relaxed italic">
                * Identification photos are required for parent view and supervisor verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
