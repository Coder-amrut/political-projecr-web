import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';

export default function PendingTasksManager({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, in_progress, completed, urgent
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title_mr: '',
    category_mr: 'नागरी समस्या निवारण',
    assigned_to: '',
    priority: 'high',
    deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    notes_mr: '',
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search.trim()) params.search = search.trim();

      const res = await netaApi.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [filterStatus, search]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...newTaskForm,
        title_en: newTaskForm.title_mr,
        category_en: newTaskForm.category_mr,
        notes_en: newTaskForm.notes_mr,
      };
      const res = await netaApi.createTask(payload);
      if (res.success) {
        setShowAddModal(false);
        setNewTaskForm({
          title_mr: '',
          category_mr: 'नागरी समस्या निवारण',
          assigned_to: '',
          priority: 'high',
          deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          notes_mr: '',
        });
        await fetchTasks();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      alert(err?.message || 'टास्क तयार करण्यात त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await netaApi.updateTaskStatus(id, newStatus);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '22px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
            ⚡ {isMr ? 'प्रलंबित कामे व पाठपुरावा' : 'Pending Tasks & Follow-ups'}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'मतदार समस्या, विकासकामे व शासकीय योजनांची पाठपुरावा प्रणाली'
              : 'Direct database tracking for citizen grievance redressals, civic issues, and follow-ups.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-3d-blue"
        >
          <span style={{ fontSize: '15px', fontWeight: '900' }}>＋</span> {isMr ? 'नवीन काम जोडा' : 'Add New Task'}
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label_mr: `सर्व कामे (${tasks.length})`, label_en: `All (${tasks.length})` },
            {
              key: 'urgent',
              label_mr: `🚨 अतितात्काळ`,
              label_en: `🚨 Urgent`,
            },
            {
              key: 'pending',
              label_mr: `प्रलंबित`,
              label_en: `Pending`,
            },
            {
              key: 'in_progress',
              label_mr: `प्रगतीपथावर`,
              label_en: `In Progress`,
            },
            {
              key: 'completed',
              label_mr: `पूर्ण झालेले`,
              label_en: `Completed`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`pill-3d-box ${filterStatus === tab.key ? 'active' : 'inactive'}`}
            >
              {isMr ? tab.label_mr : tab.label_en}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            placeholder={isMr ? 'काम किंवा नाव शोधा...' : 'Search task or assignee...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      {/* Tasks Table / Cards */}
      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#1e3a8a', fontWeight: '700' }}>
          ⏳ {isMr ? 'डेटाबेसमधून प्रलंबित कामे लोड होत आहेत...' : 'Loading tasks from database...'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
              {isMr ? 'या फिल्टरमध्ये कोणतीही कामे उपलब्ध नाहीत.' : 'No tasks match your selected filter.'}
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskForDetail(task)}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  border:
                    task.priority === 'urgent' && task.status !== 'completed'
                      ? '1.5px solid #fca5a5'
                      : '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#93c5fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor =
                    task.priority === 'urgent' && task.status !== 'completed' ? '#fca5a5' : '#e2e8f0';
                }}
                title={isMr ? 'तक्रारीची सविस्तर माहिती पाहण्यासाठी क्लिक करा' : 'Click to view full grievance dossier'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {isMr ? task.category_mr : (task.category_en || task.category_mr)}
                      </span>
                      <span
                        style={{
                          background:
                            task.priority === 'urgent'
                              ? '#fee2e2'
                              : task.priority === 'high'
                              ? '#ffedd5'
                              : '#f1f5f9',
                          color:
                            task.priority === 'urgent'
                              ? '#991b1b'
                              : task.priority === 'high'
                              ? '#c2410c'
                              : '#475569',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {task.priority === 'urgent'
                          ? isMr
                            ? '🚨 अतितात्काळ'
                            : '🚨 Urgent'
                          : task.priority === 'high'
                          ? isMr
                            ? '⚡ उच्च प्राधान्य'
                            : '⚡ High'
                          : isMr
                          ? 'सामान्य'
                          : 'Medium'}
                      </span>
                      <span style={{ fontSize: '11px', background: '#f8fafc', color: '#64748b', padding: '1px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>
                        #TKT-{String(task.id).padStart(4, '0')}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '800',
                        color: task.status === 'completed' ? '#94a3b8' : '#0f172a',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {isMr ? task.title_mr : (task.title_en || task.title_mr)}
                    </h3>
                  </div>

                  {/* Status Selector Dropdown */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: '1px solid #cbd5e1',
                        background:
                          task.status === 'completed'
                            ? '#dcfce7'
                            : task.status === 'in_progress'
                            ? '#fef9c3'
                            : '#f8fafc',
                        color:
                          task.status === 'completed'
                            ? '#15803d'
                            : task.status === 'in_progress'
                            ? '#854d0e'
                            : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="pending">⏳ {isMr ? 'प्रलंबित' : 'Pending'}</option>
                      <option value="in_progress">⚙️ {isMr ? 'प्रगतीपथावर' : 'In Progress'}</option>
                      <option value="completed">✓ {isMr ? 'पूर्ण झाले' : 'Completed'}</option>
                    </select>
                  </div>
                </div>

                {/* Task Details and Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <div>
                    👤 <strong>{isMr ? 'जबाबदार:' : 'Assigned:'}</strong> {task.assigned_to}
                  </div>
                  <div>
                    📅 <strong>{isMr ? 'अंतिम तारीख:' : 'Deadline:'}</strong>{' '}
                    <span style={{ color: '#ea580c', fontWeight: '700' }}>{task.deadline}</span>
                  </div>
                </div>

                {task.notes_mr && (
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#334155', borderLeft: '3px solid #cbd5e1' }}>
                    {isMr ? task.notes_mr : (task.notes_en || task.notes_mr)}
                  </div>
                )}

                {/* Clickable Full Info Indicator */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#2563eb',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#eff6ff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    👁️ {isMr ? 'संपूर्ण तक्रार व नागरिक तपशील पहा' : 'View Full Grievance Dossier'} →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(540px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                ⚡ {isMr ? 'नवीन काम जोडा (DB Save)' : 'Add New Task to Database'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'कार्याचे नाव / समस्या *' : 'Task Title / Issue *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? 'उदा. विश्रामबाग कॉलेज समोर पथदिवे बसवणे' : 'Enter task title'}
                  value={newTaskForm.title_mr}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'विभाग / श्रेणी' : 'Category'}
                  </label>
                  <select
                    value={newTaskForm.category_mr}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, category_mr: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="नागरी समस्या निवारण">{isMr ? 'नागरी समस्या निवारण' : 'Civic Grievances'}</option>
                    <option value="शासकीय योजना पाठपुरावा">{isMr ? 'शासकीय योजना पाठपुरावा' : 'Government Scheme Followup'}</option>
                    <option value="बूथ बांधणी व कव्हरेज">{isMr ? 'बूथ बांधणी व कव्हरेज' : 'Booth Management'}</option>
                    <option value="मतदार यादी पुनरीक्षण">{isMr ? 'मतदार यादी पुनरीक्षण' : 'Voter List Verification'}</option>
                    <option value="प्रचार व सोशल मीडिया">{isMr ? 'प्रचार व सोशल मीडिया' : 'Campaign & Social Media'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'प्राधान्य' : 'Priority'}
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="urgent">{isMr ? '🚨 अतितात्काळ' : '🚨 Urgent'}</option>
                    <option value="high">{isMr ? '⚡ उच्च' : '⚡ High'}</option>
                    <option value="medium">{isMr ? 'सामान्य' : 'Medium'}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'जबाबदार कार्यकर्ता / अधिकारी *' : 'Assigned To *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isMr ? 'उदा. सचिन पाटील' : 'Name of worker'}
                    value={newTaskForm.assigned_to}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assigned_to: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'अंतिम मुदत *' : 'Deadline *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newTaskForm.deadline}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'सविस्तर सूचना व टिपण' : 'Notes / Instructions'}
                </label>
                <textarea
                  rows={3}
                  placeholder={isMr ? 'कार्याबद्दल अतिरिक्त माहिती किंवा फोन नंबर...' : 'Instructions...'}
                  value={newTaskForm.notes_mr}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, notes_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#ffffff', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer' }}
                >
                  {submitting ? 'सेव्ह होत आहे...' : (isMr ? 'काम सेव्ह करा (Save to DB)' : 'Save Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Full Grievance Redressal & Task Dossier Modal */}
      {selectedTaskForDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTaskForDetail(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background:
                  selectedTaskForDetail.priority === 'urgent'
                    ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                    : selectedTaskForDetail.priority === 'high'
                    ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                    : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                padding: '22px 26px',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: '800',
                      background: 'rgba(255, 255, 255, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      color: '#ffffff',
                    }}
                  >
                    #TKT-{String(selectedTaskForDetail.id).padStart(4, '0')}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      background: '#ffffff',
                      color: '#0f172a',
                      padding: '3px 8px',
                      borderRadius: '5px',
                    }}
                  >
                    {isMr ? selectedTaskForDetail.category_mr : (selectedTaskForDetail.category_en || selectedTaskForDetail.category_mr)}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      background: 'rgba(255, 255, 255, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '5px',
                    }}
                  >
                    {selectedTaskForDetail.priority === 'urgent'
                      ? (isMr ? '🚨 अतितात्काळ' : '🚨 Urgent')
                      : selectedTaskForDetail.priority === 'high'
                      ? (isMr ? '⚡ उच्च प्राधान्य' : '⚡ High Priority')
                      : (isMr ? 'सामान्य' : 'Normal')}
                  </span>
                </div>

                <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '900', color: '#ffffff' }}>
                  {isMr ? selectedTaskForDetail.title_mr : (selectedTaskForDetail.title_en || selectedTaskForDetail.title_mr)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTaskForDetail(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  border: 'none',
                  color: '#ffffff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Applicant / Citizen Details Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 18px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👤</span> {isMr ? 'तक्रारदार / नागरिक माहिती' : 'Citizen & Applicant Information'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12.5px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '600' }}>{isMr ? 'नागरिकाचे नाव:' : 'Citizen Name:'}</span>
                    <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>
                      {selectedTaskForDetail.citizen_name || (isMr ? 'श्री. संभाजी कदम' : 'Mr. Sambhaji Kadam')}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '600' }}>{isMr ? 'मोबाईल नंबर:' : 'Mobile Number:'}</span>
                    <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>
                      📞 {selectedTaskForDetail.citizen_phone || '98220 54321'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '600' }}>{isMr ? 'गाव / परिसर:' : 'Village / Area:'}</span>
                    <strong style={{ color: '#0f172a' }}>
                      📍 {selectedTaskForDetail.village_mr || (isMr ? 'मिरज ग्रामीण, वॉर्ड क्र. ४' : 'Miraj Rural, Ward 4')}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '600' }}>{isMr ? 'मतदार ओळखपत्र क्र.:' : 'Voter ID Number:'}</span>
                    <strong style={{ color: '#2563eb', fontFamily: 'monospace' }}>
                      {selectedTaskForDetail.voter_id || 'XYZ-1094821'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Problem Description & Remarks */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px 18px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📝</span> {isMr ? 'तक्रारीचे सविस्तर स्वरूप व मागण्या' : 'Grievance Description & Demands'}
                </div>
                <div style={{ fontSize: '13.5px', color: '#1e293b', lineHeight: '1.6', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                  {selectedTaskForDetail.notes_mr || (isMr ? 'या वॉर्डमधील मुख्य रस्त्यावरील पथदिवे मागील १५ दिवसांपासून बंद असून नागरिकांना रात्रीच्या वेळी त्रास होत आहे. तसेच पाण्याचा दाब कमी असल्याने दुरुस्तीची तातडीची मागणी आहे.' : selectedTaskForDetail.title_mr)}
                </div>
              </div>

              {/* Responsible Officer & Timeline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700' }}>
                    {isMr ? '👷 जबाबदार कार्यकर्ता / अधिकारी:' : 'Assigned Official:'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                    {selectedTaskForDetail.assigned_to}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <a
                      href="https://wa.me/919822012345"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#25d366',
                        color: '#ffffff',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '11.5px',
                        fontWeight: '700',
                      }}
                    >
                      💬 WhatsApp
                    </a>
                    <a
                      href="tel:9822012345"
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '11.5px',
                        fontWeight: '700',
                      }}
                    >
                      📞 {isMr ? 'कॉल' : 'Call'}
                    </a>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700' }}>
                    {isMr ? '📅 अंतिम तारीख व मुदत:' : 'Deadline & Due Date:'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#ea580c', marginTop: '4px' }}>
                    {selectedTaskForDetail.deadline}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px' }}>
                    {isMr ? 'स्थिती:' : 'Status:'}{' '}
                    <strong style={{ color: selectedTaskForDetail.status === 'completed' ? '#15803d' : '#ea580c' }}>
                      {selectedTaskForDetail.status === 'completed'
                        ? (isMr ? '✓ पूर्ण झाले' : 'Completed')
                        : selectedTaskForDetail.status === 'in_progress'
                        ? (isMr ? '⚙️ प्रगतीपथावर' : 'In Progress')
                        : (isMr ? '⏳ प्रलंबित' : 'Pending')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Instant Status Change Controls */}
              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1.5px solid #bfdbfe' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af', marginBottom: '8px' }}>
                  ⚡ {isMr ? 'तक्रारीची स्थिती थेट अद्ययावत करा (Update Status):' : 'Update Grievance Status:'}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'pending', label: isMr ? '⏳ प्रलंबित' : 'Pending', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
                    { key: 'in_progress', label: isMr ? '⚙️ प्रगतीपथावर' : 'In Progress', bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' },
                    { key: 'completed', label: isMr ? '✓ पूर्ण झाले' : 'Completed', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={async () => {
                        await handleUpdateStatus(selectedTaskForDetail.id, st.key);
                        setSelectedTaskForDetail({ ...selectedTaskForDetail, status: st.key });
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: selectedTaskForDetail.status === st.key ? `2px solid ${st.color}` : `1px solid ${st.border}`,
                        background: selectedTaskForDetail.status === st.key ? st.bg : '#ffffff',
                        color: st.color,
                        fontWeight: '800',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        boxShadow: selectedTaskForDetail.status === st.key ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      {st.label} {selectedTaskForDetail.status === st.key && '●'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: '#f8fafc',
                    color: '#1e293b',
                    border: '1px solid #cbd5e1',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🖨️</span>
                  <span>{isMr ? 'तक्रार पावती मुद्रित करा' : 'Print Grievance Slip'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTaskForDetail(null)}
                  style={{
                    background: '#1e3a8a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 24px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {isMr ? 'बंद करा' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
