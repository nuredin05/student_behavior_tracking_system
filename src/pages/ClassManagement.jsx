import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  School, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  Calendar, 
  Loader2, 
  X,
  CheckCircle,
  AlertCircle,
  Hash,
  Layout
} from 'lucide-react';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    grade_level: '',
    section: '',
    academic_year: new Date().getFullYear().toString(),
    supervisor_id: '',
    teacher_id: ''
  });

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classRes, staffRes] = await Promise.all([
        api.get('/school/classes'),
        api.get('/auth/users')
      ]);
      setClasses(classRes.data);
      // Only supervisors and admins can be assigned to classes
      setStaff(staffRes.data.filter(u => ['supervisor', 'admin', 'manager'].includes(u.role)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setIsEdit(true);
      setEditId(cls.id);
      setFormData({
        grade_level: cls.grade_level,
        section: cls.section,
        academic_year: cls.academic_year,
        supervisor_id: cls.supervisor_id || '',
        teacher_id: cls.teacher_id || ''
      });
    } else {
      setIsEdit(false);
      setFormData({
        grade_level: '',
        section: '',
        academic_year: new Date().getFullYear().toString(),
        supervisor_id: '',
        teacher_id: ''
      });
    }
    setIsModalOpen(true);
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEdit) {
        await api.patch(`/school/classes/${editId}`, formData);
        setStatus({ type: 'success', message: 'Class updated successfully!' });
      } else {
        await api.post('/school/classes', formData);
        setStatus({ type: 'success', message: 'Class created successfully!' });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        fetchData();
      }, 1500);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Operation failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
    
    try {
      await api.delete(`/school/classes/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete class');
    }
  };

  const filteredClasses = classes.filter(c => 
    `Grade ${c.grade_level} ${c.section}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && classes.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center -mt-20">
        <Loader2 size={48} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeInUp pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primaryClr mb-2">School Structure</h1>
          <p className="text-secondaryClr">Manage grades, sections, and assigned supervisors.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
        >
          <Plus size={20} />
          Add Grade/Section
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaryClr/20 flex items-center justify-center text-primaryClr">
            <School size={24} />
          </div>
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-widest font-bold">Total Sections</p>
            <p className="text-2xl font-black">{classes.length}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr opacity-50" />
            <input 
              type="text" 
              placeholder="Filter by grade or section name..."
              className="input-field pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bgDark border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Class Name</th>
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Academic Year</th>
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Supervisor</th>
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Class Teacher</th>
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClasses.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primaryClrLight/20 flex items-center justify-center text-primaryClr font-bold">
                        {c.grade_level}
                      </div>
                      <span className="font-bold text-primaryClrText text-lg">Section {c.section}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-secondaryClr font-mono">
                      <Calendar size={14} />
                      {c.academic_year}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.supervisor_id ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bgDark border border-white/5 flex items-center justify-center">
                          <User size={14} className="text-primaryClr" />
                        </div>
                        <span className="text-sm font-medium">{c.supervisor_first_name} {c.supervisor_last_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-secondaryClr italic opacity-50">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.teacher_id ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bgDark border border-white/5 flex items-center justify-center">
                          <User size={14} className="text-accentClr" />
                        </div>
                        <span className="text-sm font-medium">{c.teacher_first_name} {c.teacher_last_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-secondaryClr italic opacity-50">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(c)}
                        className="p-2 rounded-lg hover:bg-white/5 text-secondaryClr hover:text-primaryClr transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-lg hover:bg-white/5 text-secondaryClr hover:text-dangerClr transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bgDarkAll/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-card !p-0 w-full max-w-lg relative z-60 animate-scaleIn">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold">{isEdit ? 'Edit Class Structure' : 'Add New Grade/Section'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-secondaryClr transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr flex items-center gap-2">
                    <Hash size={14} /> Grade Level
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    max="12"
                    placeholder="e.g. 9"
                    className="input-field" 
                    value={formData.grade_level}
                    onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr flex items-center gap-2">
                    <Layout size={14} /> Section Letter/Name
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. A"
                    className="input-field" 
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Academic Year</label>
                <input 
                  type="text" 
                  required 
                  placeholder="2026-2027"
                  className="input-field" 
                  value={formData.academic_year}
                  onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Assign Supervisor</label>
                <select 
                  className="input-field"
                  value={formData.supervisor_id}
                  onChange={(e) => setFormData({...formData, supervisor_id: e.target.value})}
                >
                  <option value="">No Supervisor Assigned</option>
                  {staff.filter(s => ['supervisor', 'admin', 'manager'].includes(s.role)).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr">Assign Class Teacher</label>
                <select 
                  className="input-field"
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                >
                  <option value="">No Teacher Assigned</option>
                  {staff.filter(s => s.role === 'teacher').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
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
                className="btn-primary w-full py-4 flex items-center justify-center gap-3 font-bold"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : (isEdit ? 'Update Structure' : 'Create Class Structure')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
