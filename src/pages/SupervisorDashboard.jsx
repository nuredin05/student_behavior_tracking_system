import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  BarChart3,
  Tag,
  Plus,
  Edit3,
  TrendingUp,
  TrendingDown,
  ListChecks,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Layers,
  Save,
  X
} from 'lucide-react';

// ─── Sub-Components ──────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, iconColor, bgColor, sub }) => (
  <div className="glass-card p-6 flex items-center gap-5">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${bgColor}18`, color: bgColor }}
    >
      <Icon size={26} />
    </div>
    <div>
      <p className="text-xs text-secondaryClr uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-primaryClrText">{value ?? '—'}</p>
      {sub && <p className="text-xs text-secondaryClr mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Badge = ({ type }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
    type === 'positive' ? 'bg-accentClr/10 text-accentClr' : 'bg-dangerClr/10 text-dangerClr'
  }`}>
    {type}
  </span>
);

// ─── Tab: Review Queue ────────────────────────────────────────────────────────

const ReviewQueue = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/behaviors/records/pending');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleReview = async (id, decision) => {
    setProcessingId(id);
    setStatus({ type: '', message: '' });
    try {
      await api.patch(`/behaviors/records/${id}/review`, { status: decision });
      setRecords(prev => prev.filter(r => r.id !== id));
      setStatus({
        type: 'success',
        message: `Incident ${decision === 'approved' ? 'approved ✓' : 'rejected ✗'} successfully.`
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to review incident' });
    } finally {
      setProcessingId(null);
    }
  };

  const [showActionModal, setShowActionModal] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [actionDone, setActionDone] = useState('');
  const [actionSaving, setActionSaving] = useState(false);

  const openActionModal = (record) => {
    setActiveRecord(record);
    setShowActionModal(true);
  };

  const submitAction = async (e) => {
    e.preventDefault();
    setActionSaving(true);
    try {
      await api.patch(`/behaviors/records/${activeRecord.id}/review`, { status: 'approved' });
      await api.post('/interventions', {
        behavior_id: activeRecord.id,
        action_taken: actionDone
      });
      setRecords(prev => prev.filter(r => r.id !== activeRecord.id));
      setShowActionModal(false);
      setActionDone('');
      setStatus({ type: 'success', message: 'Incident approved & action recorded successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to complete review' });
    } finally {
      setActionSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={40} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header stats strip */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-primaryClrText">Pending Incidents</h2>
          <p className="text-secondaryClr text-sm mt-1">Review and validate behavior logs submitted by teachers.</p>
        </div>
        <div className="flex items-center gap-3 bg-bgDark/60 border border-white/5 rounded-2xl px-5 py-3">
          <Clock size={20} className="text-primaryClr" />
          <div>
            <p className="text-xs text-secondaryClr uppercase tracking-wider">Awaiting Review</p>
            <p className="text-xl font-bold">{records.length}</p>
          </div>
        </div>
      </div>

      {/* Status feedback */}
      {status.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-fadeInUp border ${
          status.type === 'success'
            ? 'bg-accentClr/10 text-accentClr border-accentClr/20'
            : 'bg-dangerClr/10 text-dangerClr border-dangerClr/20'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
          <button onClick={() => setStatus({ type: '', message: '' })} className="ml-auto opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {records.length === 0 ? (
        <div className="glass-card py-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-accentClr/10 text-accentClr flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-bold text-primaryClrText mb-2">All Clear!</h3>
          <p className="text-secondaryClr max-w-sm text-sm">
            No pending incidents right now. All submitted behavior logs have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="glass-card p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 items-center hover:border-white/10 transition-all duration-200"
            >
              {/* Student */}
              <div className="flex items-center gap-4 min-w-[180px]">
                <div className="w-14 h-14 rounded-2xl border border-white/5 overflow-hidden flex-shrink-0">
                  <img
                    src={record.student_photo || `https://ui-avatars.com/api/?name=${record.student_first_name}+${record.student_last_name}&background=6c5dd3&color=fff`}
                    alt="student"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold">{record.student_first_name} {record.student_last_name}</p>
                  <p className="text-xs text-secondaryClr">{record.admission_number}</p>
                  <p className="text-xs text-primaryClr font-semibold mt-0.5">Grade {record.grade_level}-{record.section}</p>
                </div>
              </div>

              {/* Behavior details */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge type={record.category_type} />
                  <span className="text-secondaryClr text-xs flex items-center gap-1">
                    <Tag size={11} /> {record.category_name}
                  </span>
                  <span className="text-secondaryClr text-xs flex items-center gap-1">
                    <Calendar size={11} /> {new Date(record.incident_date).toLocaleDateString()}
                  </span>
                  <span className="text-secondaryClr text-xs flex items-center gap-1">
                    <User size={11} /> {record.teacher_first_name} {record.teacher_last_name}
                  </span>
                </div>
                <p className="text-sm text-primaryClrText/80 leading-relaxed">
                  {record.comment || <span className="italic opacity-50">No description provided.</span>}
                </p>
                {record.evidence_url && (
                  <a
                    href={record.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primaryClr hover:underline mt-2"
                  >
                    <ExternalLink size={12} /> View Evidence
                  </a>
                )}
              </div>

              {/* Points + Actions */}
              <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                <div className={`text-2xl font-bold ${record.points_applied >= 0 ? 'text-accentClr' : 'text-dangerClr'}`}>
                  {record.points_applied >= 0 ? '+' : ''}{record.points_applied} pts
                </div>
                <div className="flex gap-2">
                  <button
                    id={`approve-${record.id}`}
                    onClick={() => handleReview(record.id, 'approved')}
                    disabled={processingId === record.id}
                    title="Approve"
                    className="w-11 h-11 rounded-xl bg-accentClr/15 hover:bg-accentClr text-accentClr hover:text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                  >
                    {processingId === record.id ? <Loader2 size={18} className="animate-spin" /> : <ThumbsUp size={18} />}
                  </button>
                  <button
                    onClick={() => openActionModal(record)}
                    title="Approve with Action"
                    className="w-11 h-11 rounded-xl bg-primaryClr/10 hover:bg-primaryClr text-primaryClr hover:text-white flex items-center justify-center transition-all duration-200"
                  >
                    <ListChecks size={18} />
                  </button>
                  <button
                    id={`reject-${record.id}`}
                    onClick={() => handleReview(record.id, 'rejected')}
                    disabled={processingId === record.id}
                    title="Reject"
                    className="w-11 h-11 rounded-xl bg-dangerClr/10 hover:bg-dangerClr text-dangerClr hover:text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                  >
                    {processingId === record.id ? <Loader2 size={18} className="animate-spin" /> : <ThumbsDown size={18} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Recording Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bgDarkAll/80 backdrop-blur-sm" onClick={() => setShowActionModal(false)}></div>
          <div className="glass-card !p-0 w-full max-w-lg relative z-60 animate-scaleIn">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Approve & Record Action</h3>
              <button onClick={() => setShowActionModal(false)} className="text-secondaryClr"><X size={20} /></button>
            </div>
            <form onSubmit={submitAction} className="p-8 space-y-6">
              <div className="p-4 bg-primaryClr/10 rounded-xl border border-primaryClr/20">
                <p className="text-sm font-bold text-primaryClr">{activeRecord?.student_first_name} {activeRecord?.student_last_name}</p>
                <p className="text-xs text-secondaryClr">{activeRecord?.category_name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondaryClr uppercase tracking-widest">Action Taken</label>
                <textarea 
                  required
                  className="input-field h-32 resize-none" 
                  placeholder="e.g. Called parents and discussed the issue..."
                  value={actionDone}
                  onChange={(e) => setActionDone(e.target.value)}
                />
              </div>
              <button type="submit" disabled={actionSaving} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                {actionSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Confirm & Close Incident
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Tab: Overview ────────────────────────────────────────────────────────────

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/behaviors/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={40} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass-card py-20 text-center text-secondaryClr">
        <AlertCircle size={40} className="mx-auto mb-4 opacity-40" />
        <p>Could not load statistics.</p>
      </div>
    );
  }

  const { totals, topCategories, recentActivity } = stats;

  const approvalRate = totals.total_records > 0
    ? Math.round((Number(totals.approved) / Number(totals.total_records)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={ListChecks} label="Total Records" value={totals.total_records} bgColor="#8C4830" />
        <StatCard icon={Clock} label="Pending Review" value={totals.pending} bgColor="#F59E0B" sub="Awaiting action" />
        <StatCard icon={CheckCircle2} label="Approved" value={totals.approved} bgColor="#22e950" />
        <StatCard icon={XCircle} label="Rejected" value={totals.rejected} bgColor="#f72121" />
      </div>

      {/* Approval rate bar */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primaryClr" />
            <span className="font-semibold text-primaryClrText">Approval Rate</span>
          </div>
          <span className="text-2xl font-bold text-accentClr">{approvalRate}%</span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primaryClr to-accentClr rounded-full transition-all duration-700"
            style={{ width: `${approvalRate}%` }}
          />
        </div>
        <p className="text-xs text-secondaryClr mt-2">
          {totals.approved} approved out of {totals.total_records} total records
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top behavior categories */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Layers size={18} className="text-primaryClr" />
            <h3 className="font-bold text-primaryClrText">Top Behavior Categories</h3>
          </div>
          {topCategories.length === 0 ? (
            <p className="text-secondaryClr text-sm text-center py-8">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat, i) => {
                const maxCount = topCategories[0]?.count || 1;
                const pct = Math.round((cat.count / maxCount) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge type={cat.type} />
                        <span className="text-sm text-primaryClrText">{cat.name}</span>
                      </div>
                      <span className="text-xs text-secondaryClr font-medium">{cat.count}x</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.type === 'positive' ? 'bg-accentClr' : 'bg-dangerClr'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7-day activity */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-primaryClr" />
            <h3 className="font-bold text-primaryClrText">7-Day Incident Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-secondaryClr text-sm text-center py-8">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((day, i) => {
                const maxCount = Math.max(...recentActivity.map(d => d.count)) || 1;
                const pct = Math.round((day.count / maxCount) * 100);
                const label = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-secondaryClr w-24 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primaryClr to-primaryClrLight rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-primaryClrText font-semibold w-6 text-right">{day.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Category Management ─────────────────────────────────────────────────

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const defaultForm = { name: '', type: 'positive', default_points: '', severity_level: 1, description: '' };
  const [form, setForm] = useState(defaultForm);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/behaviors/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditingCat(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setForm({
      name: cat.name,
      type: cat.type,
      default_points: cat.default_points,
      severity_level: cat.severity_level || 1,
      description: cat.description || ''
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });
    try {
      if (editingCat) {
        await api.put(`/behaviors/categories/${editingCat.id}`, form);
        setFeedback({ type: 'success', message: `"${form.name}" updated successfully.` });
      } else {
        await api.post('/behaviors/categories', form);
        setFeedback({ type: 'success', message: `"${form.name}" category created.` });
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to save category.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat) => {
    try {
      await api.put(`/behaviors/categories/${cat.id}`, { is_active: !cat.is_active });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={40} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-primaryClrText">Behavior Categories</h2>
          <p className="text-secondaryClr text-sm mt-1">Manage the behavior types teachers can log.</p>
        </div>
        <button id="btn-create-category" onClick={openCreate} className="btn-primary flex items-center gap-2 px-5 py-3">
          <Plus size={18} /> New Category
        </button>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm border animate-fadeInUp ${
          feedback.type === 'success'
            ? 'bg-accentClr/10 text-accentClr border-accentClr/20'
            : 'bg-dangerClr/10 text-dangerClr border-dangerClr/20'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="ml-auto opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="glass-card p-6 border border-primaryClr/20 animate-fadeInUp">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-primaryClrText flex items-center gap-2">
              {editingCat ? <Edit3 size={18} className="text-primaryClr" /> : <Plus size={18} className="text-primaryClr" />}
              {editingCat ? `Edit "${editingCat.name}"` : 'Create New Category'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-secondaryClr hover:text-primaryClrText">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-secondaryClr uppercase tracking-wider mb-1">Category Name *</label>
              <input
                id="cat-name"
                className="input-field"
                placeholder="e.g. Class Disruption"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-secondaryClr uppercase tracking-wider mb-1">Type *</label>
              <select
                id="cat-type"
                className="input-field"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-secondaryClr uppercase tracking-wider mb-1">Default Points *</label>
              <input
                id="cat-points"
                type="number"
                className="input-field"
                placeholder="e.g. -5 or 10"
                value={form.default_points}
                onChange={e => setForm(f => ({ ...f, default_points: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-secondaryClr uppercase tracking-wider mb-1">Severity Level (1-5)</label>
              <input
                id="cat-severity"
                type="number"
                min="1"
                max="5"
                className="input-field"
                value={form.severity_level}
                onChange={e => setForm(f => ({ ...f, severity_level: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-secondaryClr uppercase tracking-wider mb-1">Description</label>
              <textarea
                id="cat-description"
                className="input-field resize-none h-20"
                placeholder="Optional description..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-secondaryClr hover:text-primaryClrText text-sm transition-all">
                Cancel
              </button>
              <button id="btn-save-category" type="submit" disabled={saving} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingCat ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.length === 0 ? (
          <div className="md:col-span-2 glass-card py-16 text-center text-secondaryClr">
            <Tag size={40} className="mx-auto mb-4 opacity-30" />
            <p>No categories yet. Create the first one.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className={`glass-card p-5 flex items-start gap-4 transition-all duration-200 ${!cat.is_active ? 'opacity-50' : ''}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                cat.type === 'positive' ? 'bg-accentClr/10 text-accentClr' : 'bg-dangerClr/10 text-dangerClr'
              }`}>
                {cat.type === 'positive' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-primaryClrText">{cat.name}</span>
                  <Badge type={cat.type} />
                  {!cat.is_active && (
                    <span className="text-[10px] bg-white/5 text-secondaryClr px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-secondaryClr mb-2 line-clamp-2">{cat.description || 'No description.'}</p>
                <div className="flex items-center gap-3 text-xs text-secondaryClr">
                  <span className={`font-bold ${cat.default_points >= 0 ? 'text-accentClr' : 'text-dangerClr'}`}>
                    {cat.default_points >= 0 ? '+' : ''}{cat.default_points} pts
                  </span>
                  <span>Severity: {cat.severity_level ?? 1}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  id={`edit-cat-${cat.id}`}
                  onClick={() => openEdit(cat)}
                  title="Edit"
                  className="p-2 rounded-lg hover:bg-white/5 text-secondaryClr hover:text-primaryClrText transition-all"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  id={`toggle-cat-${cat.id}`}
                  onClick={() => toggleActive(cat)}
                  title={cat.is_active ? 'Deactivate' : 'Activate'}
                  className={`p-2 rounded-lg transition-all text-xs font-medium ${
                    cat.is_active
                      ? 'hover:bg-dangerClr/10 text-dangerClr'
                      : 'hover:bg-accentClr/10 text-accentClr'
                  }`}
                >
                  {cat.is_active ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ActionPlans = () => {
  const [interventions, setInterventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionText, setActionText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInterventions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/interventions');
      setInterventions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInterventions(); }, [fetchInterventions]);

  const handleCreateAction = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/interventions', {
        behavior_id: selectedRecord.id,
        action_taken: actionText
      });
      setShowModal(false);
      setActionText('');
      fetchInterventions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save action');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Action Progress</h2>
        <span className="text-secondaryClr text-sm">{interventions.length} Plans Active</span>
      </div>

      <div className="glass-card !p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-bgDark">
            <tr className="border-b border-white/5">
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-secondaryClr">Student</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-secondaryClr">Incident</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-secondaryClr">Action Taken</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-secondaryClr">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {interventions.map(i => (
              <tr key={i.id} className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-bold">{i.student_first_name} {i.student_last_name}</td>
                <td className="p-6">
                  <span className="text-secondaryClr">{i.category_name}</span>
                </td>
                <td className="p-6">{i.action_taken}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-accentClr/10 text-accentClr`}>
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main SupervisorDashboard ─────────────────────────────────────────────────

const TABS = [
  { id: 'queue', label: 'Review Queue', icon: ShieldAlert },
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'actions', label: 'Action Plans', icon: ListChecks },
];

const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('queue');

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-primaryClr mb-1">Supervisor Panel</h1>
        <p className="text-secondaryClr">Manage incidents, review behavior records, and configure categories.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-bgDark/60 border border-white/5 rounded-2xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-primaryClr text-white shadow-lg shadow-primaryClr/20'
                : 'text-secondaryClr hover:text-primaryClrText hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div key={activeTab} className="animate-fadeInUp">
        {activeTab === 'queue' && <ReviewQueue />}
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'actions' && <ActionPlans />}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
