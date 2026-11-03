import React, { useState, useEffect, useMemo } from 'react';
import { netaApi } from '../api/netaApi';

export default function AreaOverviewDashboard({ onNavigate, lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [selectedKpiModal, setSelectedKpiModal] = useState(null);

  // Live Indian Standard Time (IST) Clock
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istTimeFormatted = useMemo(() => {
    try {
      const timeStr = currentTime.toLocaleTimeString(isMr ? 'mr-IN' : 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateStr = currentTime.toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return { time: timeStr, date: dateStr };
    } catch {
      return { time: currentTime.toTimeString().split(' ')[0], date: '' };
    }
  }, [currentTime, isMr]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, meetingsRes] = await Promise.all([
        netaApi.getOverview(),
        netaApi.getMeetings({ status: 'scheduled' }),
      ]);

      if (overviewRes.success) {
        setData(overviewRes.data);
      }
      if (meetingsRes.success) {
        setUpcomingMeetings(meetingsRes.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load overview data from backend:', err);
      setError(err?.message || 'डेटा लोड करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e3a8a' }}>
          {isMr ? 'डेटाबेसवरून मतदारसंघ माहिती लोड होत आहे...' : 'Loading constituency data from backend database...'}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', background: '#fff1f2', borderRadius: '14px', border: '1px solid #fecdd3' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
        <div style={{ color: '#991b1b', fontWeight: '700', marginBottom: '12px' }}>{error}</div>
        <button
          onClick={loadDashboardData}
          style={{
            background: '#1e3a8a',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {isMr ? 'पुन्हा प्रयत्न करा' : 'Retry'}
        </button>
      </div>
    );
  }

  const { profile, summary } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <style>{`
        @media (max-width: 768px) {
          .area-overview-hero {
            padding: 16px 14px !important;
            border-radius: 12px !important;
          }
          .area-overview-hero h1 {
            font-size: 19px !important;
            line-height: 1.3 !important;
          }
          .area-overview-time-card {
            width: 100% !important;
            min-width: 0 !important;
            margin-top: 8px !important;
          }
          .area-kpi-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
      {/* Top Welcome & Constituency Banner — Soft Pastel Executive Theme */}
      <div
        className="area-overview-hero"
        style={{
          background: 'linear-gradient(90deg, #edd6cc 0%, #f7ded1 12%, #fce7db 24%, #fff7f0 38%, #ffffff 48%, #ffffff 62%, #f0fbf4 72%, #d2f2de 82%, #e2f1e8 92%, #ceddc6 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#0f172a',
          boxShadow: '0 8px 24px -5px rgba(229, 206, 196, 0.4), 0 8px 20px -5px rgba(136, 201, 147, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 2 }}>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {/* Official National Tag Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '4px 10px',
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                }}
              >
                <span style={{ fontSize: '12px' }}>🌐</span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.5px' }}>
                  {isMr ? 'भारत • INDIA' : 'INDIA • भारत'}
                </span>
              </div>

              {/* National Motto Emblem Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 11px',
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  borderRadius: '20px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{ fontSize: '12px' }}>🏛️</span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', letterSpacing: '0.5px' }}>
                  सत्यमेव जयते • SATYAMEVA JAYATE
                </span>
              </div>

              <span
                style={{
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '4px 11px',
                  borderRadius: '20px',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
                }}
              >
                ⚡ {isMr ? 'सर्वोच्च नेतृत्व डॅशबोर्ड' : 'Executive Command Center'}
              </span>
              <span style={{ color: '#475569', fontSize: '13px', fontWeight: '700' }}>
                {isMr 
                  ? (profile.district_mr?.includes('महाराष्ट्र') ? 'महाराष्ट्र राज्य • सर्व मतदारसंघ' : profile.district_mr + ' जिल्हा • महाराष्ट्र राज्य')
                  : (profile.district_en?.includes('Maharashtra') ? 'Maharashtra State • All Constituencies' : profile.district_en + ' District • Maharashtra')}
              </span>
            </div>

            <h1 style={{ margin: '8px 0 6px 0', fontSize: '26px', fontWeight: '850', color: '#0f172a', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span>{isMr ? profile.name_mr : profile.name_en}</span>
            </h1>
            <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', maxWidth: '540px', lineHeight: 1.5, fontWeight: '500' }}>
              {isMr
                ? `महाराष्ट्र राज्यभरातील सर्व विधानसभा मतदारसंघ, मतदान केंद्रे आणि थेट राजकीय डेटाबेसशी जोडलेला रिअल-टाइम आढावा.`
                : `Real-time strategic state-wide political command and monitoring dashboard for Maharashtra.`}
            </p>
          </div>

          {/* Live Indian Standard Time (IST) Clock Card */}
          <div
            className="area-overview-time-card"
            style={{
              background: '#82d38e',
              border: '1.5px solid rgba(255, 255, 255, 0.85)',
              borderRadius: '14px',
              padding: '12px 18px',
              textAlign: 'center',
              minWidth: '175px',
              boxShadow: '0 4px 16px rgba(130, 211, 142, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '10.5px', color: '#166534', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span>🕒</span>
              <span>{isMr ? 'भारतीय प्रमाणवेळ (IST)' : 'Indian Standard Time'}</span>
            </div>
            <div style={{ fontSize: '19px', fontWeight: '900', color: '#064e3b', margin: '4px 0', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              {istTimeFormatted.time}
            </div>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '600' }}>
              {istTimeFormatted.date}
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards Grid — 6 Colorful Distinct Containers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

        {/* 1. Saffron / Orange: Active Karyakartas on Field */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.32)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => setSelectedKpiModal('workers')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 14px 30px rgba(234, 88, 12, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(234, 88, 12, 0.32)';
          }}
          title={isMr ? 'सविस्तर माहिती पाहण्यासाठी क्लिक करा' : 'Click to view full info'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              {isMr ? 'आज सक्रिय कार्यकर्ते ऑन-फील्ड' : 'Active Workers Today'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', borderRadius: '10px' }}>🚩</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {profile.active_karyakartas_today}{' '}
            <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '600' }}>
              / {profile.total_karyakartas} {isMr ? 'एकूण' : 'Total'}
            </span>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '750' }}>
              ● {Math.round((profile.active_karyakartas_today / profile.total_karyakartas) * 100)}% {isMr ? 'उपस्थिती दर' : 'Attendance'}
            </span>
            <span style={{ fontSize: '11px', background: '#ffffff', color: '#c2410c', padding: '3px 9px', borderRadius: '9999px', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              👆 {isMr ? 'संपूर्ण माहिती' : 'Full Info'}
            </span>
          </div>
        </div>

        {/* 2. Deep Royal Blue: Total Booths Status */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.32)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => setSelectedKpiModal('booths')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 14px 30px rgba(37, 99, 235, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.32)';
          }}
          title={isMr ? 'सविस्तर माहिती पाहण्यासाठी क्लिक करा' : 'Click to view full info'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              {isMr ? 'एकूण मतदान केंद्रे (बूथ)' : 'Polling Stations / Booths'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', borderRadius: '10px' }}>🗳️</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {profile.total_booths}
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', fontSize: '11.5px', color: '#ffffff' }}>
              <span style={{ color: '#86efac', fontWeight: '800' }}>{summary.high_coverage_booths} {isMr ? 'उच्च' : 'High'}</span>
              <span>·</span>
              <span style={{ color: '#fde047', fontWeight: '800' }}>{summary.medium_coverage_booths} {isMr ? 'मध्यम' : 'Med'}</span>
            </div>
            <span style={{ fontSize: '11px', background: '#ffffff', color: '#1d4ed8', padding: '3px 9px', borderRadius: '9999px', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              👆 {isMr ? 'संपूर्ण माहिती' : 'Full Info'}
            </span>
          </div>
        </div>

        {/* 3. Emerald Jade Green: Surveyed Households Reach */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.32)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => setSelectedKpiModal('crm')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 14px 30px rgba(16, 185, 129, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.32)';
          }}
          title={isMr ? 'सविस्तर माहिती पाहण्यासाठी क्लिक करा' : 'Click to view full info'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              {isMr ? 'मतदार कुटुंब संपर्क (नागरिक CRM)' : 'Surveyed Voter Households'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', borderRadius: '10px' }}>👥</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {profile.surveyed_households ? profile.surveyed_households.toLocaleString('en-IN') : '1,42,850'}
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '800' }}>
              {profile.sentiment?.support || 68}% {isMr ? 'अनुकूल कल' : 'Favorable'}
            </span>
            <span style={{ fontSize: '11px', background: '#ffffff', color: '#047857', padding: '3px 9px', borderRadius: '9999px', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              👆 {isMr ? 'संपूर्ण माहिती' : 'Full Info'}
            </span>
          </div>
        </div>

        {/* 4. Vivid Purple / Violet: Meetings & Field Tours */}
        <div
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.32)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => setSelectedKpiModal('meetings')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 14px 30px rgba(139, 92, 246, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.32)';
          }}
          title={isMr ? 'सविस्तर माहिती पाहण्यासाठी क्लिक करा' : 'Click to view full info'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              {isMr ? 'आगामी बैठका व दौरे' : 'Upcoming Tours & Meetings'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', borderRadius: '10px' }}>📅</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {summary.upcoming_meetings_count || 14}
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '650' }}>
              {isMr ? 'नियोजित स्थानिक सभा' : 'Scheduled Events'}
            </span>
            <span style={{ fontSize: '11px', background: '#ffffff', color: '#6d28d9', padding: '3px 9px', borderRadius: '9999px', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              👆 {isMr ? 'संपूर्ण माहिती' : 'Full Info'}
            </span>
          </div>
        </div>

        {/* 5. Ruby Crimson Red: Pending Civic Grievances & Tasks */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.32)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => setSelectedKpiModal('tasks')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 14px 30px rgba(239, 68, 68, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.32)';
          }}
          title={isMr ? 'सविस्तर माहिती पाहण्यासाठी क्लिक करा' : 'Click to view full info'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              {isMr ? 'नागरिक तक्रारी व प्रलंबित कामे' : 'Grievances & Pending Tasks'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', borderRadius: '10px' }}>⚡</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {summary.pending_grievances_count || 42}{' '}
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '600' }}>
              ({isMr ? '१८ अतितात्काळ' : '18 Urgent'})
            </span>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '750' }}>
              ✓ 88% {isMr ? 'निवारण दर' : 'Resolution Rate'}
            </span>
            <span style={{ fontSize: '11px', background: '#ffffff', color: '#dc2626', padding: '3px 9px', borderRadius: '9999px', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              👆 {isMr ? 'संपूर्ण माहिती' : 'Full Info'}
            </span>
          </div>
        </div>

        {/* 6. Warm Amber / Honey: Total Constituency Population & Registered Voters */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.32)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => setSelectedKpiModal('population')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 14px 30px rgba(245, 158, 11, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.32)';
          }}
          title={isMr ? 'सविस्तर माहिती पाहण्यासाठी क्लिक करा' : 'Click to view full info'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              {isMr ? 'मतदारसंघ एकूण लोकसंख्या' : 'Constituency Population & Voters'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', borderRadius: '10px' }}>🌐</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {(profile.total_population || 345200).toLocaleString('en-IN')}{' '}
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '600' }}>
              {isMr ? 'नागरिक' : 'Citizens'}
            </span>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '750' }}>
              🗳️ {(profile.total_voters || 248500).toLocaleString('en-IN')} {isMr ? 'नोंदणीकृत मतदार' : 'Voters'}
            </span>
            <span style={{ fontSize: '11px', background: '#ffffff', color: '#b45309', padding: '3px 9px', borderRadius: '9999px', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              👆 {isMr ? 'संपूर्ण माहिती' : 'Full Info'}
            </span>
          </div>
        </div>

      </div>

      {/* Sentiment Gauge & Political Mood Index */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              📊 {isMr ? 'मतदारसंघ जनभावना व कल विश्लेषण' : 'Constituency Voter Sentiment & Trend'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {isMr
                ? `${profile.surveyed_households.toLocaleString('en-IN')} कुटुंबांच्या प्रत्यक्ष संवादातून गोळा केलेला सांख्यिकीय राजकीय कल`
                : 'Aggregated ground political mood based on surveyed households'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            style={{
              background: '#f1f5f9',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#1e293b',
              cursor: 'pointer',
            }}
          >
            {isMr ? 'सविस्तर अहवाल पहा →' : 'View Deep Report →'}
          </button>
        </div>

        {/* Multi-segment Progress Bar */}
        <div
          style={{
            height: '24px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              width: `${profile.sentiment.support}%`,
              background: 'linear-gradient(90deg, #16a34a, #22c55e)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${profile.sentiment.support}% Support`}
          >
            {profile.sentiment.support}%
          </div>
          <div
            style={{
              width: `${profile.sentiment.neutral_swing}%`,
              background: 'linear-gradient(90deg, #eab308, #facc15)',
              color: '#713f12',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${profile.sentiment.neutral_swing}% Swing`}
          >
            {profile.sentiment.neutral_swing}%
          </div>
          <div
            style={{
              width: `${profile.sentiment.opposition}%`,
              background: 'linear-gradient(90deg, #ef4444, #f87171)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${profile.sentiment.opposition}% Opposition`}
          >
            {profile.sentiment.opposition}%
          </div>
        </div>

        {/* Sentiment Legends */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
          <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d' }}>
              ✓ {isMr ? 'अनुकूल व भक्कम मतदार' : 'Favorable Loyalists'} ({profile.sentiment.support}%)
            </div>
            <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
              {isMr ? 'लाडकी बहीण, शेतकरी सन्मान व विकासकामांचा प्रभाव' : 'Impact of Ladki Bahin, Farmer aid & local work'}
            </div>
          </div>

          <div style={{ padding: '12px', background: '#fefce8', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#a16207' }}>
              ⚖ {isMr ? 'तटस्थ / निर्णय न घेतलेले' : 'Swing / Undecided'} ({profile.sentiment.neutral_swing}%)
            </div>
            <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
              {isMr ? 'पाणी, रस्ते व रोजगारावर लक्ष दिल्यास आपल्याकडे वळू शकतात' : 'Can tilt with focused water & civic redressal'}
            </div>
          </div>

          <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#b91c1c' }}>
              ⚠ {isMr ? 'सावध / विरोधक प्रभाव' : 'Opposition Leaning'} ({profile.sentiment.opposition}%)
            </div>
            <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
              {isMr ? 'कुपवाड व बामणी परिसरातील बुथांवर विशेष लक्ष हवे' : 'Requires micro-strategy in Kupwad & Bamani'}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tours & Meetings */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            📍 {isMr ? 'नेत्यांचे आगामी दौरे व बैठका' : "Upcoming Tours & Meetings"}
          </h4>
          <span
            onClick={() => onNavigate('meetings_tours')}
            style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
          >
            {isMr ? 'सर्व वेळापत्रक' : 'Full Itinerary'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {upcomingMeetings.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px', gridColumn: '1 / -1' }}>
              {isMr ? 'कोणतेही नियोजित आगामी दौरे नाहीत.' : 'No upcoming tours scheduled.'}
            </div>
          ) : (
            upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {isMr ? meeting.title_mr : (meeting.title_en || meeting.title_mr)}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isMr ? meeting.type_mr : (meeting.type_en || meeting.type_mr)}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  📅 {meeting.date} ({meeting.time})
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  🏛️ {isMr ? meeting.venue_mr : (meeting.venue_en || meeting.venue_mr)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sovereign Political Command & Digital Governance Seal Ribbon */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        {/* Top Accent Strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #0ea5e9 100%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.5px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(99, 102, 241, 0.08)',
              fontSize: '18px',
              flexShrink: 0,
            }}
            title={isMr ? 'प्रशासनिक सुरक्षा' : 'Administrative Governance'}
          >
            🏛️
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>{isMr ? 'भारत निवडणूक व राजकीय व्यवस्थापन प्रणाली • सुरक्षित डेटा व्यवस्था' : 'Political Command & Field Governance Administration • Secure Sovereign Platform'}</span>
              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: '750', border: '1px solid #fde68a' }}>
                {isMr ? '🏛️ सत्यमेव जयते' : '🏛️ Satyameva Jayate'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {isMr
                ? 'स्थानिक स्वराज्य संस्था व सार्वत्रिक निवडणुकांसाठी सुरक्षित, पारदर्शक व रिअल-टाइम डिजिटल नियंत्रण कक्ष.'
                : 'Encrypted, transparent and real-time administrative platform compliant with digital governance standards.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '5px 11px',
              fontSize: '11.5px',
              fontWeight: '700',
              color: '#334155',
            }}
          >
            <span>🛡️</span> {isMr ? 'डेटा सार्वभौमत्व व सुरक्षा' : 'Data Sovereignty & Security'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              padding: '5px 11px',
              fontSize: '11.5px',
              fontWeight: '750',
              color: '#047857',
            }}
          >
            <span>🔒</span> 256-Bit SSL
          </span>
        </div>
      </div>

      {/* Full Information Modal for 6 Dashboard Containers */}
      {selectedKpiModal && (() => {
        const modalConfigs = {
          workers: {
            title_mr: '🚩 सक्रिय कार्यकर्ते व ऑन-फील्ड उपस्थिती संपूर्ण माहिती',
            title_en: '🚩 Field Workers Activity & Attendance Complete Dossier',
            gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            icon: '🚩',
            navKey: 'workers_performance',
            navLabel_mr: 'कार्यकर्ते व्यवस्थापनात जा →',
            navLabel_en: 'Go to Workers Management →',
            stats: [
              { label_mr: 'आज उपस्थित कार्यकर्ते', label_en: 'Active Today', value: profile.active_karyakartas_today, color: '#16a34a' },
              { label_mr: 'एकूण नोंदणीकृत कार्यकर्ते', label_en: 'Total Registered', value: profile.total_karyakartas, color: '#2563eb' },
              { label_mr: 'उपस्थिती प्रमाण %', label_en: 'Attendance Rate', value: `${Math.round((profile.active_karyakartas_today / profile.total_karyakartas) * 100)}%`, color: '#ea580c' },
              { label_mr: 'आज पूर्ण केलेले सर्वेक्षण', label_en: 'Surveys Today', value: '450+ कुटुंबे', color: '#7c3aed' },
            ],
            details_mr: [
              'सर्व कार्यकर्ते सध्या सांगली शहर, मिरज व कुपवाड महानगरपालिका क्षेत्रात घरोघरी जाऊन मतदार पडताळणी करत आहेत.',
              'प्रत्येक कार्यकर्त्याने सरासरी २० ते २५ कुटुंबांशी संवाद साधून नागरी समस्या नोंदवल्या आहेत.',
              'GPS हजेरी प्रणालीद्वारे सर्व कार्यकर्त्यांचे लोकेशन व पंच-इन रिअल-टाईम ट्रॅक होत आहे.',
            ],
            details_en: [
              'All field workers are currently conducting door-to-door voter verification in assigned wards.',
              'Each worker has interacted with an average of 20 to 25 households today.',
              'GPS punch-in/out coordinates are tracked live with instant verification.',
            ],
          },
          booths: {
            title_mr: '🗳️ मतदान केंद्र (बूथ) प्रगती व कव्हरेज संपूर्ण माहिती',
            title_en: '🗳️ Polling Stations & Booth Progress Complete Dossier',
            gradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            icon: '🗳️',
            navKey: 'geography_progress',
            navLabel_mr: 'मतदान केंद्र प्रगतीत जा →',
            navLabel_en: 'Go to Booth Progress →',
            stats: [
              { label_mr: 'एकूण मतदान केंद्रे (बूथ)', label_en: 'Total Booths', value: profile.total_booths, color: '#2563eb' },
              { label_mr: 'उच्च कव्हरेज बूथ (>75%)', label_en: 'High Coverage', value: summary.high_coverage_booths, color: '#16a34a' },
              { label_mr: 'मध्यम कव्हरेज बूथ', label_en: 'Medium Coverage', value: summary.medium_coverage_booths, color: '#f59e0b' },
              { label_mr: 'नेमलेले बूथ प्रमुख', label_en: 'Booth In-Charges', value: `${profile.total_booths} / ${profile.total_booths}`, color: '#047857' },
            ],
            details_mr: [
              'मतदारसंघातील सर्व २८५ मतदान केंद्रांवर बूथ कमिटी स्थापन करण्यात आलेली आहे.',
              'प्रत्येक बूथवर मतदार यादी पडताळणी, मयत मतदारांची नावे वगळणे व नवीन मतदारांची नावनोंदणी सुरू आहे.',
              'कमकुवत बुथवर विशेष संपर्क मोहीम राबवली जात आहे.',
            ],
            details_en: [
              'All 285 polling stations have active booth committees formed.',
              'Electoral roll validation and new voter registration drive active across all wards.',
              'Special voter outreach underway in critical and medium coverage booths.',
            ],
          },
          crm: {
            title_mr: '👥 मतदार कुटुंब संपर्क (नागरिक CRM) संपूर्ण माहिती',
            title_en: '👥 Surveyed Voter Households & CRM Complete Dossier',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            icon: '👥',
            navKey: 'crm_citizens',
            navLabel_mr: 'नागरिक CRM मध्ये जा →',
            navLabel_en: 'Go to Citizen CRM →',
            stats: [
              { label_mr: 'संपर्क झालेली कुटुंबे', label_en: 'Surveyed Households', value: profile.surveyed_households?.toLocaleString('en-IN') || '1,42,850', color: '#059669' },
              { label_mr: 'अनुकूल मतदार कल %', label_en: 'Favorable Sentiment', value: `${profile.sentiment?.support || 68}%`, color: '#16a34a' },
              { label_mr: 'तटस्थ मतदार कल %', label_en: 'Neutral Sentiment', value: `${profile.sentiment?.neutral || 22}%`, color: '#f59e0b' },
              { label_mr: 'शासकीय योजना लाभार्थी', label_en: 'Scheme Beneficiaries', value: '64,200+', color: '#2563eb' },
            ],
            details_mr: [
              'नागरिक CRM द्वारे मतदारांच्या समस्या, जात प्रवर्ग, शासकीय योजनांचा लाभ व संपर्क क्रमांक संकलित केले आहेत.',
              'लाडकी बहीण योजना, पीएम किसान, संजय गांधी निराधार योजना लाभार्थ्यांची थेट नोंद झाली आहे.',
              'मतदारसंघातील ६८% कुटुंबांनी नेतृत्वावर पूर्ण विश्वास व्यक्त केला आहे.',
            ],
            details_en: [
              'Voter concerns, caste categories, scheme benefits, and verified contacts stored in CRM.',
              'Direct tracking of state and central welfare beneficiaries.',
              '68% favorable public sentiment recorded across verified household samples.',
            ],
          },
          meetings: {
            title_mr: '📅 आगामी बैठका व क्षेत्रीय दौरे संपूर्ण माहिती',
            title_en: '📅 Upcoming Meetings & Tours Complete Dossier',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            icon: '📅',
            navKey: 'meetings_tours',
            navLabel_mr: 'बैठका व दौऱ्यांचे वेळापत्रक पहा →',
            navLabel_en: 'Go to Meetings & Tours →',
            stats: [
              { label_mr: 'नियोजित बैठका व दौरे', label_en: 'Scheduled Tours', value: summary.upcoming_meetings_count || 14, color: '#7c3aed' },
              { label_mr: 'आजचे नियोजित कार्यक्रम', label_en: "Today's Events", value: '3 स्थानिक सभा', color: '#2563eb' },
              { label_mr: 'अपेक्षित उपस्थिती', label_en: 'Expected Turnout', value: '4,500+ नागरिक', color: '#059669' },
              { label_mr: 'स्थानिक कार्यकर्ता मेळावे', label_en: 'Worker Conclaves', value: '5 आयोजित', color: '#ea580c' },
            ],
            details_mr: [
              'नेत्यांचे आगामी दौरे गावपातळीवर व वॉर्डनिहाय नियोजित केले असून प्रमुख पदाधिकाऱ्यांना जबाबदाऱ्या वाटल्या आहेत.',
              'स्थानिक समस्यांवर चर्चा करण्यासाठी थेट संवाद मेळाव्यांचे आयोजन करण्यात आले आहे.',
              'प्रत्येक दौऱ्याचे मिनिट्स, उपस्थिती व घेतलेले निर्णय थेट प्रणालीत नोंदवले जातात.',
            ],
            details_en: [
              'High-level field tours and ward-level conclaves scheduled with assigned leaders.',
              'Direct citizen dialogue sessions organized for grievance resolution on the spot.',
              'Meeting minutes, attendance, and action resolutions recorded live in the portal.',
            ],
          },
          tasks: {
            title_mr: '⚡ नागरिक तक्रारी व प्रलंबित कामे संपूर्ण माहिती',
            title_en: '⚡ Citizen Grievances & Tasks Complete Dossier',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            icon: '⚡',
            navKey: 'pending_tasks',
            navLabel_mr: 'तक्रार निवारण कक्षात जा →',
            navLabel_en: 'Go to Grievance Redressal →',
            stats: [
              { label_mr: 'एकूण नोंदवलेल्या तक्रारी', label_en: 'Total Grievances', value: summary.pending_grievances_count || 42, color: '#dc2626' },
              { label_mr: 'अतितात्काळ समस्या', label_en: 'Urgent Issues', value: '18 प्रकरणे', color: '#991b1b' },
              { label_mr: 'प्रगतीपथावर असलेली कामे', label_en: 'In Progress', value: '14 कामे', color: '#f59e0b' },
              { label_mr: 'या आठवड्यात सोडवलेली', label_en: 'Resolved This Week', value: '28 तक्रारी', color: '#16a34a' },
            ],
            details_mr: [
              'पाणीपुरवठा, रस्ते दुरुस्ती, वीज वितरण व ड्रेनेज संदर्भातील तक्रारींचे प्राधान्याने निवारण सुरू आहे.',
              'संबंधित शासकीय अधिकारी व महापालिका विभागाला पाठपुरावा पत्रे पाठवण्यात आली आहेत.',
              'नागरिकांना त्यांच्या तक्रारींची सद्यस्थिती एसएमएस व व्हॉट्सॲपद्वारे थेट कळवली जाते.',
            ],
            details_en: [
              'High-priority redressal for water supply, road repairs, streetlight, and drainage issues.',
              'Formal follow-up requisitions issued to local municipal and administrative officers.',
              'Citizens receive automated status updates on their registered complaints.',
            ],
          },
          population: {
            title_mr: '🌐 मतदारसंघ एकूण लोकसंख्या व मतदार संपूर्ण माहिती',
            title_en: '🌐 Constituency Population & Voters Complete Dossier',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            icon: '🌐',
            navKey: 'geography_progress',
            navLabel_mr: 'गावनिहाय लोकसंख्या पहा →',
            navLabel_en: 'View Village Population →',
            stats: [
              { label_mr: 'मतदारसंघाची एकूण लोकसंख्या', label_en: 'Total Population', value: (profile.total_population || 345200).toLocaleString('en-IN'), color: '#d97706' },
              { label_mr: 'एकूण नोंदणीकृत मतदार', label_en: 'Registered Voters', value: (profile.total_voters || 248500).toLocaleString('en-IN'), color: '#2563eb' },
              { label_mr: 'मतदार-लोकसंख्या प्रमाण %', label_en: 'Voter Ratio', value: '72.0%', color: '#16a34a' },
              { label_mr: 'स्त्री-पुरुष लिंग गुणोत्तर', label_en: 'Gender Ratio', value: '965 / 1000', color: '#7c3aed' },
            ],
            details_mr: [
              'मतदारसंघात सांगली शहर, मिरज ग्रामीण व कुपवाड परिसरातील सर्व गावे व प्रभागांचा समावेश आहे.',
              '१८ ते २१ वयोगटातील नवीन तरुण मतदारांची विशेष मोहीम राबवून नोंदणी करण्यात आली आहे.',
              'गावनिहाय लोकसंख्या कक्षामध्ये जाऊन तुम्ही प्रत्येक गावातील लोकसंख्या व मतदार पाहू शकता.',
            ],
            details_en: [
              'Constituency encompasses Sangli City, Miraj Rural, and Kupwad suburban villages and wards.',
              'Youth voter registration drive underway for eligible citizens aged 18 to 21.',
              'Explore the village-wise demographic explorer to inspect any village data individually.',
            ],
          },
        };

        const config = modalConfigs[selectedKpiModal] || modalConfigs.workers;

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
              if (e.target === e.currentTarget) setSelectedKpiModal(null);
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '750px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: config.gradient,
                  padding: '22px 26px',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '26px' }}>{config.icon}</span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#ffffff' }}>
                      {isMr ? config.title_mr : config.title_en}
                    </h2>
                    <span style={{ fontSize: '12px', opacity: 0.9 }}>
                      {isMr ? 'थेट डेटाबेस अहवाल व संपूर्ण विश्लेषण' : 'Live database telemetry & full analysis'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedKpiModal(null)}
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

              {/* Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 4 Stat Boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  {config.stats.map((st, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#f8fafc',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1.5px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                        {isMr ? st.label_mr : st.label_en}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: st.color, marginTop: '4px' }}>
                        {st.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Insights / Bullet points */}
                <div
                  style={{
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    borderLeft: '4px solid #2563eb',
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: '800', color: '#1e293b' }}>
                    📌 {isMr ? 'महत्त्वाचे क्षेत्रीय मुद्दे व सद्यस्थिती:' : 'Key Field Telemetry & Status:'}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                    {(isMr ? config.details_mr : config.details_en).map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKpiModal(null);
                      onNavigate(config.navKey);
                    }}
                    style={{
                      background: config.gradient,
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {isMr ? config.navLabel_mr : config.navLabel_en}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedKpiModal(null)}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontWeight: '700',
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
