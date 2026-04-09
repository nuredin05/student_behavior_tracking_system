import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Users,
  Search,
  Filter,
  ExternalLink,
  Trophy,
  AlertTriangle,
  Loader2,
  Calendar,
  X,
  UserCheck,
  LayoutGrid,
  List
} from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid | table

  const API_BASE_URL = 'https://amana.be.yegofi.com';

  // Helper function to get full image URL
  const getImageUrl = (student) => {
    if (student.photo_url) {
      // If photo_url starts with http, use it as is
      if (student.photo_url.startsWith('http')) {
        return student.photo_url;
      }
      // Otherwise, prepend the base URL
      return `${API_BASE_URL}${student.photo_url}`;
    }
    if (student.student_photo) {
      if (student.student_photo.startsWith('http')) {
        return student.student_photo;
      }
      return `${API_BASE_URL}${student.student_photo}`;
    }
    // Fallback to avatar generator
    return `https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=6c5dd3&color=fff`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, classRes] = await Promise.all([
          api.get('/students'),
          api.get('/school/classes')
        ]);
        setStudents(studentRes.data);
        setClasses(classRes.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center -mt-20">
        <Loader2 size={48} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primaryClr mb-2">Student Registry</h1>
          <p className="text-secondaryClr">Manage and monitor students across all grades and sections.</p>
        </div>

        <div className="flex items-center gap-4 bg-bgDark/60 p-4 rounded-2xl border border-white/5 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-primaryClr/20 flex items-center justify-center text-primaryClr">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-wider">Total Enrolled</p>
            <p className="text-xl font-bold">{students.length} Students</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card !p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full text-secondaryClr">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Search by name or admission number..."
            className="input-field pl-12 py-3 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-bgDark rounded-xl border border-white/5 px-2">
            <Filter size={18} className="text-secondaryClr ml-2 opacity-50" />
            <select
              className="bg-transparent border-none py-3 pr-8 text-sm focus:ring-0 text-primaryClrText cursor-pointer"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Grades</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Grade {c.grade_level} - {c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="flex bg-bgDark rounded-xl border border-white/5 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primaryClr text-white shadow-lg' : 'text-secondaryClr hover:text-primaryClrText'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primaryClr text-white shadow-lg' : 'text-secondaryClr hover:text-primaryClrText'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-center opacity-60">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Users size={40} />
          </div>
          <h3 className="text-2xl font-bold text-primaryClrText mb-2">No Students Found</h3>
          <p className="text-secondaryClr">Try adjusting your search or filters to find what you're looking for.</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-6 text-primaryClr hover:underline flex items-center gap-2"
            >
              <X size={16} /> Clear Search
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <div key={student.id} className="glass-card !p-0 overflow-hidden group hover:border-primaryClr/30 transition-all duration-300">
              <div className="p-6 flex items-start gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl border-2 border-white/5 overflow-hidden shadow-2xl relative z-10">
                    <img
                      src={getImageUrl(student)}
                      alt="student"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-bgDark border border-white/5 shadow-xl flex items-center justify-center z-20 text-primaryClr">
                    <UserCheck size={16} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-lg truncate group-hover:text-primaryClr transition-colors">{student.first_name} {student.last_name}</h3>
                  </div>
                  <p className="text-xs text-secondaryClr flex items-center gap-2 mb-3">
                    <span className="font-mono text-primaryClr/80">{student.admission_number}</span>
                    <span className="opacity-20">•</span>
                    <span className="bg-bgDark px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-white/5">
                      Grade {student.grade_level}-{student.section}
                    </span>
                  </p>

                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${student.current_points >= 0 ? 'bg-accentClr/10 text-accentClr border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border-dangerClr/20'}`}>
                      {student.current_points >= 0 ? <Trophy size={14} /> : <AlertTriangle size={14} />}
                      <span className="text-sm font-bold">{student.current_points} pts</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-bgDarkAll/50 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-secondaryClr uppercase tracking-widest">
                  <Calendar size={12} />
                  Joined {new Date(student.created_at).toLocaleDateString()}
                </div>
                <button
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="p-2 rounded-lg hover:bg-primaryClr/10 text-secondaryClr hover:text-primaryClr transition-all group-hover:translate-x-1"
                >
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="bg-bgDark border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Admission #</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Grade</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest text-center">Points</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl border border-white/5 overflow-hidden shadow-lg">
                          <img
                            src={getImageUrl(student)}
                            alt="student"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-bold text-primaryClrText">{student.first_name} {student.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-secondaryClr">{student.admission_number}</td>
                    <td className="px-6 py-4 text-sm text-secondaryClr">Grade {student.grade_level}-{student.section}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${student.current_points >= 0 ? 'bg-accentClr/10 text-accentClr' : 'bg-dangerClr/10 text-dangerClr'}`}>
                        {student.current_points} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="p-2 rounded-lg hover:bg-primaryClr/10 text-secondaryClr hover:text-primaryClr transition-all"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
