import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../api/axios';
import {
  Shield,
  User,
  Crown,
  ChevronDown,
  Check,
  LayoutGrid,
  Zap,
  FileText,
  Settings,
  Folder,
  MapPin,
  ClipboardList,
  Handshake,
  Calendar,
  Bot,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

// Metadata and visual styling for permissions
const PERMISSION_CONFIG = {
  admin_panel: {
    key: 'admin_panel',
    title_en: 'Admin Panel',
    title_mr: 'ॲडमिन पॅनेल',
    desc_en: 'Full access to admin dashboard and settings.',
    desc_mr: 'ॲडमिन डॅशबोर्ड आणि मुख्य प्रशासकीय सेटिंग्जचे संपूर्ण नियंत्रण.',
    Icon: LayoutGrid,
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  political_command: {
    key: 'political_command',
    title_en: 'Political Command',
    title_mr: 'राजकीय नियंत्रण कक्ष',
    desc_en: 'Access to political command features.',
    desc_mr: 'राजकीय कमांड मुख्यालय व नेता डेस्क वापरण्याची परवानगी.',
    Icon: Zap,
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  user_management: {
    key: 'user_management',
    title_en: 'User Management',
    title_mr: 'वापरकर्ते व्यवस्थापन',
    desc_en: 'Manage users and roles.',
    desc_mr: 'वापरकर्ते खाती आणि परवानग्या व्यवस्थापित करा.',
    Icon: User,
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  strategic_reports: {
    key: 'strategic_reports',
    title_en: 'Strategic Reports',
    title_mr: 'स्ट्रॅटेजिक अहवाल',
    desc_en: 'View voter sentiment and strategic election reports.',
    desc_mr: 'मतदार कल आणि निवडणूक विश्लेषण अहवाल पहा व डाऊनलोड करा.',
    Icon: FileText,
    color: '#0d9488',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  reports: {
    key: 'reports',
    title_en: 'Reports',
    title_mr: 'अहवाल (Reports)',
    desc_en: 'View and download field reports.',
    desc_mr: 'मतदार कल आणि निवडणूक विश्लेषण अहवाल पहा व डाऊनलोड करा.',
    Icon: FileText,
    color: '#0d9488',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  settings: {
    key: 'settings',
    title_en: 'Settings',
    title_mr: 'सेटिंग्ज',
    desc_en: 'Access to system settings and configuration.',
    desc_mr: 'सिस्टम सेटिंग्ज व कॉन्फिगरेशन ॲक्सेस.',
    Icon: Settings,
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  project_management: {
    key: 'project_management',
    title_en: 'Project Management',
    title_mr: 'प्रकल्प व्यवस्थापन',
    desc_en: 'Create, configure, and monitor political projects.',
    desc_mr: 'निवडणूक व प्रचार प्रकल्प तयार करा, संपादित करा आणि देखरेख करा.',
    Icon: Folder,
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  geography_booths: {
    key: 'geography_booths',
    title_en: 'Geography & Booths',
    title_mr: 'भौगोलिक व मतदान केंद्र',
    desc_en: 'Manage constituencies, talukas, wards, and polling booths.',
    desc_mr: 'विधानसभा मतदारसंघ, तालुके, गावे, वॉर्ड आणि मतदान केंद्र व्यवस्थापन.',
    Icon: MapPin,
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  voter_surveys: {
    key: 'voter_surveys',
    title_en: 'Voter Surveys',
    title_mr: 'मतदार व कुटुंब सर्व्हे',
    desc_en: 'Conduct household surveys and record ground voter data.',
    desc_mr: 'घरोघरी जाऊन कुटुंब सर्वेक्षण करणे व प्रत्यक्ष मतदार डेटा नोंदवणे.',
    Icon: ClipboardList,
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  citizen_crm: {
    key: 'citizen_crm',
    title_en: 'Citizen CRM',
    title_mr: 'नागरिक CRM व तक्रारी',
    desc_en: 'Manage 360° citizen voter profiles, voter contacts, and grievances.',
    desc_mr: 'नागरिक ३६०° मतदार प्रोफाईल्स, संपर्क इतिहास व समस्या निवारण.',
    Icon: Handshake,
    color: '#0d9488',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  meetings_tours: {
    key: 'meetings_tours',
    title_en: 'Meetings & Tours',
    title_mr: 'दौरे, सभा व बैठका',
    desc_en: 'Schedule and manage rallies, leader visits, and cadre meetings.',
    desc_mr: 'राजकीय सभा, नेत्यांचे क्षेत्रीय दौरे आणि कार्यकर्ता बैठका नियोजन.',
    Icon: Calendar,
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#ddd6fe',
  },
  ai_chatbot: {
    key: 'ai_chatbot',
    title_en: 'AI Assistant',
    title_mr: 'AI प्रचार सहाय्यक',
    desc_en: 'Access AI campaign assistant, talking points, and Q&A desk.',
    desc_mr: 'AI प्रचार सहाय्यक, भाषण मुद्दे आणि मतदार संवाद मार्गदर्शन.',
    Icon: Bot,
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
};

const PREFERRED_ORDER = [
  'admin_panel',
  'political_command',
  'user_management',
  'strategic_reports',
  'reports',
  'settings',
  'project_management',
  'geography_booths',
  'voter_surveys',
  'citizen_crm',
  'meetings_tours',
  'ai_chatbot',
];

function getPermMeta(perm) {
  if (!perm) return null;
  const cfg = PERMISSION_CONFIG[perm.name];
  if (cfg) return cfg;
  const cleanName = (perm.name || '').replace(/_/g, ' ').replace(/\./g, ' ');
  return {
    key: perm.name,
    title_en: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    title_mr: cleanName,
    desc_en: perm.description || 'Access to this system feature.',
    desc_mr: perm.description || 'या सिस्टीम फिचरचा वापर.',
    Icon: Shield,
    color: '#64748b',
    bgColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  };
}

export default function RolePermissionManager({
  roles = [],
  language = 'en',
  onRefreshRoles,
  onNotice,
  onError,
}) {
  const isMr = language === 'mr';

  // Target Selection:
  // targetType: 'ROLE' | 'WORKER'
  const [targetType, setTargetType] = useState('ROLE');
  const [selectedRoleId, setSelectedRoleId] = useState(1);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  // Local copy of roles so optimistic updates can modify permissions instantly
  const [localRoles, setLocalRoles] = useState(roles);

  // Sync incoming roles prop
  useEffect(() => {
    if (roles && roles.length > 0) {
      setLocalRoles(roles);
    }
  }, [roles]);

  // Data States
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Active granted permission IDs for current view
  const [stagedPermIds, setStagedPermIds] = useState(new Set());
  const [workerInheritedIds, setWorkerInheritedIds] = useState(new Set());
  const [workerDirectIds, setWorkerDirectIds] = useState(new Set());

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE'

  // Toast notification state (in-place feedback, avoids full page jumping)
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const showToast = useCallback((message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: '', isError: false });
    }, 3000);
  }, []);

  // Quick Worker Assignment Modal
  const [assignModal, setAssignModal] = useState(null);
  const [assignTargetUserId, setAssignTargetUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // 1. Load Master Permissions & Users
  const loadMasterPermissions = async () => {
    setLoadingPerms(true);
    try {
      const { data } = await apiClient.get('/admin/permissions');
      setAvailablePermissions(data.data || []);
    } catch (err) {
      console.error('Failed to load permissions:', err);
      showToast(err.message || 'Failed to load master permissions.', true);
    } finally {
      setLoadingPerms(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await apiClient.get('/admin/users-list');
      setUsersList(data.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadMasterPermissions();
    loadUsers();
  }, []);

  // Roles References
  const workerRole = useMemo(() => localRoles.find((r) => r.name === 'WORKER') || null, [localRoles]);
  const officerRole = useMemo(() => localRoles.find((r) => r.name === 'OFFICER') || null, [localRoles]);
  const adminRole = useMemo(() => localRoles.find((r) => r.name === 'ADMIN') || null, [localRoles]);

  // Sync default role to WORKER on initial load
  useEffect(() => {
    if (localRoles.length > 0 && !selectedRoleId) {
      const defaultRole = localRoles.find((r) => r.name === 'WORKER') || localRoles[0];
      setSelectedRoleId(defaultRole.id);
    }
  }, [localRoles, selectedRoleId]);

  const currentRole = useMemo(() => {
    return localRoles.find((r) => r.id === selectedRoleId) || null;
  }, [localRoles, selectedRoleId]);

  // List of Field Workers specifically
  const fieldWorkers = useMemo(() => {
    return usersList.filter((u) => u.roles?.some((r) => r.name === 'WORKER'));
  }, [usersList]);

  // Other users (Officers / Admins)
  const otherUsers = useMemo(() => {
    return usersList.filter((u) => !u.roles?.some((r) => r.name === 'WORKER'));
  }, [usersList]);

  const selectedWorker = useMemo(() => {
    if (!selectedWorkerId) return null;
    return usersList.find((u) => u.id === Number(selectedWorkerId)) || null;
  }, [usersList, selectedWorkerId]);

  // 2. Load Permissions for Selected Target (Role or Worker)
  useEffect(() => {
    if (targetType === 'ROLE' && currentRole) {
      const ids = new Set((currentRole.permissions || []).map((p) => p.id));
      setStagedPermIds(ids);
      setWorkerInheritedIds(new Set());
      setWorkerDirectIds(new Set());
    } else if (targetType === 'WORKER' && selectedWorkerId) {
      const fetchWorkerPerms = async () => {
        try {
          const { data } = await apiClient.get(`/admin/users/${selectedWorkerId}/permissions`);
          const payload = data.data || {};
          const inherited = new Set((payload.role_permissions || []).map((p) => p.id));
          const direct = new Set((payload.direct_permissions || []).map((p) => p.id));
          const effective = new Set((payload.effective_permissions || []).map((p) => p.id));

          setWorkerInheritedIds(inherited);
          setWorkerDirectIds(direct);
          setStagedPermIds(effective);
        } catch (err) {
          console.error('Failed to load worker permissions:', err);
          showToast(isMr ? 'कार्यकर्त्याच्या परवानग्या लोड करता आल्या नाहीत.' : 'Failed to load worker permissions.', true);
        }
      };
      fetchWorkerPerms();
    }
  }, [targetType, selectedRoleId, currentRole, selectedWorkerId, showToast, isMr]);

  // 3. Toggle permission - Immediate optimistic update + backend persist
  const handleToggle = async (permId) => {
    const isCurrentlyGranted = stagedPermIds.has(permId);
    const nextStaged = new Set(stagedPermIds);

    if (isCurrentlyGranted) {
      nextStaged.delete(permId);
    } else {
      nextStaged.add(permId);
    }
    setStagedPermIds(nextStaged);

    if (targetType === 'ROLE' && selectedRoleId) {
      try {
        if (isCurrentlyGranted) {
          await apiClient.delete(`/admin/roles/${selectedRoleId}/permissions/${permId}`);
        } else {
          await apiClient.post(`/admin/roles/${selectedRoleId}/permissions/give`, {
            permission_id: permId,
          });
        }

        // Optimistically update localRoles
        setLocalRoles((prev) =>
          prev.map((r) => {
            if (r.id === selectedRoleId) {
              const updated = isCurrentlyGranted
                ? (r.permissions || []).filter((p) => p.id !== permId)
                : [...(r.permissions || []), availablePermissions.find((p) => p.id === permId)].filter(Boolean);
              return { ...r, permissions: updated };
            }
            return r;
          })
        );

        showToast(
          isMr
            ? `${isCurrentlyGranted ? 'परवानगी बंद केली.' : 'परवानगी सक्रिय केली.'}`
            : `Permission ${isCurrentlyGranted ? 'disabled' : 'enabled'}.`
        );

        if (onRefreshRoles) onRefreshRoles();
      } catch (err) {
        console.error('Role toggle failed:', err);
        setStagedPermIds(new Set(stagedPermIds)); // Revert
        showToast(err.message || (isMr ? 'परवानगी बदलताना त्रुटी आली.' : 'Failed to update permission.'), true);
      }
    } else if (targetType === 'WORKER' && selectedWorkerId) {
      const isDirect = workerDirectIds.has(permId);
      const isInherited = workerInheritedIds.has(permId);

      try {
        if (isCurrentlyGranted) {
          if (isDirect) {
            // Revoke direct permission
            await apiClient.delete(`/admin/users/${selectedWorkerId}/permissions/${permId}`);
            const nextDirect = new Set(workerDirectIds);
            nextDirect.delete(permId);
            setWorkerDirectIds(nextDirect);

            if (isInherited) {
              // Still has it via role
              nextStaged.add(permId);
              setStagedPermIds(nextStaged);
              showToast(
                isMr
                  ? 'थेट परवाना काढला. (कार्यकर्त्यास भूमिकेकडून ॲक्सेस चालू राहील)'
                  : 'Direct permission removed. (Retains access via role)'
              );
            } else {
              showToast(isMr ? 'कार्यकर्त्याची परवानगी बंद केली.' : 'Worker permission disabled.');
            }
          } else if (isInherited) {
            // Cannot remove role permission from single user without changing role
            setStagedPermIds(new Set(stagedPermIds)); // Keep active
            showToast(
              isMr
                ? 'ही परवानगी "क्षेत्रीय कार्यकर्ता" भूमिकेकडून मिळालेली आहे. ती बदलण्यासाठी वरून "भूमिका" निवडा.'
                : 'This permission is inherited from the Role. Modify the Role to remove it.',
              true
            );
          }
        } else {
          // Grant direct permission to this worker
          await apiClient.post(`/admin/users/${selectedWorkerId}/permissions/give`, {
            permission_id: permId,
          });
          const nextDirect = new Set(workerDirectIds);
          nextDirect.add(permId);
          setWorkerDirectIds(nextDirect);
          showToast(
            isMr
              ? `"${selectedWorker?.full_name}" यांना थेट परवानगी दिली.`
              : `Direct permission granted to ${selectedWorker?.full_name}.`
          );
        }
        await loadUsers();
      } catch (err) {
        console.error('Worker toggle failed:', err);
        setStagedPermIds(new Set(stagedPermIds)); // Revert
        showToast(err.message || (isMr ? 'त्रुटी आली.' : 'Failed to update worker permission.'), true);
      }
    }
  };

  // Quick Assign from Assigned-To Column
  const handleAssignAction = async (permId, actionValue) => {
    if (actionValue === 'CUSTOM_MODAL') {
      const permObj = availablePermissions.find((p) => p.id === permId);
      const meta = getPermMeta(permObj);
      setAssignModal({
        permId,
        permName: isMr ? meta?.title_mr : meta?.title_en,
      });
      setAssignTargetUserId(String(fieldWorkers[0]?.id || otherUsers[0]?.id || ''));
      return;
    }

    if (actionValue === 'GIVE_CURRENT_ROLE') {
      if (!stagedPermIds.has(permId)) {
        await handleToggle(permId);
      }
      return;
    }

    if (actionValue === 'REMOVE_CURRENT_ROLE') {
      if (stagedPermIds.has(permId)) {
        await handleToggle(permId);
      }
      return;
    }

    if (actionValue === 'GIVE_WORKER_ROLE' && workerRole) {
      try {
        await apiClient.post(`/admin/roles/${workerRole.id}/permissions/give`, { permission_id: permId });
        showToast(isMr ? 'क्षेत्रीय कार्यकर्ता भूमिकेस परवानगी दिली.' : 'Assigned to Field Worker role.');
        if (targetType === 'ROLE' && selectedRoleId === workerRole.id) {
          const next = new Set(stagedPermIds);
          next.add(permId);
          setStagedPermIds(next);
        }
        if (onRefreshRoles) await onRefreshRoles();
      } catch (err) {
        showToast(err.message || 'Failed to assign role.', true);
      }
      return;
    }

    if (actionValue === 'GIVE_OFFICER_ROLE' && officerRole) {
      try {
        await apiClient.post(`/admin/roles/${officerRole.id}/permissions/give`, { permission_id: permId });
        showToast(isMr ? 'नेता / अधिकारी भूमिकेस परवानगी दिली.' : 'Assigned to Leader/Officer role.');
        if (targetType === 'ROLE' && selectedRoleId === officerRole.id) {
          const next = new Set(stagedPermIds);
          next.add(permId);
          setStagedPermIds(next);
        }
        if (onRefreshRoles) await onRefreshRoles();
      } catch (err) {
        showToast(err.message || 'Failed to assign role.', true);
      }
      return;
    }

    if (actionValue === 'GIVE_ADMIN_ROLE' && adminRole) {
      try {
        await apiClient.post(`/admin/roles/${adminRole.id}/permissions/give`, { permission_id: permId });
        showToast(isMr ? 'ॲडमिन भूमिकेस परवानगी दिली.' : 'Assigned to Administrator role.');
        if (targetType === 'ROLE' && selectedRoleId === adminRole.id) {
          const next = new Set(stagedPermIds);
          next.add(permId);
          setStagedPermIds(next);
        }
        if (onRefreshRoles) await onRefreshRoles();
      } catch (err) {
        showToast(err.message || 'Failed to assign role.', true);
      }
      return;
    }

    if (actionValue.startsWith('WORKER_')) {
      const uId = actionValue.replace('WORKER_', '');
      try {
        await apiClient.post(`/admin/users/${uId}/permissions/give`, { permission_id: permId });
        const targetUser = usersList.find((u) => u.id === Number(uId));
        showToast(isMr ? `${targetUser?.full_name} यांना थेट परवानगी दिली.` : `Permission granted to ${targetUser?.full_name}.`);
        await loadUsers();
      } catch (err) {
        showToast(err.message || 'Failed to assign to worker.', true);
      }
    }
  };

  // Quick Modal Submit
  const handleQuickAssignToWorker = async () => {
    if (!assignModal?.permId || !assignTargetUserId) return;
    setIsAssigning(true);
    try {
      await apiClient.post(`/admin/users/${assignTargetUserId}/permissions/give`, {
        permission_id: assignModal.permId,
      });
      await loadUsers();
      if (onRefreshRoles) await onRefreshRoles();
      const targetUser = usersList.find((u) => u.id === Number(assignTargetUserId));
      showToast(
        isMr
          ? `"${assignModal.permName}" ही परवानगी ${targetUser?.full_name} यांना देण्यात आली.`
          : `Permission "${assignModal.permName}" granted to ${targetUser?.full_name}.`
      );
      setAssignModal(null);
      setAssignTargetUserId('');
    } catch (err) {
      showToast(err.message || 'Failed to assign permission.', true);
    } finally {
      setIsAssigning(false);
    }
  };

  // Sorted list of permissions
  const sortedPermissions = useMemo(() => {
    if (!availablePermissions || availablePermissions.length === 0) return [];
    return [...availablePermissions].sort((a, b) => {
      const idxA = PREFERRED_ORDER.indexOf(a.name);
      const idxB = PREFERRED_ORDER.indexOf(b.name);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });
  }, [availablePermissions]);

  // Displayed permissions filtered by active status if selected
  const displayedPermissions = useMemo(() => {
    if (statusFilter === 'ACTIVE') {
      return sortedPermissions.filter((p) => stagedPermIds.has(p.id));
    }
    return sortedPermissions;
  }, [sortedPermissions, statusFilter, stagedPermIds]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#1e293b',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '8px 4px 40px 4px',
        cursor: 'default',
      }}
    >
      {/* Clean Global Styles - Eliminates 3D thrashing & cursor blinking */}
      <style>{`
        .perm-table-row {
          transition: background-color 0.15s ease;
          cursor: default;
        }
        .perm-table-row:hover {
          background-color: #f8fafc !important;
        }
        .perm-table-row-active:hover {
          background-color: #f0fdf4 !important;
        }
        .clean-select-box {
          cursor: pointer !important;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .clean-select-box:hover {
          border-color: #3b82f6 !important;
        }
        .clean-select-box:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
        }
        .clean-btn {
          cursor: pointer !important;
          user-select: none;
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease;
        }
        .clean-btn:active {
          transform: translateY(1px);
        }
      `}</style>

      {/* Floating In-Place Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 10000,
            background: toast.isError ? '#fef2f2' : '#ecfdf5',
            border: `1.5px solid ${toast.isError ? '#fca5a5' : '#6ee7b7'}`,
            color: toast.isError ? '#991b1b' : '#065f46',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
          }}
        >
          {toast.isError ? <AlertCircle size={18} color="#dc2626" /> : <Check size={18} color="#059669" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER: ROLES & PERMISSIONS TITLE & ICON                 */}
      {/* ============================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: '#e6f9ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '2px solid #bbf7d0',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.15)',
            }}
          >
            <Shield size={26} color="#16a34a" fill="#16a34a" fillOpacity={0.25} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {isMr ? 'भूमिका व परवानग्या (Roles & Permissions)' : 'Roles & Permissions'}
            </h1>
            <p
              style={{
                fontSize: 13.5,
                color: '#64748b',
                margin: '4px 0 0 0',
                fontWeight: 450,
              }}
            >
              {isMr
                ? 'प्रत्येक भूमिका किंवा क्षेत्रीय कार्यकर्त्यास कोणत्या गोष्टींचा प्रवेश असेल ते ठरवा.'
                : 'Manage what each role or field worker can access.'}
            </p>
          </div>
        </div>

        {/* Selected Mode Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: targetType === 'WORKER' ? '#ecfdf5' : '#eff6ff',
            border: `1.5px solid ${targetType === 'WORKER' ? '#a7f3d0' : '#bfdbfe'}`,
            padding: '6px 14px',
            borderRadius: 24,
            fontSize: 13,
            fontWeight: 750,
            color: targetType === 'WORKER' ? '#047857' : '#1d4ed8',
          }}
        >
          {targetType === 'WORKER' ? (
            <>
              <User size={15} color="#059669" />
              <span>
                {isMr ? 'कार्यकर्ता स्तर: ' : 'Worker View: '}
                <strong>{selectedWorker?.full_name || 'निवडला नाही'}</strong>
              </span>
              <button
                type="button"
                className="clean-btn"
                onClick={() => {
                  setTargetType('ROLE');
                  setSelectedWorkerId('');
                }}
                title={isMr ? 'भूमिकेवर परत जा' : 'Back to Roles'}
                style={{
                  background: '#ffffff',
                  border: '1px solid #a7f3d0',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  marginLeft: 4,
                  cursor: 'pointer',
                  color: '#047857',
                  fontSize: 11,
                }}
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <Shield size={15} color="#2563eb" />
              <span>
                {isMr ? 'भूमिका स्तर: ' : 'Role View: '}
                <strong>{currentRole?.display_name || currentRole?.name || 'Field Worker'}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TOP FILTER HUB: 1. SELECT ROLE | 2. SELECT WORKER | STATUS   */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          padding: '16px 20px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 2.2fr) minmax(260px, 1.5fr) minmax(170px, auto)',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          {/* Section 1: 1. Select Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: targetType === 'ROLE' ? '#2563eb' : '#94a3b8',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                {isMr ? '१. भूमिका निवडा (1. Select Role)' : '1. Select Role'}
              </span>
            </div>

            {/* Role Buttons Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                width: '100%',
              }}
            >
              {/* 1. Field Worker Card */}
              {workerRole && (() => {
                const isSelected = targetType === 'ROLE' && selectedRoleId === workerRole.id;
                return (
                  <button
                    type="button"
                    className="clean-btn"
                    onClick={() => {
                      setTargetType('ROLE');
                      setSelectedRoleId(workerRole.id);
                      setSelectedWorkerId('');
                    }}
                    style={{
                      width: '100%',
                      height: 46,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.18)' : '0 1px 2px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: isSelected ? '#2563eb' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <User size={14} color={isSelected ? '#ffffff' : '#64748b'} strokeWidth={2.5} />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {isMr ? 'क्षेत्रीय कार्यकर्ता' : 'Field Worker'}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        padding: '2px 7px',
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                    >
                      {workerRole.permissions?.length || 0}
                    </span>
                  </button>
                );
              })()}

              {/* 2. Leader / Officer Card */}
              {officerRole && (() => {
                const isSelected = targetType === 'ROLE' && selectedRoleId === officerRole.id;
                return (
                  <button
                    type="button"
                    className="clean-btn"
                    onClick={() => {
                      setTargetType('ROLE');
                      setSelectedRoleId(officerRole.id);
                      setSelectedWorkerId('');
                    }}
                    style={{
                      width: '100%',
                      height: 46,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.18)' : '0 1px 2px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: isSelected ? '#2563eb' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <User size={14} color={isSelected ? '#ffffff' : '#64748b'} strokeWidth={2.5} />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {isMr ? 'नेता / अधिकारी' : 'Leader / Officer'}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        padding: '2px 7px',
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                    >
                      {officerRole.permissions?.length || 0}
                    </span>
                  </button>
                );
              })()}

              {/* 3. Administrator Card */}
              {adminRole && (() => {
                const isSelected = targetType === 'ROLE' && selectedRoleId === adminRole.id;
                return (
                  <button
                    type="button"
                    className="clean-btn"
                    onClick={() => {
                      setTargetType('ROLE');
                      setSelectedRoleId(adminRole.id);
                      setSelectedWorkerId('');
                    }}
                    style={{
                      width: '100%',
                      height: 46,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.18)' : '0 1px 2px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: isSelected ? '#2563eb' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Crown size={14} color={isSelected ? '#ffffff' : '#64748b'} strokeWidth={2.5} />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {isMr ? 'ॲडमिन' : 'Administrator'}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        padding: '2px 7px',
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                    >
                      {adminRole.permissions?.length || 0}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Section 2: 2. Select Field Worker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: targetType === 'WORKER' ? '#059669' : '#94a3b8',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                {isMr ? '२. कार्यकर्ता निवडा (2. Select Field Worker)' : '2. Select Field Worker'}
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: targetType === 'WORKER' ? '#059669' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <User size={13} color={targetType === 'WORKER' ? '#ffffff' : '#64748b'} strokeWidth={2.5} />
              </div>

              <select
                className="clean-select-box"
                value={targetType === 'WORKER' ? selectedWorkerId : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setTargetType('WORKER');
                    setSelectedWorkerId(val);
                  } else {
                    setTargetType('ROLE');
                    setSelectedWorkerId('');
                  }
                }}
                style={{
                  width: '100%',
                  height: 46,
                  boxSizing: 'border-box',
                  paddingLeft: 40,
                  paddingRight: 32,
                  borderRadius: 10,
                  border: targetType === 'WORKER' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  background: targetType === 'WORKER' ? '#ecfdf5' : '#ffffff',
                  color: targetType === 'WORKER' ? '#065f46' : '#1e293b',
                  fontSize: 13,
                  fontWeight: targetType === 'WORKER' ? 800 : 550,
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">
                  {isMr ? '👤 येथे क्लिक करून कार्यकर्ता निवडा...' : '👤 Choose a field worker...'}
                </option>
                {fieldWorkers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} {u.phone ? `(📞 ${u.phone})` : ''}
                  </option>
                ))}
                {otherUsers.length > 0 && (
                  <optgroup label={isMr ? '👔 इतर अधिकारी / कर्मचारी' : '👔 Other Staff'}>
                    {otherUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.roles?.map((r) => r.name).join(', ')})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown
                size={15}
                color={targetType === 'WORKER' ? '#059669' : '#64748b'}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Section 3: Status / Filter Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
            <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#047857' }}>
                  {isMr ? '३. सद्यस्थिती (Status)' : '3. Status'}
                </span>
              </div>
              {statusFilter === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: 11,
                    fontWeight: 750,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  {isMr ? 'सर्व दाखवा' : 'Show All'}
                </button>
              )}
            </div>

            <button
              type="button"
              className="clean-btn"
              onClick={() => setStatusFilter((prev) => (prev === 'ACTIVE' ? 'ALL' : 'ACTIVE'))}
              title={
                isMr
                  ? statusFilter === 'ACTIVE'
                    ? 'सर्व परवानग्या दाखवण्यासाठी क्लिक करा'
                    : 'फक्त सक्रिय परवानग्या फिल्टर करण्यासाठी क्लिक करा'
                  : statusFilter === 'ACTIVE'
                    ? 'Click to show all permissions'
                    : 'Click to filter only active permissions'
              }
              style={{
                width: '100%',
                background: statusFilter === 'ACTIVE' ? '#047857' : '#059669',
                border: 'none',
                borderRadius: 10,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 46,
                boxSizing: 'border-box',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} color="#059669" strokeWidth={3.5} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: '#ffffff',
                      display: 'block',
                      lineHeight: 1.1,
                    }}
                  >
                    {isMr ? 'सक्रिय' : 'Active'}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 650,
                      color: 'rgba(255,255,255,0.85)',
                      display: 'block',
                    }}
                  >
                    {statusFilter === 'ACTIVE'
                      ? (isMr ? 'फिल्टर चालू' : 'Filtered')
                      : (isMr ? 'क्लिक करा' : 'Click to filter')}
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.22)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  marginLeft: 6,
                  flexShrink: 0,
                }}
              >
                {stagedPermIds.size} / {availablePermissions.length || 10}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN PERMISSIONS TABLE CARD                                 */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              cursor: 'default',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                }}
              >
                <th
                  style={{
                    padding: '14px 20px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#475569',
                    width: 130,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isMr ? 'स्थिती' : 'Status'}
                </th>
                <th
                  style={{
                    padding: '14px 20px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isMr ? 'परवानगी' : 'Permission'}
                </th>
                <th
                  style={{
                    padding: '14px 20px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#475569',
                    width: 280,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isMr ? 'कोणास दिली आहे' : 'Assigned To'}
                </th>
                <th
                  style={{
                    padding: '14px 20px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#475569',
                    width: 120,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isMr ? 'चालू/बंद' : 'Toggle'}
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingPerms ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    {isMr ? 'परवानग्या लोड होत आहेत...' : 'Loading permissions...'}
                  </td>
                </tr>
              ) : displayedPermissions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    {statusFilter === 'ACTIVE'
                      ? (isMr ? 'कोणतीही सक्रिय परवानगी नाही.' : 'No active permissions.')
                      : (isMr ? 'कोणतीही परवानगी सापडली नाही.' : 'No permissions available.')}
                  </td>
                </tr>
              ) : (
                displayedPermissions.map((perm) => {
                  const meta = getPermMeta(perm);
                  const isGranted = stagedPermIds.has(perm.id);
                  const IconComp = meta.Icon || Shield;

                  // Worker mode specifics
                  const isWorkerInherited = targetType === 'WORKER' && workerInheritedIds.has(perm.id);
                  const isWorkerDirect = targetType === 'WORKER' && workerDirectIds.has(perm.id);

                  // Roles that currently hold this permission
                  const hasWorker = workerRole?.permissions?.some((p) => p.id === perm.id);
                  const hasOfficer = officerRole?.permissions?.some((p) => p.id === perm.id);
                  const hasAdmin = adminRole?.permissions?.some((p) => p.id === perm.id);

                  return (
                    <tr
                      key={perm.id}
                      className={`perm-table-row ${isGranted ? 'perm-table-row-active' : ''}`}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isGranted ? '#fcfffd' : '#ffffff',
                      }}
                    >
                      {/* Column 1: Status Pill Badge */}
                      <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                        {isGranted ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 10px',
                              borderRadius: 20,
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#10b981',
                              }}
                            />
                            <span>{isMr ? 'सक्रिय' : 'Active'}</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 10px',
                              borderRadius: 20,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#64748b',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#94a3b8',
                              }}
                            />
                            <span>{isMr ? 'बंद' : 'Inactive'}</span>
                          </span>
                        )}
                      </td>

                      {/* Column 2: Permission Avatar + Title + Desc */}
                      <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              backgroundColor: meta.bgColor,
                              border: `1px solid ${meta.borderColor || '#e2e8f0'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <IconComp size={18} color={meta.color} />
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 13.5,
                                fontWeight: 800,
                                color: '#0f172a',
                                lineHeight: 1.25,
                              }}
                            >
                              {isMr ? meta.title_mr : meta.title_en}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: '#64748b',
                                marginTop: 3,
                                lineHeight: 1.35,
                              }}
                            >
                              {isMr ? meta.desc_mr : meta.desc_en}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Assigned To Interactive Container */}
                      <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 270 }}>
                          <div style={{ position: 'relative', width: '100%' }}>
                            <select
                              className="clean-select-box"
                              value=""
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) handleAssignAction(perm.id, val);
                              }}
                              style={{
                                width: '100%',
                                height: 38,
                                paddingLeft: 12,
                                paddingRight: 28,
                                borderRadius: 8,
                                border: isGranted ? '1.5px solid #a7f3d0' : '1px solid #cbd5e1',
                                background: isGranted ? '#f0fdf4' : '#ffffff',
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: isGranted ? '#065f46' : '#475569',
                                appearance: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="" disabled>
                                {targetType === 'WORKER'
                                  ? isWorkerInherited
                                    ? isMr ? '🛡️ भूमिकेकडून (Worker Role)' : '🛡️ Via Worker Role'
                                    : isWorkerDirect
                                      ? isMr ? '👤 थेट परवाना (Direct)' : '👤 Direct Permission'
                                      : isMr ? '⚪ दिलेली नाही (Not Assigned)' : '⚪ Not Assigned'
                                  : isGranted
                                    ? isMr
                                      ? `✓ ${currentRole?.display_name || currentRole?.name} ला दिली आहे`
                                      : `✓ Assigned to ${currentRole?.display_name || currentRole?.name}`
                                    : isMr
                                      ? '⚪ या भूमिकेस दिलेली नाही'
                                      : '⚪ Not Assigned to this Role'}
                              </option>

                              {/* Action Options */}
                              {targetType === 'ROLE' ? (
                                <>
                                  {isGranted ? (
                                    <option value="REMOVE_CURRENT_ROLE">
                                      {isMr ? '❌ या भूमिकेकडून काढा (Remove)' : '❌ Remove from this role'}
                                    </option>
                                  ) : (
                                    <option value="GIVE_CURRENT_ROLE">
                                      {isMr ? '➕ या भूमिकेस जोडा (Assign)' : '➕ Assign to this role'}
                                    </option>
                                  )}
                                  <optgroup label={isMr ? 'इतर भूमिकांना जोडा' : 'Assign to other roles'}>
                                    <option value="GIVE_WORKER_ROLE">👷 {isMr ? 'सर्व कार्यकर्ते' : 'All Field Workers'}</option>
                                    <option value="GIVE_OFFICER_ROLE">👔 {isMr ? 'नेता / अधिकारी' : 'Leader / Officer'}</option>
                                    <option value="GIVE_ADMIN_ROLE">👑 {isMr ? 'ॲडमिनिस्ट्रेटर' : 'Administrator'}</option>
                                  </optgroup>
                                </>
                              ) : (
                                <>
                                  {isWorkerDirect ? (
                                    <option value="REMOVE_CURRENT_ROLE">
                                      {isMr ? '❌ थेट परवाना काढा' : '❌ Remove direct permission'}
                                    </option>
                                  ) : !isGranted ? (
                                    <option value="GIVE_CURRENT_ROLE">
                                      {isMr ? '➕ या कार्यकर्त्यास थेट द्या' : '➕ Grant direct permission'}
                                    </option>
                                  ) : null}
                                </>
                              )}

                              <option value="CUSTOM_MODAL">
                                ➕ {isMr ? 'विशिष्ट कार्यकर्त्यास जोडा...' : 'Assign to particular worker...'}
                              </option>
                            </select>
                            <ChevronDown
                              size={14}
                              color={isGranted ? '#059669' : '#64748b'}
                              style={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                              }}
                            />
                          </div>

                          {/* Role Badges Indicating who has access */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            {hasWorker && (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: '#047857',
                                  background: '#ecfdf5',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  border: '1px solid #a7f3d0',
                                }}
                              >
                                {isMr ? '👷 कार्यकर्ते' : '👷 Workers'}
                              </span>
                            )}
                            {hasOfficer && (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: '#1d4ed8',
                                  background: '#eff6ff',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  border: '1px solid #bfdbfe',
                                }}
                              >
                                {isMr ? '👔 अधिकारी' : '👔 Officers'}
                              </span>
                            )}
                            {hasAdmin && (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: '#6d28d9',
                                  background: '#faf5ff',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  border: '1px solid #e9d5ff',
                                }}
                              >
                                {isMr ? '👑 ॲडमिन' : '👑 Admins'}
                              </span>
                            )}
                            {!hasWorker && !hasOfficer && !hasAdmin && (
                              <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
                                {isMr ? 'कोणीही नाही' : 'None'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Toggle Switch */}
                      <td style={{ padding: '14px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="clean-btn"
                            onClick={() => handleToggle(perm.id)}
                            style={{
                              width: 48,
                              height: 26,
                              borderRadius: 9999,
                              border: isGranted ? '1.5px solid #059669' : '1.5px solid #cbd5e1',
                              background: isGranted ? '#059669' : '#e2e8f0',
                              position: 'relative',
                              cursor: 'pointer',
                              outline: 'none',
                              padding: 0,
                              transition: 'background-color 0.2s ease, border-color 0.2s ease',
                            }}
                            title={
                              isGranted
                                ? isMr ? 'परवानगी बंद करा' : 'Click to disable'
                                : isMr ? 'परवानगी चालू करा' : 'Click to enable'
                            }
                          >
                            <span
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: '#ffffff',
                                position: 'absolute',
                                top: 1.5,
                                left: isGranted ? 24 : 2,
                                transition: 'left 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. QUICK ASSIGN MODAL                                          */}
      {/* ============================================================== */}
      {assignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '24px 22px',
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>➕</span>
                <strong style={{ fontSize: 16, color: '#0f172a' }}>
                  {isMr ? 'विशिष्ट कार्यकर्त्यास परवानगी द्या' : 'Assign Permission to Worker'}
                </strong>
              </div>
              <button
                type="button"
                className="clean-btn"
                onClick={() => setAssignModal(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
              {isMr
                ? `खालील कार्यकर्त्यास "${assignModal.permName}" ही परवानगी थेट दिली जाईल:`
                : `Grant permission "${assignModal.permName}" directly to the selected worker:`}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                {isMr ? 'कार्यकर्ता निवडा:' : 'Select Worker:'}
              </label>
              <select
                className="clean-select-box"
                value={assignTargetUserId}
                onChange={(e) => setAssignTargetUserId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {fieldWorkers.map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.full_name} (Field Worker · 📞 {u.phone || 'N/A'})
                  </option>
                ))}
                {otherUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.full_name} ({u.roles?.map((r) => r.name).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="clean-btn"
                onClick={() => setAssignModal(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                className="clean-btn"
                onClick={handleQuickAssignToWorker}
                disabled={isAssigning}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 750,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
                }}
              >
                {isAssigning ? '...' : (isMr ? '＋ परवानगी द्या' : '＋ Grant Permission')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
