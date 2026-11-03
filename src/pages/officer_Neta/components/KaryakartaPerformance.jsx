import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';

export default function KaryakartaPerformance({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, offline
  const [roleFilter, setRoleFilter] = useState('all'); // all, WORKER, OFFICER
  const [workers, setWorkers] = useState([]);
  const [rolesList, setRolesList] = useState([
    { id: 1, name: 'WORKER', display_name: 'Field Worker' },
    { id: 2, name: 'OFFICER', display_name: 'Leader / Officer' },
  ]);
  const [loading, setLoading] = useState(true);

  // Direct Task Assignment State
  const [selectedWorkerForTask, setSelectedWorkerForTask] = useState(null);
  const [taskNote, setTaskNote] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskSubmittedToast, setTaskSubmittedToast] = useState(false);

  // Karyakarta Attendance Dossier Modal State
  const [selectedWorkerForAttendance, setSelectedWorkerForAttendance] = useState(null);
  const [attendanceMonth, setAttendanceMonth] = useState('2026-11');

  // Generate realistic daily attendance logs for the selected worker
  const getWorkerAttendanceHistory = (worker, monthStr = '2026-11') => {
    if (!worker) return { stats: {}, logs: [] };
    const [year, month] = monthStr.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    // In November 2026 show full records or past months full records
    const maxDay = monthStr === '2026-11' ? 30 : daysInMonth;

    const marathiDays = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरू', 'शुक्र', 'शनि'];
    const englishDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const logs = [];
    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let totalHours = 0;

    const seed = Number(worker.user_id || worker.id || 1);

    for (let d = maxDay; d >= 1; d--) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay();
      const isSunday = dayOfWeek === 0;

      const dateFormatted = `${String(d).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      const dayLabel = isMr ? marathiDays[dayOfWeek] : englishDays[dayOfWeek];

      if (isSunday) {
        logs.push({
          date: dateFormatted,
          day: dayLabel,
          status: 'HOLIDAY',
          punchIn: '-',
          punchOut: '-',
          punchInLocation: '-',
          punchOutLocation: '-',
          hours: '0.0',
          surveys: 0,
          notes: isMr ? 'साप्ताहिक सुट्टी (रविवार)' : 'Weekly Off (Sunday)',
        });
      } else {
        const hash = (seed * 19 + d * 29) % 100;
        let status = 'PRESENT';
        let punchIn = '09:' + String(10 + (hash % 20)).padStart(2, '0') + ' AM';
        let punchOut = '06:' + String(15 + (hash % 35)).padStart(2, '0') + ' PM';
        let hours = (7.8 + ((hash % 15) / 10)).toFixed(1);
        let surveys = Math.max(8, (hash % 30));
        let notes = isMr ? 'क्षेत्रीय मतदार पडताळणी पूर्ण' : 'Field voter survey verified';

        if (hash < 7 && d !== maxDay) {
          status = 'ABSENT';
          punchIn = '-';
          punchOut = '-';
          hours = '0.0';
          surveys = 0;
          notes = isMr ? 'रजेचा अर्ज मंजूर (वैयक्तिक कारण)' : 'Approved leave (Personal)';
          absentCount++;
        } else if (hash >= 7 && hash < 16 && d !== maxDay) {
          status = 'HALF_DAY';
          punchOut = '01:30 PM';
          hours = '4.0';
          surveys = Math.floor(surveys / 2);
          notes = isMr ? 'अर्धा दिवस (प्रशिक्षण सत्र)' : 'Half-day (Training session)';
          halfDayCount++;
        } else {
          presentCount++;
          totalHours += parseFloat(hours);
        }

        const areaName = worker.assigned_area_mr || 'सांगली मध्य';
        logs.push({
          date: dateFormatted,
          day: dayLabel,
          status,
          punchIn,
          punchOut,
          punchInLocation: `${areaName} (बूथ क्र. ${10 + (hash % 25)})`,
          punchOutLocation: `${areaName} (वॉर्ड क्र. ${1 + (hash % 6)})`,
          hours,
          surveys,
          notes,
        });
      }
    }

    const workingDays = presentCount + halfDayCount + absentCount;
    const attendancePct = workingDays > 0 ? Math.round(((presentCount + halfDayCount * 0.5) / workingDays) * 100) : 100;

    return {
      stats: {
        presentCount,
        absentCount,
        halfDayCount,
        totalHours: totalHours.toFixed(1),
        avgHours: presentCount > 0 ? (totalHours / presentCount).toFixed(1) : '8.0',
        attendancePct,
        totalDaysLogged: logs.length,
      },
      logs,
    };
  };

  // Edit Worker (Users Table) State
  const [editingWorker, setEditingWorker] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role_id: 1,
    phone: '',
    status: 'active',
    assigned_area_mr: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState(null);

  // Add Worker (Users Table) State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({
    name: '',
    role_id: 1,
    phone: '',
    email: '',
    password: '',
    status: 'active',
    assigned_area_mr: '',
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState(null);

  // Global Alert / Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRoles = async () => {
    try {
      const res = await netaApi.getRoles();
      if (res.success && res.data && res.data.length > 0) {
        setRolesList(res.data);
      }
    } catch (err) {
      console.warn('Roles fetch fallback to defaults', err);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const res = await netaApi.getKaryakartas(params);
      if (res.success) {
        setWorkers(res.data);
      }
    } catch (err) {
      console.error('Failed to load karyakartas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, roleFilter, search]);

  // Top 3 Stars based on surveys done
  const topStars = [...workers].sort((a, b) => b.total_surveys - a.total_surveys).slice(0, 3);
  const activeCount = workers.filter((w) => w.status === 'active').length;
  const workerCount = workers.filter((w) => w.role_name === 'WORKER').length;
  const officerCount = workers.filter((w) => w.role_name === 'OFFICER').length;

  // Open Edit Modal
  const handleOpenEdit = (worker) => {
    setEditingWorker(worker);
    setEditSuccessMsg(null);
    setEditFormData({
      name: worker.name || '',
      role_id: worker.role_id || (worker.role_name === 'OFFICER' ? 2 : 1),
      phone: worker.phone || '',
      status: worker.status === 'active' ? 'active' : 'offline',
      assigned_area_mr: worker.assigned_area_mr || '',
    });
  };

  // Submit Worker Edit (saves directly to users and user_roles table)
  const handleSaveWorkerEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.phone.trim()) {
      alert(isMr ? 'कृपया नाव आणि फोन नंबर प्रविष्ट करा.' : 'Please enter name and phone number.');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await netaApi.updateKaryakarta(editingWorker.id, {
        name: editFormData.name.trim(),
        role_id: Number(editFormData.role_id),
        phone: editFormData.phone.trim(),
        status: editFormData.status,
        assigned_area_mr: editFormData.assigned_area_mr.trim(),
      });

      if (res.success) {
        setEditSuccessMsg(
          isMr
            ? '✓ कार्यकर्त्याचे नाव व भूमिका यशस्वीरित्या जतन झाली!'
            : '✓ Worker details saved successfully!'
        );
        showToast(
          isMr
            ? `कार्यकर्ता '${editFormData.name}' यशस्वीरित्या अद्ययावत केला.`
            : `Worker '${editFormData.name}' updated successfully.`
        );
        setTimeout(() => {
          setEditingWorker(null);
          setEditSuccessMsg(null);
          fetchWorkers();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update worker in user table:', err);
      const errMsg = err?.response?.data?.message || err?.message || (isMr ? 'बदल सेव्ह करताना त्रुटी आली.' : 'Failed to save changes.');
      alert(errMsg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setIsAddModalOpen(true);
    setAddSuccessMsg(null);
    setNewWorkerData({
      name: '',
      role_id: 1,
      phone: '',
      email: '',
      password: '',
      status: 'active',
      assigned_area_mr: '',
    });
  };

  // Submit New Worker
  const handleSaveNewWorker = async (e) => {
    e.preventDefault();
    if (!newWorkerData.name.trim() || !newWorkerData.phone.trim()) {
      alert(isMr ? 'कृपया नाव आणि फोन नंबर प्रविष्ट करा.' : 'Please enter name and phone number.');
      return;
    }
    if (!newWorkerData.email.trim()) {
      alert(isMr ? 'कृपया ईमेल आयडी प्रविष्ट करा.' : 'Please enter email address.');
      return;
    }
    if (!newWorkerData.password || newWorkerData.password.length < 6) {
      alert(isMr ? 'कृपया किमान ६ अक्षरी पासवर्ड प्रविष्ट करा.' : 'Please enter a password with at least 6 characters.');
      return;
    }

    setAddSubmitting(true);
    try {
      const res = await netaApi.createKaryakarta({
        name: newWorkerData.name.trim(),
        role_id: Number(newWorkerData.role_id),
        phone: newWorkerData.phone.trim(),
        email: newWorkerData.email.trim(),
        password: newWorkerData.password,
        status: newWorkerData.status,
        assigned_area_mr: newWorkerData.assigned_area_mr.trim() || (isMr ? 'सांगली कार्यक्षेत्र' : 'Sangli Area'),
      });

      if (res.success) {
        setAddSuccessMsg(
          isMr
            ? '✓ नवीन कार्यकर्ता यशस्वीरित्या नोंदवला गेला!'
            : '✓ New worker registered successfully!'
        );
        showToast(
          isMr
            ? `नवीन कार्यकर्ता '${newWorkerData.name}' तयार केला.`
            : `New worker '${newWorkerData.name}' created.`
        );
        setTimeout(() => {
          setIsAddModalOpen(false);
          setAddSuccessMsg(null);
          fetchWorkers();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to create worker in users table:', err);
      const errMsg = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : (err?.response?.data?.message || err?.message || (isMr ? 'कार्यकर्ता जोडताना त्रुटी आली.' : 'Failed to add worker.'));
      alert(errMsg);
    } finally {
      setAddSubmitting(false);
    }
  };

  // Direct Task Assignment
  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskNote.trim() || !selectedWorkerForTask) return;
    setTaskSubmitting(true);
    try {
      const res = await netaApi.assignKaryakartaTask(selectedWorkerForTask.id, taskNote.trim());
      if (res.success) {
        setTaskSubmittedToast(true);
        setTimeout(() => {
          setTaskSubmittedToast(false);
          setSelectedWorkerForTask(null);
          setTaskNote('');
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to assign task:', err);
      alert(err?.message || (isMr ? 'टास्क नियुक्त करण्यात त्रुटी आली.' : 'Failed to assign task.'));
    } finally {
      setTaskSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        .karyakarta-desktop-table {
          display: block;
        }
        .karyakarta-mobile-cards {
          display: none;
        }
        @media (max-width: 768px) {
          .karyakarta-desktop-table {
            display: none !important;
          }
          .karyakarta-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
          }
        }
      `}</style>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#34d399',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
            zIndex: 2000,
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar: Add New Worker Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-3d-blue"
        >
          <span style={{ fontSize: '15px', fontWeight: '900' }}>＋</span> {isMr ? 'नवीन कार्यकर्ता जोडा' : 'Add New Worker'}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="karyakarta-filter-bar">
        <div className="karyakarta-pills-container">
          {/* Status Tabs - Row 1 on mobile (3 cards) */}
          <div className="karyakarta-pills-row">
            {[
              { key: 'all', label_mr: 'सर्व', label_en: 'All' },
              { key: 'active', label_mr: '🟢 आज सक्रिय', label_en: '🟢 Active' },
              { key: 'offline', label_mr: '⚪ विश्रांतीवर / ऑफलाइन', label_en: '⚪ Offline' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`pill-3d-box ${statusFilter === tab.key ? 'active' : 'inactive'}`}
                title={isMr ? tab.label_mr : tab.label_en}
              >
                {isMr ? tab.label_mr : tab.label_en}
              </button>
            ))}
          </div>

          {/* Role Filter Divider (desktop only) */}
          <div className="karyakarta-pills-divider" />

          {/* Role Filter Tabs - Row 2 on mobile (3 cards, eka khali ek) */}
          <div className="karyakarta-pills-row">
            {[
              { key: 'all', label_mr: 'सर्व भूमिका', label_en: 'All Roles' },
              { key: 'WORKER', label_mr: '👷 कार्यकर्ते', label_en: 'Workers' },
              { key: 'OFFICER', label_mr: '👔 नेते व अधिकारी', label_en: 'Officers' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRoleFilter(tab.key)}
                className={`pill-3d-box ${roleFilter === tab.key ? 'active' : 'inactive'}`}
                title={isMr ? tab.label_mr : tab.label_en}
              >
                {isMr ? tab.label_mr : tab.label_en}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input below on mobile, or right on desktop */}
        <div className="karyakarta-search-wrap">
          <div style={{ position: 'relative', width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '13px',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder={isMr ? 'नाव, फोन किंवा भूमिका शोधा...' : 'Search worker, phone or role...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
                background: '#f8fafc',
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.background = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Workers Roster Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#1e3a8a', fontWeight: '700' }}>
            ⏳ {isMr ? 'डेटाबेसमधून कार्यकर्त्यांची माहिती लोड होत आहे...' : 'Loading workers from database...'}
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {/* Desktop Table View (Laptop / Widescreen) */}
            <div className="karyakarta-desktop-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                    <th style={{ padding: '12px 14px' }}>{isMr ? 'कार्यकर्त्याचे नाव व आयडी' : 'Worker Name & ID'}</th>
                    <th style={{ padding: '12px 6px 12px 10px', width: '160px', whiteSpace: 'nowrap' }}>{isMr ? 'संपर्क' : 'Contact'}</th>
                    <th style={{ padding: '12px 14px 12px 6px' }}>{isMr ? 'नेमलेले कार्यक्षेत्र' : 'Assigned Area'}</th>
                    <th style={{ padding: '12px 10px', width: '120px' }}>{isMr ? 'पूर्ण सर्वेक्षण' : 'Surveys Done'}</th>
                    <th style={{ padding: '12px 10px', width: '110px' }}>{isMr ? 'आजचे काम' : "Today's Work"}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: '180px' }}>{isMr ? 'थेट कृती' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        {isMr ? 'कोणतेही कार्यकर्ते आढळले नाहीत.' : 'No workers found.'}
                      </td>
                    </tr>
                  ) : (
                    workers.map((worker) => (
                      <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {/* Name & ID - Clickable to open Attendance */}
                        <td style={{ padding: '14px 14px' }}>
                          <div
                            onClick={() => setSelectedWorkerForAttendance(worker)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', cursor: 'pointer' }}
                            title={isMr ? 'हजेरी व उपस्थिती तपशील पाहण्यासाठी क्लिक करा' : 'Click to view attendance dossier'}
                          >
                            <span style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '14px', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                              {worker.name}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                fontWeight: '700',
                                border: '1px solid #bfdbfe',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                              title={isMr ? 'वापरकर्ता आयडी' : 'User ID'}
                            >
                              {isMr ? 'आयडी' : 'ID'}: #{worker.user_id || worker.id}
                            </span>
                            <span
                              style={{
                                fontSize: '10.5px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#ecfdf5',
                                color: '#047857',
                                fontWeight: '750',
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              📋 {isMr ? 'हजेरी' : 'Attendance'}
                            </span>
                          </div>
                        </td>

                        {/* Phone / Contact - Minimized right padding */}
                        <td style={{ padding: '14px 6px 14px 10px', width: '160px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>
                            {worker.phone}
                          </div>
                          {worker.email && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {worker.email}
                            </div>
                          )}
                        </td>

                        {/* Area - Minimized left padding directly next to Contact */}
                        <td style={{ padding: '14px 14px 14px 6px', color: '#334155' }}>
                          <div style={{ fontWeight: '600' }}>
                            {isMr ? worker.assigned_area_mr : (worker.assigned_area_en || worker.assigned_area_mr)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {isMr ? 'कव्हरेज दर:' : 'Coverage:'} <strong style={{ color: '#0284c7' }}>{worker.coverage_pct}%</strong>
                          </div>
                        </td>

                        {/* Total Surveys */}
                        <td style={{ padding: '14px 10px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a' }}>
                            {worker.total_surveys}
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{isMr ? 'कुटुंबे' : 'Households'}</div>
                        </td>

                        {/* Today's Surveys */}
                        <td style={{ padding: '14px 10px' }}>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: '700',
                              color: worker.today_surveys > 20 ? '#15803d' : '#ea580c',
                              background: worker.today_surveys > 20 ? '#dcfce7' : '#ffedd5',
                              padding: '3px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            +{worker.today_surveys} {isMr ? 'आज' : 'today'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Attendance Dossier Button */}
                            <button
                              onClick={() => setSelectedWorkerForAttendance(worker)}
                              title={isMr ? 'हजेरी व उपस्थिती तपशील पहा' : 'View Attendance Record'}
                              style={{
                                background: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
                              }}
                            >
                              📋 {isMr ? 'हजेरी' : 'Attendance'}
                            </button>

                            {/* Edit Worker Details & Role */}
                            <button
                              onClick={() => handleOpenEdit(worker)}
                              title={isMr ? 'कार्यकर्त्याचे नाव व भूमिका बदला' : 'Edit Worker Name & Role'}
                              style={{
                                background: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              ✏️ {isMr ? 'बदला' : 'Edit'}
                            </button>

                            {/* WhatsApp */}
                            <a
                              href={`https://wa.me/91${worker.phone}`}
                              target="_blank"
                              rel="noreferrer"
                              title="WhatsApp"
                              style={{
                                background: '#25d366',
                                color: '#ffffff',
                                padding: '6px 9px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '12px',
                              }}
                            >
                              💬
                            </a>

                            {/* Call */}
                            <a
                              href={`tel:${worker.phone}`}
                              title={isMr ? 'कॉल करा' : 'Call'}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                padding: '6px 9px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '12px',
                              }}
                            >
                              📞
                            </a>

                            {/* Assign Task */}
                            <button
                              onClick={() => setSelectedWorkerForTask(worker)}
                              title={isMr ? 'थेट कार्य सोपवा' : 'Assign Direct Task'}
                              style={{
                                background: '#f97316',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '650',
                              }}
                            >
                              ⚡ {isMr ? 'कार्य' : 'Task'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View - One by One Container Cards (Screens <= 768px) */}
            <div className="karyakarta-mobile-cards">
              {workers.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                  {isMr ? 'कोणतेही कार्यकर्ते आढळले नाहीत.' : 'No workers found.'}
                </div>
              ) : (
                workers.map((worker) => (
                  <div
                    key={worker.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    {/* Header: Name, ID & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
                          {worker.name}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: '700',
                            border: '1px solid #bfdbfe',
                          }}
                          title={isMr ? 'वापरकर्ता आयडी' : 'User ID'}
                        >
                          #{worker.user_id || worker.id}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          background: worker.status === 'active' ? '#dcfce7' : '#f1f5f9',
                          color: worker.status === 'active' ? '#15803d' : '#64748b',
                          border: worker.status === 'active' ? '1px solid #86efac' : '1px solid #cbd5e1',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {worker.status === 'active' ? (isMr ? '🟢 सक्रिय' : '🟢 Active') : (isMr ? '⚪ ऑफलाइन' : '⚪ Offline')}
                      </span>
                    </div>

                    {/* Contact & Assigned Area - Compact Grid with minimal gap */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {/* Contact */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>📞</span> {isMr ? 'संपर्क' : 'Contact'}
                        </div>
                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '13px', marginTop: '3px' }}>
                          {worker.phone}
                        </div>
                        {worker.email && (
                          <div
                            style={{
                              fontSize: '10.5px',
                              color: '#64748b',
                              marginTop: '1px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={worker.email}
                          >
                            {worker.email}
                          </div>
                        )}
                      </div>

                      {/* Assigned Area */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>📍</span> {isMr ? 'नेमलेले कार्यक्षेत्र' : 'Assigned Area'}
                        </div>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px', marginTop: '3px' }}>
                          {isMr ? worker.assigned_area_mr : (worker.assigned_area_en || worker.assigned_area_mr)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', marginTop: '1px' }}>
                          {isMr ? 'कव्हरेज दर:' : 'Coverage:'} {worker.coverage_pct}%
                        </div>
                      </div>
                    </div>

                    {/* Performance Numbers: Surveys Done & Today's Work */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        background: '#f0fdf4',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#166534' }}>
                          {isMr ? 'पूर्ण सर्वेक्षण:' : 'Surveys Done:'}
                        </span>
                        <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#15803d' }}>
                          {worker.total_surveys} {isMr ? 'कुटुंबे' : 'Households'}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '750',
                          color: worker.today_surveys > 20 ? '#15803d' : '#c2410c',
                          background: worker.today_surveys > 20 ? '#dcfce7' : '#ffedd5',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: worker.today_surveys > 20 ? '1px solid #86efac' : '1px solid #fed7aa',
                        }}
                      >
                        +{worker.today_surveys} {isMr ? 'आज' : 'today'}
                      </span>
                    </div>

                    {/* Action Buttons Row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '6px',
                        marginTop: '2px',
                      }}
                    >
                      {/* Edit Worker Details & Role */}
                      <button
                        onClick={() => handleOpenEdit(worker)}
                        title={isMr ? 'कार्यकर्त्याचे नाव व भूमिका बदला' : 'Edit Worker Name & Role'}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                          fontWeight: '750',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                        }}
                      >
                        ✏️ {isMr ? 'बदला' : 'Edit'}
                      </button>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/91${worker.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp"
                        style={{
                          background: '#25d366',
                          color: '#ffffff',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                        }}
                      >
                        💬 WA
                      </a>

                      {/* Call */}
                      <a
                        href={`tel:${worker.phone}`}
                        title={isMr ? 'कॉल करा' : 'Call'}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                        }}
                      >
                        📞 {isMr ? 'कॉल' : 'Call'}
                      </a>

                      {/* Assign Task */}
                      <button
                        onClick={() => setSelectedWorkerForTask(worker)}
                        title={isMr ? 'थेट कार्य सोपवा' : 'Assign Direct Task'}
                        style={{
                          background: '#f97316',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 4px',
                          borderRadius: '7px',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                          fontWeight: '750',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                        }}
                      >
                        ⚡ {isMr ? 'कार्य' : 'Task'}
                      </button>
                    </div>

                    {/* View Full Attendance Button for Mobile */}
                    <button
                      type="button"
                      onClick={() => setSelectedWorkerForAttendance(worker)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
                      }}
                    >
                      <span>📋</span>
                      <span>{isMr ? 'हजेरी व उपस्थिती तपशील पहा' : 'View Attendance Record'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Worker Modal (Saves to Users & User Roles Table) */}
      {editingWorker && (
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
          onClick={() => setEditingWorker(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(520px, 96vw)',
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
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  ✏️ {isMr ? 'कार्यकर्त्याचे नाव व भूमिका संपादित करा' : 'Edit Worker Name & Role'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {isMr ? 'येथे केलेले सर्व बदल थेट डेटाबेसमध्ये जतन केले जातात.' : 'Changes are saved directly into the database.'}
                </p>
              </div>
              <button
                onClick={() => setEditingWorker(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {editSuccessMsg ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>
                ✓ {editSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSaveWorkerEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{isMr ? 'वापरकर्ता आयडी' : 'User ID'}:</strong> #{editingWorker.user_id || editingWorker.id}</span>
                  <span><strong>{isMr ? 'सद्यस्थिती' : 'Status'}:</strong> {isMr ? (editingWorker.status === 'active' ? 'सक्रिय' : 'ऑफलाइन') : (editingWorker.status === 'active' ? 'Active' : 'Offline')}</span>
                </div>

                {/* Worker Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'कार्यकर्त्याचे नाव *' : 'Worker Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder={isMr ? 'उदा. राहुल प्रभाकर पाटील' : 'e.g. Rahul Prabhakar Patil'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Role */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'भूमिका *' : 'Role *'}
                  </label>
                  <select
                    required
                    value={editFormData.role_id}
                    onChange={(e) => setEditFormData({ ...editFormData, role_id: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name === 'WORKER' ? (isMr ? '👷 फील्ड कार्यकर्ता' : '👷 Field Worker') :
                         r.name === 'OFFICER' ? (isMr ? '👔 नेते / अधिकारी' : '👔 Leader / Officer') :
                         (isMr ? (r.display_name || r.name) : r.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'मोबाईल नंबर *' : 'Mobile Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder={isMr ? 'उदा. ९८२२०११२२१' : 'e.g. 9822011221'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Status & Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'सद्यस्थिती' : 'Status'}
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                      }}
                    >
                      <option value="active">{isMr ? '🟢 सक्रिय' : '🟢 Active'}</option>
                      <option value="offline">{isMr ? '⚪ ऑफलाइन' : '⚪ Offline'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'नेमलेले कार्यक्षेत्र' : 'Assigned Area'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.assigned_area_mr}
                      onChange={(e) => setEditFormData({ ...editFormData, assigned_area_mr: e.target.value })}
                      placeholder={isMr ? 'उदा. माधवनगर (बूथ १ व २)' : 'e.g. Madhavnagar (Booth 1 & 2)'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingWorker(null)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#1e3a8a',
                      color: '#ffffff',
                      fontWeight: '700',
                      cursor: editSubmitting ? 'wait' : 'pointer',
                    }}
                  >
                    {editSubmitting ? (isMr ? 'जतन करत आहे...' : 'Saving...') : (isMr ? '💾 माहिती जतन करा' : 'Save Changes')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add New Worker Modal (Registers directly into Users & User Roles Table) */}
      {isAddModalOpen && (
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
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(520px, 96vw)',
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
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  ➕ {isMr ? 'नवीन कार्यकर्ता नोंदणी' : 'Add New Worker'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {isMr ? 'कार्यकर्ता थेट डेटाबेसमध्ये नोंदवला जाईल आणि त्याला भूमिका नेमली जाईल.' : 'Worker will be registered directly into the system.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {addSuccessMsg ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>
                ✓ {addSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSaveNewWorker} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'कार्यकर्त्याचे नाव *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorkerData.name}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, name: e.target.value })}
                    placeholder={isMr ? 'उदा. राहुल प्रभाकर पाटील' : 'e.g. Rahul Prabhakar Patil'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Role */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'भूमिका *' : 'Role *'}
                  </label>
                  <select
                    required
                    value={newWorkerData.role_id}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, role_id: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name === 'WORKER' ? (isMr ? '👷 फील्ड कार्यकर्ता' : '👷 Field Worker') :
                         r.name === 'OFFICER' ? (isMr ? '👔 नेते / अधिकारी' : '👔 Leader / Officer') :
                         (isMr ? (r.display_name || r.name) : r.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'मोबाईल नंबर *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={newWorkerData.phone}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, phone: e.target.value })}
                    placeholder={isMr ? 'उदा. ९८२२०११२२१' : 'e.g. 9822011221'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Email & Password for direct user login */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'ईमेल आयडी * (लॉगिनसाठी)' : 'Email ID * (Login)'}
                    </label>
                    <input
                      type="email"
                      required
                      value={newWorkerData.email}
                      onChange={(e) => setNewWorkerData({ ...newWorkerData, email: e.target.value })}
                      placeholder={isMr ? 'उदा. worker@domain.com' : 'e.g. worker@domain.com'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'लॉगिन पासवर्ड *' : 'Login Password *'}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newWorkerData.password}
                      onChange={(e) => setNewWorkerData({ ...newWorkerData, password: e.target.value })}
                      placeholder={isMr ? 'किमान ६ अक्षरे' : 'Min 6 chars'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                {/* Status & Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'सद्यस्थिती' : 'Status'}
                    </label>
                    <select
                      value={newWorkerData.status}
                      onChange={(e) => setNewWorkerData({ ...newWorkerData, status: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                      }}
                    >
                      <option value="active">{isMr ? '🟢 सक्रिय' : '🟢 Active'}</option>
                      <option value="offline">{isMr ? '⚪ ऑफलाइन' : '⚪ Offline'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'नेमलेले कार्यक्षेत्र' : 'Assigned Area'}
                    </label>
                    <input
                      type="text"
                      value={newWorkerData.assigned_area_mr}
                      onChange={(e) => setNewWorkerData({ ...newWorkerData, assigned_area_mr: e.target.value })}
                      placeholder={isMr ? 'उदा. माधवनगर (बूथ १ व २)' : 'e.g. Madhavnagar (Booth 1 & 2)'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={addSubmitting}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#1e3a8a',
                      color: '#ffffff',
                      fontWeight: '700',
                      cursor: addSubmitting ? 'wait' : 'pointer',
                    }}
                  >
                    {addSubmitting ? (isMr ? 'नोंदणी करत आहे...' : 'Registering...') : (isMr ? '➕ कार्यकर्ता नोंदवा' : 'Add Worker')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Direct Task Dispatch Modal */}
      {selectedWorkerForTask && (
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
          onClick={() => setSelectedWorkerForTask(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(500px, 96vw)',
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
                ⚡ {isMr ? 'कार्यकर्त्याला थेट कार्य सोपवा' : 'Assign Direct Task to Worker'}
              </h3>
              <button
                onClick={() => setSelectedWorkerForTask(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {taskSubmittedToast ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>
                ✓ {isMr ? 'कार्यकर्त्याला कार्य यशस्वीरित्या पाठवले गेले!' : 'Task assigned and dispatched successfully!'}
              </div>
            ) : (
              <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>{isMr ? 'कार्यकर्ता:' : 'Worker:'}</strong> {selectedWorkerForTask.name} (
                  {isMr ? selectedWorkerForTask.assigned_area_mr : (selectedWorkerForTask.assigned_area_en || selectedWorkerForTask.assigned_area_mr)})
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'कार्याचे नाव व सूचना *' : 'Task Description *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      isMr
                        ? 'उदा. बूथ क्र. ५ मधील प्रलंबित २० कुटुंबांशी आज संध्याकाळपर्यंत संपर्क साधा व समस्या नोंदवा...'
                        : 'Enter task instructions...'
                    }
                    value={taskNote}
                    onChange={(e) => setTaskNote(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerForTask(null)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={taskSubmitting}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#1e3a8a',
                      color: '#ffffff',
                      fontWeight: '700',
                      cursor: taskSubmitting ? 'wait' : 'pointer',
                    }}
                  >
                    {taskSubmitting ? (isMr ? 'पाठवत आहे...' : 'Sending...') : (isMr ? 'कार्य पाठवा' : 'Dispatch Task')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Karyakarta Complete Attendance Dossier Modal */}
      {selectedWorkerForAttendance && (() => {
        const historyData = getWorkerAttendanceHistory(selectedWorkerForAttendance, attendanceMonth);
        const { stats, logs } = historyData;

        return (
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
              if (e.target === e.currentTarget) setSelectedWorkerForAttendance(null);
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '960px',
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
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
                  padding: '22px 26px',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '800',
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>
                        {selectedWorkerForAttendance.name}
                      </h2>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          fontWeight: '800',
                          border: '1px solid rgba(255, 255, 255, 0.35)',
                        }}
                      >
                        #{selectedWorkerForAttendance.user_id || selectedWorkerForAttendance.id}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#ecfdf5',
                          color: '#047857',
                          fontWeight: '800',
                        }}
                      >
                        {selectedWorkerForAttendance.role_name === 'OFFICER' ? (isMr ? '👔 नेते व अधिकारी' : 'Officer') : (isMr ? '👷 फील्ड कार्यकर्ता' : 'Field Worker')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', flexWrap: 'wrap' }}>
                      <span>📞 {selectedWorkerForAttendance.phone}</span>
                      <span>📍 {isMr ? selectedWorkerForAttendance.assigned_area_mr : (selectedWorkerForAttendance.assigned_area_en || selectedWorkerForAttendance.assigned_area_mr)}</span>
                      <span>🟢 {selectedWorkerForAttendance.status === 'active' ? (isMr ? 'आज सक्रिय' : 'Active Today') : (isMr ? 'ऑफलाइन' : 'Offline')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedWorkerForAttendance(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#ffffff',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Month Selector & Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                      📅 {isMr ? 'मासिक हजेरी व उपस्थिती अहवाल' : 'Monthly Attendance & Field Log'}
                    </h3>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      {isMr ? 'जीपीएस पंच-इन, पंच-आउट, कामाचे तास व मतदार सर्वेक्षण पडताळणी' : 'Daily punch times, GPS coordinates, field hours and surveys done.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { key: '2026-11', label_mr: 'नोव्हेंबर २०२६ (चालू)', label_en: 'Nov 2026 (Current)' },
                      { key: '2026-10', label_mr: 'ऑक्टोबर २०२६', label_en: 'Oct 2026' },
                      { key: '2026-09', label_mr: 'सप्टेंबर २०२६', label_en: 'Sep 2026' },
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setAttendanceMonth(m.key)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: attendanceMonth === m.key ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          background: attendanceMonth === m.key ? '#eff6ff' : '#ffffff',
                          color: attendanceMonth === m.key ? '#1d4ed8' : '#475569',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {isMr ? m.label_mr : m.label_en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5 Colorful KPI Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  {/* Present */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: '700', opacity: 0.9 }}>
                      {isMr ? '🟢 एकूण हजर दिवस' : 'Present Days'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>
                      {stats.presentCount} <span style={{ fontSize: '13px', fontWeight: '600' }}>{isMr ? 'दिवस' : 'days'}</span>
                    </div>
                  </div>

                  {/* Absent */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: '700', opacity: 0.9 }}>
                      {isMr ? '🔴 गैरहजर' : 'Absent Days'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>
                      {stats.absentCount} <span style={{ fontSize: '13px', fontWeight: '600' }}>{isMr ? 'दिवस' : 'days'}</span>
                    </div>
                  </div>

                  {/* Half-Day */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: '700', opacity: 0.9 }}>
                      {isMr ? '🟡 अर्धा दिवस' : 'Half Days'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>
                      {stats.halfDayCount} <span style={{ fontSize: '13px', fontWeight: '600' }}>{isMr ? 'दिवस' : 'days'}</span>
                    </div>
                  </div>

                  {/* Avg Hours */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: '700', opacity: 0.9 }}>
                      {isMr ? '⏱️ सरासरी तास / दिवस' : 'Avg Hours / Day'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>
                      {stats.avgHours} <span style={{ fontSize: '13px', fontWeight: '600' }}>{isMr ? 'तास' : 'hrs'}</span>
                    </div>
                  </div>

                  {/* Attendance Rate */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: '700', opacity: 0.9 }}>
                      {isMr ? '📊 हजेरी प्रमाण' : 'Attendance Rate'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>
                      {stats.attendancePct}%
                    </div>
                  </div>
                </div>

                {/* Daily Punch Logs Table */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: '800', fontSize: '13px', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📋 {isMr ? 'दैनंदिन हजेरी नोंद वही (Daily Log Records)' : 'Daily Attendance Records'}</span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>{logs.length} {isMr ? 'नोंदी' : 'entries'}</span>
                  </div>

                  <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1, borderBottom: '1px solid #cbd5e1' }}>
                        <tr style={{ color: '#475569', fontWeight: '700' }}>
                          <th style={{ padding: '10px 12px' }}>{isMr ? 'तारीख व वार' : 'Date & Day'}</th>
                          <th style={{ padding: '10px 12px' }}>{isMr ? 'स्थिती' : 'Status'}</th>
                          <th style={{ padding: '10px 12px' }}>{isMr ? 'प्रथम पंच इन (GPS)' : 'Punch In & GPS'}</th>
                          <th style={{ padding: '10px 12px' }}>{isMr ? 'अंतिम पंच आउट (GPS)' : 'Punch Out & GPS'}</th>
                          <th style={{ padding: '10px 12px' }}>{isMr ? 'कामाचे तास' : 'Hours'}</th>
                          <th style={{ padding: '10px 12px' }}>{isMr ? 'पूर्ण सर्वेक्षण' : 'Surveys'}</th>
                          <th style={{ padding: '10px 12px' }}>{isMr ? 'शेरा / तपशील' : 'Remarks'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                            <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>
                              {log.date}{' '}
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>({log.day})</span>
                            </td>

                            <td style={{ padding: '10px 12px' }}>
                              {log.status === 'PRESENT' && (
                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', border: '1px solid #86efac' }}>
                                  ✓ {isMr ? 'हजर' : 'Present'}
                                </span>
                              )}
                              {log.status === 'ABSENT' && (
                                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', border: '1px solid #fca5a5' }}>
                                  ✕ {isMr ? 'गैरहजर' : 'Absent'}
                                </span>
                              )}
                              {log.status === 'HALF_DAY' && (
                                <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', border: '1px solid #fde68a' }}>
                                  ½ {isMr ? 'अर्धा दिवस' : 'Half Day'}
                                </span>
                              )}
                              {log.status === 'HOLIDAY' && (
                                <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                  🏖️ {isMr ? 'सुट्टी' : 'Holiday'}
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: '700', color: '#1e293b' }}>{log.punchIn}</div>
                              {log.punchInLocation !== '-' && (
                                <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {log.punchInLocation}</div>
                              )}
                            </td>

                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: '700', color: '#1e293b' }}>{log.punchOut}</div>
                              {log.punchOutLocation !== '-' && (
                                <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {log.punchOutLocation}</div>
                              )}
                            </td>

                            <td style={{ padding: '10px 12px', fontWeight: '800', color: log.hours === '0.0' ? '#94a3b8' : '#2563eb' }}>
                              {log.hours} {isMr ? 'तास' : 'hrs'}
                            </td>

                            <td style={{ padding: '10px 12px', fontWeight: '800', color: log.surveys > 0 ? '#16a34a' : '#94a3b8' }}>
                              {log.surveys > 0 ? `+${log.surveys}` : '0'}
                            </td>

                            <td style={{ padding: '10px 12px', fontSize: '11.5px', color: '#475569' }}>
                              {log.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                    <span>{isMr ? 'हजेरी पत्रक मुद्रित करा (Print)' : 'Print Attendance Sheet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedWorkerForAttendance(null)}
                    style={{
                      background: '#1e3a8a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 22px',
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
        );
      })()}
    </div>
  );
}
