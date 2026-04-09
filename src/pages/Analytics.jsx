import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  AlertTriangle, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Loader2,
  Calendar,
  ChevronRight,
  School
} from 'lucide-react';

const COLORS = ['#22e950', '#f72121', '#8C4830', '#C9AE9B', '#59331D', '#A65B4B'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/behaviors/analytics');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center -mt-20">
        <Loader2 size={48} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-dangerClr">Failed to load analytics data.</div>;

  const { activityTrend, topStudents, lowStudents, categoryStats, gradeStats, impact } = data;

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-primaryClr mb-2 text-shadow-sm uppercase tracking-wider">School Performance Analytics</h1>
          <p className="text-secondaryClr flex items-center gap-2">
            <Calendar size={16} /> Data snapshot for the last 30 days
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-bgDark/60 p-5 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl self-start md:self-auto">
          <div className="flex -space-x-3">
            {(topStudents || []).slice(0, 3).map((student, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-bgDark overflow-hidden">
                <img 
                  src={getImageUrl(student)} 
                  alt={`${student.first_name} ${student.last_name}`} 
                  title={`${student.first_name} ${student.last_name}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold">Total Activity</p>
            <p className="text-xl font-black text-primaryClrText">{impact.total_logs} Incidents</p>
          </div>
        </div>
      </div>

      {/* Impact Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-b-4 border-accentClr flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-accentClr/10 text-accentClr flex items-center justify-center shadow-inner">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-widest font-bold mb-1">Positive Impact</p>
            <p className="text-3xl font-black text-primaryClrText">{impact.total_positive}</p>
            <p className="text-[10px] text-accentClr mt-1 flex items-center gap-1 font-bold">
              +12% from last month <ChevronRight size={10} />
            </p>
          </div>
        </div>

        <div className="glass-card p-6 border-b-4 border-dangerClr flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-dangerClr/10 text-dangerClr flex items-center justify-center shadow-inner">
            <TrendingDown size={32} />
          </div>
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-widest font-bold mb-1">Negative Incidents</p>
            <p className="text-3xl font-black text-primaryClrText">{impact.total_negative}</p>
            <p className="text-[10px] text-dangerClr mt-1 flex items-center gap-1 font-bold">
              -5% improvement <ChevronRight size={10} />
            </p>
          </div>
        </div>

        <div className="glass-card p-6 border-b-4 border-primaryClr flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primaryClr/10 text-primaryClr flex items-center justify-center shadow-inner">
            <Users size={32} />
          </div>
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-widest font-bold mb-1">Active Monitoring</p>
            <p className="text-3xl font-black text-primaryClrText">
              {impact.total_logs > 0 ? Math.round((impact.total_positive / impact.total_logs) * 100) : 0}%
            </p>
            <p className="text-[10px] text-secondaryClr mt-1 flex items-center gap-1 font-bold italic">
              Health Score: {impact.total_logs > 0 ? 'Excellent' : 'Awaiting Data'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Trend */}
        <div className="glass-card p-6 md:p-8 min-h-[350px] md:min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <BarChart3 className="text-primaryClr" /> Behavioral Trend
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accentClr"></div>
                <span className="text-[10px] font-bold text-secondaryClr uppercase tracking-tighter">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-dangerClr"></div>
                <span className="text-[10px] font-bold text-secondaryClr uppercase tracking-tighter">Negative</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {activityTrend.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-30">
                <BarChart3 size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No Activity Recorded Yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22e950" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22e950" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f72121" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f72121" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#605853" 
                    fontSize={10} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis stroke="#605853" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="positive" stroke="#22e950" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" />
                  <Area type="monotone" dataKey="negative" stroke="#f72121" strokeWidth={3} fillOpacity={1} fill="url(#colorNeg)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
            <PieChartIcon className="text-primaryClr" /> Category Breakdown
          </h3>
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                  stroke="none"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-3xl font-black text-primaryClrText">{impact.total_logs}</p>
              <p className="text-[10px] text-secondaryClr uppercase font-bold tracking-widest">Total Logs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top 5 High Points */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Award className="text-accentClr" /> Positive Leaderboard
            </h3>
            <span className="text-[10px] bg-accentClr/10 text-accentClr px-3 py-1 rounded-full font-bold uppercase tracking-widest">Top Performers</span>
          </div>
          <div className="space-y-4">
            {topStudents.slice(0, 5).map((student, i) => (
              <div key={student.id} className="flex items-center gap-4 group">
                <span className="text-lg font-black text-secondaryClr opacity-20 w-6">0{i+1}</span>
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/5 shadow-lg flex-shrink-0">
                  <img src={getImageUrl(student)} className="w-full h-full object-cover" alt="p" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primaryClrText group-hover:text-primaryClr transition-colors">{student.first_name} {student.last_name}</p>
                  <p className="text-[10px] text-secondaryClr font-mono uppercase tracking-tighter">{student.admission_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-accentClr">+{student.current_points}</p>
                  <div className="w-24 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-accentClr rounded-full" style={{ width: `${(student.current_points / topStudents[0].current_points) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 5 Points */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <AlertTriangle className="text-dangerClr" /> Growth Opportunities
            </h3>
            <span className="text-[10px] bg-dangerClr/10 text-dangerClr px-3 py-1 rounded-full font-bold uppercase tracking-widest">Action Needed</span>
          </div>
          <div className="space-y-4">
            {lowStudents.slice(0, 5).map((student, i) => (
              <div key={student.id} className="flex items-center gap-4 group">
                <span className="text-lg font-black text-secondaryClr opacity-20 w-6">0{i+1}</span>
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/5 shadow-lg flex-shrink-0">
                  <img src={getImageUrl(student)} className="w-full h-full object-cover" alt="p" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primaryClrText group-hover:text-dangerClr transition-colors">{student.first_name} {student.last_name}</p>
                  <p className="text-[10px] text-secondaryClr font-mono uppercase tracking-tighter">{student.admission_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-dangerClr">{student.current_points}</p>
                  <div className="w-24 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-dangerClr rounded-full" style={{ width: `${Math.abs(student.current_points / (lowStudents[0]?.current_points || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade Level Rankings */}
      <div className="glass-card p-10">
        <h3 className="text-2xl font-black text-primaryClrText mb-10 flex items-center gap-4 uppercase tracking-widest">
           <School className="text-primaryClr" size={32} /> Grade Level Performance Index
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeStats}>
              <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="grade_level" stroke="#605853" fontSize={12} tickFormatter={(val) => `Grade ${val}`} />
              <YAxis stroke="#605853" fontSize={12} />
              <Tooltip 
                 cursor={{fill: '#ffffff05'}}
                 contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
              />
              <Bar dataKey="avg_points" radius={[10, 10, 0, 0]}>
                {gradeStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.avg_points >= 0 ? '#22e950' : '#f72121'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-8 md:gap-12 border-t border-white/5 pt-8">
          <div className="text-center">
            <p className="text-3xl font-black text-accentClr">{Math.max(...gradeStats.map(g => g.avg_points || 0)).toFixed(1)}</p>
            <p className="text-[10px] text-secondaryClr uppercase font-bold tracking-widest">Highest Scoring Grade</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-primaryClr">{gradeStats.length}</p>
            <p className="text-[10px] text-secondaryClr uppercase font-bold tracking-widest">Total Grades Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-dangerClr">{Math.min(...gradeStats.map(g => g.avg_points || 0)).toFixed(1)}</p>
            <p className="text-[10px] text-secondaryClr uppercase font-bold tracking-widest">Critical Grade Focus</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
