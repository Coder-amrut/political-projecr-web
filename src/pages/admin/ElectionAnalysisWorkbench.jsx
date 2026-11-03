import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Vote,
  BarChart3,
  Users,
  Building,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  TrendingUp,
  RefreshCw,
  Search,
  Award,
  ShieldCheck,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  FolderOpen,
  Database,
  ArrowLeft,
  Eye,
  Save
} from 'lucide-react';

// Comprehensive List of All Indian / Maharashtra Election Types
const ELECTION_TYPES = [
  { id: 'vidhan_sabha', label_mr: 'विधानसभा निवडणूक (Vidhan Sabha)', label_en: 'State Legislative Assembly (Vidhan Sabha)', icon: '🏛️', category: 'state' },
  { id: 'lok_sabha', label_mr: 'लोकसभा निवडणूक (Lok Sabha)', label_en: 'Parliamentary (Lok Sabha)', icon: '🇮🇳', category: 'national' },
  { id: 'vidhan_parishad', label_mr: 'विधानपरिषद निवडणूक (Vidhan Parishad)', label_en: 'Legislative Council (Vidhan Parishad)', icon: '🏛️', category: 'state' },
  { id: 'mahanagarpalika', label_mr: 'महानगरपालिका निवडणूक (Municipal Corporation)', label_en: 'Municipal Corporation (Mahanagarpalika)', icon: '🏢', category: 'urban' },
  { id: 'nagarpalika', label_mr: 'नगरपालिका / नगरपरिषद (Municipal Council)', label_en: 'Municipal Council (Nagar Parishad)', icon: '🏬', category: 'urban' },
  { id: 'nagar_panchayat', label_mr: 'नगरपंचायत निवडणूक (Nagar Panchayat)', label_en: 'Nagar Panchayat Election', icon: '🏘️', category: 'urban' },
  { id: 'zilla_parishad', label_mr: 'जिल्हा परिषद निवडणूक (Zilla Parishad)', label_en: 'Zilla Parishad (ZP)', icon: '🌾', category: 'rural' },
  { id: 'panchayat_samiti', label_mr: 'पंचायत समिती निवडणूक (Panchayat Samiti)', label_en: 'Panchayat Samiti', icon: '🚜', category: 'rural' },
  { id: 'gram_panchayat', label_mr: 'ग्रामपंचायत निवडणूक (Gram Panchayat)', label_en: 'Gram Panchayat (Village Body)', icon: '🏡', category: 'rural' },
  { id: 'bypoll', label_mr: 'पोटनिवडणूक (By-Election / Bypoll)', label_en: 'By-Election (Bypoll)', icon: '🔄', category: 'special' },
  { id: 'cooperative', label_mr: 'सहकारी संस्था / बँक / साखर कारखाना', label_en: 'Cooperative Society / Bank / Sugar Mill', icon: '🏦', category: 'coop' },
  { id: 'apmc', label_mr: 'कृषी उत्पन्न बाजार समिती (APMC)', label_en: 'APMC Market Committee', icon: '⚖️', category: 'coop' },
  { id: 'teachers_graduates', label_mr: 'शिक्षक व पदवीधर मतदारसंघ', label_en: 'Teacher & Graduate Constituency', icon: '🎓', category: 'special' },
  { id: 'custom', label_mr: 'इतर / सानुकूल निवडणूक (Custom Election)', label_en: 'Custom / Other Election', icon: '✏️', category: 'custom' },
];

// Major Political Parties in Maharashtra
const POPULAR_PARTIES = [
  { name: 'भारतीय जनता पक्ष (BJP)', color: '#ff6600', alliance: 'महायुती' },
  { name: 'भारतीय राष्ट्रीय काँग्रेस (INC)', color: '#0072b2', alliance: 'महाविकास आघाडी' },
  { name: 'राष्ट्रवादी काँग्रेस (NCP - अजित पवार गट)', color: '#d97706', alliance: 'महायुती' },
  { name: 'राष्ट्रवादी काँग्रेस (शरदचंद्र पवार गट)', color: '#059669', alliance: 'महाविकास आघाडी' },
  { name: 'शिवसेना (एकनाथ शिंदे गट)', color: '#ea580c', alliance: 'महायुती' },
  { name: 'शिवसेना (उद्धव बाळासाहेब ठाकरे)', color: '#b91c1c', alliance: 'महाविकास आघाडी' },
  { name: 'महाराष्ट्र नवनिर्माण सेना (MNS)', color: '#4f46e5', alliance: 'स्वबळ' },
  { name: 'वंचित बहुजन आघाडी (VBA)', color: '#2563eb', alliance: 'स्वबळ' },
  { name: 'अपक्ष (Independent)', color: '#64748b', alliance: 'अपक्ष' },
  { name: 'इतर पक्ष (Other Party)', color: '#84cc16', alliance: 'इतर' }
];

// Pre-filled Templates for instant exploration
const TEMPLATES = {
  sangli_assembly: {
    electionType: 'vidhan_sabha',
    customElectionName: '',
    name: 'महाराष्ट्र विधानसभा सार्वत्रिक निवडणूक २०२४',
    year: '2024',
    state: 'महाराष्ट्र',
    district: 'सांगली',
    taluka: 'मिरज',
    cityOrVillage: 'सांगली शहर व प्रभाग',
    constituency: '282 - सांगली विधानसभा मतदारसंघ',
    totalRegisteredVoters: '348500',
    votingPercentage: '64.8',
    previousElectionDate: '21 ऑक्टोबर 2019',
    previousResults: 'भाजप विजयी (सुधीर गाडगीळ - 93,659 मते, काँग्रेस पृथ्वीराज पाटील - 86,720 मते, मताधिक्य: 6,939)',
    additionalNotes: 'शहरी व उपनगरीय मतदारांचा प्रभाव, अंतर्गत व्यापारी वर्ग व बहुजन मतांची विभागणी निर्णायक ठरते.',
    assemblySegments: 'सांगली शहर, विश्रामबाग, कुपवाड, माधवनगर, सांगलीवाडी',
    boothCount: '342',
    parties: [
      {
        id: 'p1',
        name: 'भारतीय जनता पक्ष (BJP)',
        candidate: 'सुधीर गाडगीळ',
        alliance: 'महायुती',
        previousVotes: 93659,
        currentVotes: 98200,
        voteShare: 43.5,
        seatsWon: 1,
        strengths: 'मजबूत पक्ष संघटना, पारंपरिक व्यापारी व मध्यमवर्गीय मतपेढी, विकासकामांचा प्रचार',
        challenges: 'स्थानिक बंडखोरीचा संभाव्य धोका, वाढती महागाई व पायाभूत सुविधांबाबत नाराजी'
      },
      {
        id: 'p2',
        name: 'भारतीय राष्ट्रीय काँग्रेस (INC)',
        candidate: 'पृथ्वीराज पाटील',
        alliance: 'महाविकास आघाडी',
        previousVotes: 86720,
        currentVotes: 91400,
        voteShare: 40.5,
        seatsWon: 0,
        strengths: 'जुना काँग्रेस पारंपरिक मतदार वर्ग, अल्पसंख्याक व मागासवर्गीय मते, सतत ग्राउंडवर संपर्क',
        challenges: 'मित्रपक्षातील स्थानिक नेत्यांची छुपी बंडखोरी, निधी व प्रचाराची आक्रमकता कमी'
      },
      {
        id: 'p3',
        name: 'अपक्ष (Independent)',
        candidate: 'जयश्री पाटील / बंडखोर उमेदवार',
        alliance: 'अपक्ष / अपक्ष आघाडी',
        previousVotes: 12500,
        currentVotes: 24800,
        voteShare: 11.0,
        seatsWon: 0,
        strengths: 'स्थानिक सहकार क्षेत्रातील वैयक्तिक संपर्क, वसंतदादा घराण्याविषयी निष्ठावंत गट',
        challenges: 'पक्ष चिन्हाचा अभाव, मर्यादित प्रचार यंत्रणा'
      },
      {
        id: 'p4',
        name: 'वंचित बहुजन आघाडी (VBA)',
        candidate: 'प्रा. विकास कांबळे',
        alliance: 'स्वबळ',
        previousVotes: 8200,
        currentVotes: 9400,
        voteShare: 4.2,
        seatsWon: 0,
        strengths: 'दलित व वंचित घटकांमध्ये वैचारिक निष्ठा, स्पष्ट स्थानिक अजेंडा',
        challenges: 'कमी वित्तीय रसद, प्रमुख लढतीपासून मतदारांची परावृत्ती'
      }
    ],
    otherCandidates: [
      { name: 'सचिन पवार (बसपा)', votes: '1850', remarks: 'कौटुंबिक प्रभाव' },
      { name: 'नोटा (NOTA)', votes: '2150', remarks: 'नाराज मतदार' }
    ],
    politicalEquations: 'मराठा, जैन, लिंगायत, मुस्लिम व दलित मतांचे संतुलित समीकरण. सांगली व्यापारी वर्गाची भूमिका निर्णायक.',
    developmentIssues: [
      { issue: 'सांगली-मिरज जोड रस्ता व उड्डाणपूल', priority: 'High', impact: 'शहरी वाहतुकीवर मोठा प्रभाव' },
      { issue: 'कृष्णा नदी पूर संरक्षण भिंत व सांडपाणी व्यवस्था', priority: 'Critical', impact: 'नदीकाठच्या १० प्रभागांचा प्रमुख प्रश्न' },
      { issue: 'कुपवाड एमआयडीसी पायाभूत सुविधा व रोजगार', priority: 'Medium', impact: 'तरुणांच्या रोजगारावर परिणाम' }
    ],
    groundObservations: 'गेल्या निवडणुकीत केवळ ६,९३९ मतांचे अंतर असल्याने यंदा प्रत्येक वॉर्डातील २-३% मतविभागणी थेट निकाल ठरवू शकते.'
  }
};

export default function ElectionAnalysisWorkbench({ isMr = true, language = 'mr' }) {
  // ===================== STATE MANAGEMENT =====================
  const [selectedElectionType, setSelectedElectionType] = useState('vidhan_sabha');
  const [customElectionName, setCustomElectionName] = useState('');
  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'saved' | 'report'
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Database persistence state
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [savedSearchQuery, setSavedSearchQuery] = useState('');

  // Fetch all saved analyses from DB on mount
  const fetchSavedAnalyses = async () => {
    setIsLoadingSaved(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/election-analyses');
      if (res.ok) {
        const json = await res.json();
        setSavedAnalyses(json.data || []);
      }
    } catch (err) {
      console.warn('Failed to load saved election analyses from DB:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchSavedAnalyses();
  }, []);

  // Form Fields
  const [electionName, setElectionName] = useState(TEMPLATES.sangli_assembly.name);
  const [electionYear, setElectionYear] = useState(TEMPLATES.sangli_assembly.year);
  const [stateName, setStateName] = useState(TEMPLATES.sangli_assembly.state);
  const [districtName, setDistrictName] = useState(TEMPLATES.sangli_assembly.district);
  const [talukaName, setTalukaName] = useState(TEMPLATES.sangli_assembly.taluka);
  const [cityOrVillage, setCityOrVillage] = useState(TEMPLATES.sangli_assembly.cityOrVillage);
  const [constituency, setConstituency] = useState(TEMPLATES.sangli_assembly.constituency);
  const [totalRegisteredVoters, setTotalRegisteredVoters] = useState(TEMPLATES.sangli_assembly.totalRegisteredVoters);
  const [votingPercentage, setVotingPercentage] = useState(TEMPLATES.sangli_assembly.votingPercentage);
  const [previousElectionDate, setPreviousElectionDate] = useState(TEMPLATES.sangli_assembly.previousElectionDate);
  const [previousResults, setPreviousResults] = useState(TEMPLATES.sangli_assembly.previousResults);
  const [additionalNotes, setAdditionalNotes] = useState(TEMPLATES.sangli_assembly.additionalNotes);

  // Dynamic Type-Specific Fields
  const [assemblySegments, setAssemblySegments] = useState(TEMPLATES.sangli_assembly.assemblySegments);
  const [boothCount, setBoothCount] = useState(TEMPLATES.sangli_assembly.boothCount);
  const [zpGatName, setZpGatName] = useState('');
  const [wardReservation, setWardReservation] = useState('खुला प्रवर्ग (General)');

  // Parties & Candidates
  const [parties, setParties] = useState(TEMPLATES.sangli_assembly.parties);
  const [editingPartyId, setEditingPartyId] = useState(null);

  // Additional Data
  const [otherCandidates, setOtherCandidates] = useState(TEMPLATES.sangli_assembly.otherCandidates);
  const [politicalEquations, setPoliticalEquations] = useState(TEMPLATES.sangli_assembly.politicalEquations);
  const [developmentIssues, setDevelopmentIssues] = useState(TEMPLATES.sangli_assembly.developmentIssues);
  const [groundObservations, setGroundObservations] = useState(TEMPLATES.sangli_assembly.groundObservations);

  // Validation Errors
  const [validationErrors, setValidationErrors] = useState([]);

  // ===================== TEMPLATE LOADERS =====================
  const loadTemplate = (key) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setSelectedElectionType(t.electionType);
    setCustomElectionName(t.customElectionName);
    setElectionName(t.name);
    setElectionYear(t.year);
    setStateName(t.state);
    setDistrictName(t.district);
    setTalukaName(t.taluka);
    setCityOrVillage(t.cityOrVillage);
    setConstituency(t.constituency);
    setTotalRegisteredVoters(t.totalRegisteredVoters);
    setVotingPercentage(t.votingPercentage);
    setPreviousElectionDate(t.previousElectionDate);
    setPreviousResults(t.previousResults);
    setAdditionalNotes(t.additionalNotes);
    setAssemblySegments(t.assemblySegments);
    setBoothCount(t.boothCount);
    setParties(t.parties);
    setOtherCandidates(t.otherCandidates);
    setPoliticalEquations(t.politicalEquations);
    setDevelopmentIssues(t.developmentIssues);
    setGroundObservations(t.groundObservations);
    setValidationErrors([]);
  };

  const handleClearAll = () => {
    setSelectedElectionType('vidhan_sabha');
    setCustomElectionName('');
    setElectionName('');
    setElectionYear(new Date().getFullYear().toString());
    setStateName('महाराष्ट्र');
    setDistrictName('');
    setTalukaName('');
    setCityOrVillage('');
    setConstituency('');
    setTotalRegisteredVoters('');
    setVotingPercentage('');
    setPreviousElectionDate('');
    setPreviousResults('');
    setAdditionalNotes('');
    setAssemblySegments('');
    setBoothCount('');
    setParties([]);
    setOtherCandidates([]);
    setPoliticalEquations('');
    setDevelopmentIssues([]);
    setGroundObservations('');
    setValidationErrors([]);
    setActiveTab('input');
  };

  // ===================== CALCULATIONS & VALIDATION =====================
  const calculatedVotesPolled = useMemo(() => {
    const voters = parseFloat(totalRegisteredVoters) || 0;
    const pct = parseFloat(votingPercentage) || 0;
    if (voters > 0 && pct > 0) {
      return Math.round((voters * pct) / 100);
    }
    return 0;
  }, [totalRegisteredVoters, votingPercentage]);

  const totalPartyVotes = useMemo(() => {
    return parties.reduce((sum, p) => sum + (Number(p.currentVotes) || 0), 0);
  }, [parties]);

  // Auto-calculated vote shares for all parties
  const partiesWithComputedMetrics = useMemo(() => {
    const totalVotes = calculatedVotesPolled > 0 ? calculatedVotesPolled : totalPartyVotes;
    return parties.map((p) => {
      const votes = Number(p.currentVotes) || 0;
      const share = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : (p.voteShare || 0);
      const prevVotes = Number(p.previousVotes) || 0;
      const swing = prevVotes > 0 ? (votes - prevVotes) : 0;
      const swingPct = prevVotes > 0 ? (((votes - prevVotes) / prevVotes) * 100).toFixed(1) : 0;
      return {
        ...p,
        computedVoteShare: share,
        computedSwing: swing,
        computedSwingPct: swingPct,
      };
    }).sort((a, b) => (Number(b.currentVotes) || 0) - (Number(a.currentVotes) || 0));
  }, [parties, calculatedVotesPolled, totalPartyVotes]);

  const leaderParty = partiesWithComputedMetrics[0] || null;
  const runnerUpParty = partiesWithComputedMetrics[1] || null;
  const projectedMargin = leaderParty && runnerUpParty ? (leaderParty.currentVotes - runnerUpParty.currentVotes) : 0;

  // Add Party Form Handlers
  const handleAddParty = () => {
    const newId = `party_${Date.now()}`;
    const newParty = {
      id: newId,
      name: '',
      candidate: '',
      alliance: 'स्वबळ',
      previousVotes: 0,
      currentVotes: 0,
      voteShare: 0,
      seatsWon: 0,
      strengths: '',
      challenges: ''
    };
    setParties([...parties, newParty]);
    setEditingPartyId(newId);
  };

  const handleUpdateParty = (id, field, value) => {
    setParties(parties.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleRemoveParty = (id) => {
    setParties(parties.filter((p) => p.id !== id));
    if (editingPartyId === id) setEditingPartyId(null);
  };

  // Add Development Issue
  const handleAddIssue = () => {
    setDevelopmentIssues([...developmentIssues, { issue: '', priority: 'Medium', impact: '' }]);
  };

  const handleUpdateIssue = (idx, field, value) => {
    const updated = [...developmentIssues];
    updated[idx][field] = value;
    setDevelopmentIssues(updated);
  };

  const handleRemoveIssue = (idx) => {
    setDevelopmentIssues(developmentIssues.filter((_, i) => i !== idx));
  };

  // Load Saved Analysis Record into Form / View
  const handleLoadSavedAnalysis = (item, openReport = true) => {
    setSelectedElectionType(item.election_type || 'vidhan_sabha');
    setCustomElectionName(item.custom_election_name || '');
    setElectionName(item.election_name || '');
    setElectionYear(item.election_year || '');
    setStateName(item.state || 'महाराष्ट्र');
    setDistrictName(item.district || '');
    setTalukaName(item.taluka || '');
    setCityOrVillage(item.city_or_village || '');
    setConstituency(item.constituency || '');
    setTotalRegisteredVoters(item.total_registered_voters ? item.total_registered_voters.toString() : '');
    setVotingPercentage(item.voting_percentage ? item.voting_percentage.toString() : '');
    setPreviousElectionDate(item.previous_election_date || '');
    setPreviousResults(item.previous_results || '');
    setAdditionalNotes(item.additional_notes || '');
    setAssemblySegments(item.assembly_segments || '');
    setBoothCount(item.booth_count || '');
    setZpGatName(item.zp_gat_name || '');
    setWardReservation(item.ward_reservation || 'खुला प्रवर्ग (General)');
    setParties(Array.isArray(item.parties) ? item.parties : []);
    setOtherCandidates(Array.isArray(item.other_candidates) ? item.other_candidates : []);
    setPoliticalEquations(item.political_equations || '');
    setDevelopmentIssues(Array.isArray(item.development_issues) ? item.development_issues : []);
    setGroundObservations(item.ground_observations || item.groundObservations || '');

    if (openReport) {
      setActiveTab('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('input');
    }
  };

  // Delete Saved Analysis from Database
  const handleDeleteSavedAnalysis = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(isMr ? 'तुम्हाला हा निवडणूक विश्लेषण अहवाल डेटाबेसमधून नक्की हटवायचा आहे का?' : 'Are you sure you want to delete this analysis record from database?')) {
      return;
    }
    try {
      await fetch(`http://127.0.0.1:8000/api/election-analyses/${id}`, { method: 'DELETE' });
      fetchSavedAnalyses();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Save to Database and Generate Analysis Report
  const handleSaveAndGenerateAnalysis = async () => {
    const errors = [];
    if (!electionName.trim()) errors.push(isMr ? 'निवडणुकीचे नाव प्रविष्ट करा.' : 'Election Name is required.');
    if (!districtName.trim()) errors.push(isMr ? 'जिल्ह्याचे नाव प्रविष्ट करा.' : 'District is required.');
    if (parties.length < 2) errors.push(isMr ? 'तौलनिक विश्लेषणासाठी किमान २ पक्ष/उमेदवार जोडा.' : 'Please add at least 2 parties/candidates.');
    if (calculatedVotesPolled > 0 && totalPartyVotes > (calculatedVotesPolled * 1.15)) {
      errors.push(isMr ? 'सर्व पक्षांची एकूण मते ही एकूण झालेल्या मतदानापेक्षा जास्त असू शकत नाहीत.' : 'Total party votes exceed total votes polled.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);
    setIsSaving(true);

    const payload = {
      election_name: electionName,
      election_type: selectedElectionType,
      custom_election_name: customElectionName,
      election_year: electionYear,
      state: stateName,
      district: districtName,
      taluka: talukaName,
      city_or_village: cityOrVillage,
      constituency: constituency,
      total_registered_voters: Number(totalRegisteredVoters) || 0,
      voting_percentage: parseFloat(votingPercentage) || 0,
      calculated_votes_polled: calculatedVotesPolled,
      previous_election_date: previousElectionDate,
      previous_results: previousResults,
      additional_notes: additionalNotes,
      assembly_segments: assemblySegments,
      booth_count: boothCount,
      zp_gat_name: zpGatName,
      ward_reservation: wardReservation,
      parties: parties,
      other_candidates: otherCandidates,
      political_equations: politicalEquations,
      development_issues: developmentIssues,
      ground_observations: groundObservations,
      swot_analysis: {
        strengths: parties.map(p => `${p.name}: ${p.strengths || ''}`),
        challenges: parties.map(p => `${p.name}: ${p.challenges || ''}`),
      },
      status: 'completed'
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/election-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaveSuccessMsg(isMr ? '✅ निवडणूक विश्लेषण यशस्वीरीत्या डेटाबेसमध्ये सेव्ह झाले!' : '✅ Election analysis saved to database successfully!');
        setTimeout(() => setSaveSuccessMsg(''), 4500);
        fetchSavedAnalyses();
      }
    } catch (err) {
      console.warn('API save error:', err);
    } finally {
      setIsSaving(false);
      setActiveTab('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Copy Summary Report Text
  const handleCopySummary = () => {
    const text = `
=== ${electionName} (${electionYear}) निवडणूक विश्लेषण अहवाल ===
मतदारसंघ: ${constituency || cityOrVillage || districtName} (${districtName})
एकूण नोंदणीकृत मतदार: ${Number(totalRegisteredVoters).toLocaleString('en-IN') || '-'}
मतदान टक्केवारी: ${votingPercentage}% (एकूण मतदान: ${calculatedVotesPolled.toLocaleString('en-IN')})

प्रमुख निकाल / कल अंदाज:
१. आघाडीवर: ${leaderParty?.candidate || '-'} [${leaderParty?.name || '-'}] - ${Number(leaderParty?.currentVotes).toLocaleString('en-IN')} मते (${leaderParty?.computedVoteShare}%)
२. दुसऱ्या क्रमांकावर: ${runnerUpParty?.candidate || '-'} [${runnerUpParty?.name || '-'}] - ${Number(runnerUpParty?.currentVotes).toLocaleString('en-IN')} मते (${runnerUpParty?.computedVoteShare}%)
मताधिक्य (Margin): ${projectedMargin.toLocaleString('en-IN')} मते

स्थानिक राजकीय समीकरणे:
${politicalEquations || 'नोंद नाही'}

ग्राउंड निरीक्षण:
${groundObservations || 'नोंद नाही'}
(अधिकृत पडताळणी डेटा - नेता व प्रशासक पोर्टल)
    `;
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div style={{ padding: '20px 24px 80px', maxWidth: '1350px', margin: '0 auto', fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}>
      {/* ================= HEADER BAR ================= */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.25)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}>
            🗳️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '850', letterSpacing: '-0.4px' }}>
                {isMr ? 'निवडणूक विश्लेषण व राजकीय अहवाल कक्ष' : 'Election Analysis & Political Intelligence Desk'}
              </h1>
              <span style={{ background: '#10b981', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '850' }}>
                INTELLIGENCE HQ
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.88 }}>
              {isMr ? 'सर्व प्रकारच्या निवडणुकांची सविस्तर माहिती, पक्षीय तुलना व डेटा-आधारित विश्लेषणात्मक अहवाल तयार करा.' : 'Comprehensive dynamic election data, party comparison, vote share analysis, and scenario reporting.'}
            </p>
          </div>
        </div>

        {/* Action Button Strip */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('saved');
              fetchSavedAnalyses();
            }}
            style={{
              background: activeTab === 'saved' ? '#10b981' : 'rgba(255, 255, 255, 0.22)',
              border: '1.5px solid rgba(255, 255, 255, 0.45)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            title="डेटाबेसमधील विश्लेषण केलेले सर्व अहवाल पहा"
          >
            <FolderOpen size={15} />
            <span>{isMr ? 'विश्लेषण केलेले अहवाल पहा' : 'View Analyzed Reports'}</span>
            <span style={{
              background: '#ffffff',
              color: '#1e3a8a',
              padding: '1px 7px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '900'
            }}>
              {savedAnalyses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadTemplate('sangli_assembly');
              setActiveTab('input');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '750',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="सांगली विधानसभा निवडणूक २०२४ चे सॅम्पल लोड करा"
          >
            <span>⚡</span>
            <span>{isMr ? 'सांगली नमुना लोड करा' : 'Load Sangli Sample'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fee2e2',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '750',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} />
            <span>{isMr ? 'सर्व साफ करा' : 'Clear Form'}</span>
          </button>
        </div>
      </div>

      {/* ================= SUCCESS BANNER ================= */}
      {saveSuccessMsg && (
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '18px',
          color: '#166534',
          fontWeight: '800',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle2 size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ================= SUB-NAVIGATION TABS ================= */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('input')}
          style={{
            background: activeTab === 'input' ? '#2563eb' : '#f8fafc',
            color: activeTab === 'input' ? '#ffffff' : '#475569',
            border: activeTab === 'input' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
            padding: '10px 22px',
            borderRadius: '10px 10px 0 0',
            fontWeight: '800',
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'input' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={16} />
          <span>१. {isMr ? 'निवडणूक व पक्ष डेटा नोंद फॉर्म' : '1. Election Data Entry Form'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('saved');
            fetchSavedAnalyses();
          }}
          style={{
            background: activeTab === 'saved' ? '#0f766e' : '#f8fafc',
            color: activeTab === 'saved' ? '#ffffff' : '#0f766e',
            border: activeTab === 'saved' ? '1px solid #0f766e' : '1px solid #cbd5e1',
            padding: '10px 22px',
            borderRadius: '10px 10px 0 0',
            fontWeight: '800',
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'saved' ? '0 4px 12px rgba(15, 118, 110, 0.3)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <FolderOpen size={16} />
          <span>{isMr ? '📑 विश्लेषण केलेले अहवाल पहा' : '📑 View Analyzed Reports'}</span>
          <span style={{
            background: activeTab === 'saved' ? '#ffffff' : '#0f766e',
            color: activeTab === 'saved' ? '#0f766e' : '#ffffff',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: '900'
          }}>
            {savedAnalyses.length}
          </span>
        </button>

        {activeTab === 'report' && (
          <div style={{
            background: '#10b981',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '10px 10px 0 0',
            fontWeight: '800',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <BarChart3 size={16} />
            <span>📊 {isMr ? 'सक्रिय विश्लेषण अहवाल (Viewing Analysis Report)' : 'Active Analysis Report'}</span>
          </div>
        )}
      </div>

      {/* Validation Alert */}
      {validationErrors.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '14px 18px', marginBottom: '18px', color: '#991b1b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '14px', marginBottom: '6px' }}>
            <AlertTriangle size={18} />
            <span>{isMr ? 'कृपया खालील त्रुटी तपासा:' : 'Please address the following inputs:'}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '22px', fontSize: '13px', lineHeight: '1.5' }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ================= TAB 1: INPUT FORM ================= */}
      {activeTab === 'input' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. Election Type Grid */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏛️</span>
                  <span>{isMr ? 'निवडणूक प्रकार निवडा (Select Election Type)' : 'Select Election Type'}</span>
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  {isMr ? 'भारतातील व महाराष्ट्रातील सर्व प्रकारच्या निवडणुका खाली उपलब्ध आहेत:' : 'All democratic bodies from Parliament to Gram Panchayat:'}
                </p>
              </div>
              <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '12px', fontWeight: '800' }}>
                {ELECTION_TYPES.length} {isMr ? 'निवडणूक पर्याय' : 'Types Available'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {ELECTION_TYPES.map((etype) => {
                const isSelected = selectedElectionType === etype.id;
                return (
                  <div
                    key={etype.id}
                    onClick={() => setSelectedElectionType(etype.id)}
                    style={{
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.16)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>{etype.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: isSelected ? '850' : '700', color: isSelected ? '#1e40af' : '#1e293b' }}>
                        {isMr ? etype.label_mr : etype.label_en}
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Election Option */}
            {selectedElectionType === 'custom' && (
              <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #2563eb' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px' }}>
                  ✏️ {isMr ? 'सानुकूल निवडणुकीचे नाव प्रविष्ट करा:' : 'Enter Custom Election Body Name:'}
                </label>
                <input
                  type="text"
                  placeholder={isMr ? 'उदा. सांगली जिल्हा मध्यवर्ती बँक निवडणूक २०२४' : 'e.g. Sangli District Central Bank Election'}
                  value={customElectionName}
                  onChange={(e) => setCustomElectionName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #93c5fd', fontSize: '13px', fontWeight: '600', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </div>

          {/* 2. Dynamic Election Details Form */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '850', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📝</span>
              <span>{isMr ? 'निवडणुकीचा सविस्तर तपशील (Election Demographics & Geography)' : 'Election Demographics & Geography'}</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'निवडणुकीचे नाव' : 'Election Title'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={electionName}
                  onChange={(e) => setElectionName(e.target.value)}
                  placeholder={isMr ? 'उदा. महाराष्ट्र विधानसभा निवडणूक' : 'e.g. Maharashtra Assembly Election'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'निवडणूक वर्ष' : 'Election Year'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={electionYear}
                  onChange={(e) => setElectionYear(e.target.value)}
                  placeholder="2024"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'राज्य' : 'State'}
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'जिल्हा' : 'District'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder="सांगली"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'तालुका' : 'Taluka'}
                </label>
                <input
                  type="text"
                  value={talukaName}
                  onChange={(e) => setTalukaName(e.target.value)}
                  placeholder="मिरज"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'मतदारसंघ / प्रभाग नाव व क्र.' : 'Constituency / Ward Name & No.'}
                </label>
                <input
                  type="text"
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  placeholder="282 - सांगली विधानसभा"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'गाव / शहर / परिसर' : 'Village / City / Area'}
                </label>
                <input
                  type="text"
                  value={cityOrVillage}
                  onChange={(e) => setCityOrVillage(e.target.value)}
                  placeholder="सांगली शहर"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'एकूण नोंदणीकृत मतदार' : 'Total Registered Voters'}
                </label>
                <input
                  type="number"
                  value={totalRegisteredVoters}
                  onChange={(e) => setTotalRegisteredVoters(e.target.value)}
                  placeholder="348500"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'मतदानाची टक्केवारी (%)' : 'Voting Percentage (%)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={votingPercentage}
                  onChange={(e) => setVotingPercentage(e.target.value)}
                  placeholder="64.8"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Live Calculation Strip */}
            {calculatedVotesPolled > 0 && (
              <div style={{ marginTop: '14px', padding: '10px 14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#1e40af' }}>
                <span>🗳️ {isMr ? 'एकूण झालेले मतदान (Calculated Votes Polled):' : 'Total Polled Votes:'} <strong>{calculatedVotesPolled.toLocaleString('en-IN')}</strong> मते</span>
                <span style={{ fontSize: '11px', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>ऑटो-कॅल्क्युलेटेड</span>
              </div>
            )}

            {/* Dynamic Type-Specific Fields */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '13px', fontWeight: '850', color: '#1e3a8a', marginBottom: '10px' }}>
                ⚡ {isMr ? 'निवडणूक प्रकारानुसार विशिष्ट माहिती:' : 'Type-Specific Details:'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {selectedElectionType === 'vidhan_sabha' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>
                        {isMr ? 'एकूण मतदान केंद्र (Booths)' : 'Total Polling Booths'}
                      </label>
                      <input
                        type="text"
                        value={boothCount}
                        onChange={(e) => setBoothCount(e.target.value)}
                        placeholder="342 बूथ"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>
                        {isMr ? 'समाविष्ट प्रमुख परिसर / प्रभाग' : 'Constituency Segments'}
                      </label>
                      <input
                        type="text"
                        value={assemblySegments}
                        onChange={(e) => setAssemblySegments(e.target.value)}
                        placeholder="सांगली, कुपवाड, विश्रामबाग"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </>
                )}

                {selectedElectionType === 'lok_sabha' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>
                      {isMr ? 'समाविष्ट विधानसभा मतदारसंघ (६ विधानसभा)' : 'Assembly Segments (6 Assemblies)'}
                    </label>
                    <input
                      type="text"
                      value={assemblySegments}
                      onChange={(e) => setAssemblySegments(e.target.value)}
                      placeholder="मिरज, सांगली, इस्लामपूर, शिराळा, तासगाव, खानापूर"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                )}

                {(selectedElectionType === 'zilla_parishad' || selectedElectionType === 'panchayat_samiti') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>
                      {isMr ? 'जिल्हा परिषद गट / पंचायत समिती गण' : 'ZP Gat / PS Gan Name'}
                    </label>
                    <input
                      type="text"
                      value={zpGatName}
                      onChange={(e) => setZpGatName(e.target.value)}
                      placeholder="उदा. बुधगाव गट / माधवनगर गण"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                )}

                {selectedElectionType === 'gram_panchayat' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>
                      {isMr ? 'वॉर्ड व आरक्षण प्रवर्ग' : 'Ward & Reservation Category'}
                    </label>
                    <input
                      type="text"
                      value={wardReservation}
                      onChange={(e) => setWardReservation(e.target.value)}
                      placeholder="वॉर्ड क्र. ३ - नागरिकांचा मागास प्रवर्ग"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Previous Election Results & Date */}
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'मागील निवडणुकीची तारीख' : 'Previous Election Date'}
                </label>
                <input
                  type="text"
                  value={previousElectionDate}
                  onChange={(e) => setPreviousElectionDate(e.target.value)}
                  placeholder="21 ऑक्टोबर 2019"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'मागील निकाल व मताधिक्य' : 'Previous Election Result & Margin'}
                </label>
                <input
                  type="text"
                  value={previousResults}
                  onChange={(e) => setPreviousResults(e.target.value)}
                  placeholder="उदा. भाजप विजयी (मताधिक्य ६,९३९)"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* 3. Add Multiple Political Parties */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚩</span>
                  <span>{isMr ? 'राजकीय पक्ष व उमेदवार यादी (Political Parties & Candidates)' : 'Political Parties & Candidates'}</span>
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  {isMr ? 'रिंगणातील सर्व पक्षांची नावे, उमेदवार, मागील व सध्याची मते आणि ताकद/आव्हाने नोंदवा:' : 'Record parties, candidates, vote share, and alliance data:'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddParty}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                <Plus size={16} />
                <span>{isMr ? 'नवीन पक्ष जोडा (Add Party)' : 'Add Party'}</span>
              </button>
            </div>

            {/* Parties List */}
            {parties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #cbd5e1' }}>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px' }}>
                  {isMr ? 'अद्याप कोणताही राजकीय पक्ष जोडलेला नाही.' : 'No political parties added yet.'}
                </p>
                <button
                  type="button"
                  onClick={handleAddParty}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '750', fontSize: '13px', cursor: 'pointer' }}
                >
                  + {isMr ? 'पहिला पक्ष जोडा' : 'Add First Party'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {parties.map((party, index) => {
                  return (
                    <div
                      key={party.id}
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                            {index + 1}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: '850', color: '#0f172a' }}>
                            {party.name || (isMr ? 'नवीन पक्ष नोंद' : 'Party Entry')}
                          </span>
                          {party.alliance && (
                            <span style={{ fontSize: '10.5px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '6px', fontWeight: '750' }}>
                              {party.alliance}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveParty(party.id)}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="हा पक्ष काढून टाका"
                        >
                          <Trash2 size={13} />
                          <span>{isMr ? 'काढा' : 'Remove'}</span>
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', marginBottom: '3px' }}>
                            {isMr ? 'पक्षाचे नाव (Party Name)' : 'Party Name'}
                          </label>
                          <input
                            type="text"
                            value={party.name}
                            onChange={(e) => handleUpdateParty(party.id, 'name', e.target.value)}
                            placeholder={isMr ? 'उदा. भाजप / काँग्रेस' : 'e.g. BJP / Congress'}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', marginBottom: '3px' }}>
                            {isMr ? 'उमेदवाराचे नाव (Candidate Name)' : 'Candidate Name'}
                          </label>
                          <input
                            type="text"
                            value={party.candidate}
                            onChange={(e) => handleUpdateParty(party.id, 'candidate', e.target.value)}
                            placeholder={isMr ? 'उमेदवाराचे नाव' : 'Candidate Name'}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', marginBottom: '3px' }}>
                            {isMr ? 'आघाडी / युती (Alliance)' : 'Alliance'}
                          </label>
                          <select
                            value={party.alliance}
                            onChange={(e) => handleUpdateParty(party.id, 'alliance', e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box', background: '#fff' }}
                          >
                            <option value="महायुती">महायुती (Mahayuti)</option>
                            <option value="महाविकास आघाडी">महाविकास आघाडी (MVA)</option>
                            <option value="तिसरी आघाडी">तिसरी आघाडी (Third Front)</option>
                            <option value="स्थानिक आघाडी">स्थानिक आघाडी (Local Alliance)</option>
                            <option value="स्वबळ">स्वबळ (Independent / Solo)</option>
                            <option value="अपक्ष">अपक्ष (Independent)</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', marginBottom: '3px' }}>
                            {isMr ? 'मागील मते (Previous Votes)' : 'Previous Votes'}
                          </label>
                          <input
                            type="number"
                            value={party.previousVotes}
                            onChange={(e) => handleUpdateParty(party.id, 'previousVotes', Number(e.target.value))}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', marginBottom: '3px' }}>
                            {isMr ? 'सध्याची मते / अंदाज (Current Votes)' : 'Current Votes'}
                          </label>
                          <input
                            type="number"
                            value={party.currentVotes}
                            onChange={(e) => handleUpdateParty(party.id, 'currentVotes', Number(e.target.value))}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', marginBottom: '3px' }}>
                            {isMr ? 'जागा जिंकल्या (Seats Won - if any)' : 'Seats Won'}
                          </label>
                          <input
                            type="number"
                            value={party.seatsWon}
                            onChange={(e) => handleUpdateParty(party.id, 'seatsWon', Number(e.target.value))}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Strengths & Challenges */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#166534', marginBottom: '3px' }}>
                            ✓ {isMr ? 'पक्षाची ताकद (Strengths)' : 'Strengths'}
                          </label>
                          <input
                            type="text"
                            value={party.strengths}
                            onChange={(e) => handleUpdateParty(party.id, 'strengths', e.target.value)}
                            placeholder={isMr ? 'उदा. मजबूत संघटन, पारंपरिक मते' : 'Key strengths'}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '12px', boxSizing: 'border-box', background: '#f0fdf4' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#991b1b', marginBottom: '3px' }}>
                            ⚠️ {isMr ? 'आव्हाने व अडचणी (Challenges)' : 'Challenges'}
                          </label>
                          <input
                            type="text"
                            value={party.challenges}
                            onChange={(e) => handleUpdateParty(party.id, 'challenges', e.target.value)}
                            placeholder={isMr ? 'उदा. बंडखोरी, मतविभागणी' : 'Key challenges'}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '12px', boxSizing: 'border-box', background: '#fef2f2' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Local Issues & Ground Observations */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '850', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔍</span>
              <span>{isMr ? 'स्थानिक राजकीय समीकरणे व विकासाचे प्रश्न' : 'Local Political Dynamics & Civic Issues'}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'स्थानिक राजकीय व जातीय समीकरणे (Social & Political Dynamics)' : 'Political Dynamics & Equations'}
                </label>
                <textarea
                  rows="3"
                  value={politicalEquations}
                  onChange={(e) => setPoliticalEquations(e.target.value)}
                  placeholder={isMr ? 'उदा. मराठा, लिंगायत, मुस्लिम व व्यापारी घटकांची मते या मतदारसंघात निर्णायक ठरतात.' : 'Describe caste, demographic and regional equations...'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Development Issues Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                    {isMr ? 'प्रमुख विकासकामे व जनतेचे प्रश्न (Key Civic & Development Issues):' : 'Key Civic Issues:'}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIssue}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    + {isMr ? 'प्रश्न जोडा' : 'Add Issue'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {developmentIssues.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={item.issue}
                        onChange={(e) => handleUpdateIssue(idx, 'issue', e.target.value)}
                        placeholder={isMr ? 'उदा. पाणीपुरवठा, पूर संरक्षण' : 'Issue Name'}
                        style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                      <select
                        value={item.priority}
                        onChange={(e) => handleUpdateIssue(idx, 'priority', e.target.value)}
                        style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                      >
                        <option value="Critical">Critical (अति-तातडीचे)</option>
                        <option value="High">High (महत्त्वाचे)</option>
                        <option value="Medium">Medium (मध्यम)</option>
                        <option value="Low">Low (कमी)</option>
                      </select>
                      <input
                        type="text"
                        value={item.impact}
                        onChange={(e) => handleUpdateIssue(idx, 'impact', e.target.value)}
                        placeholder={isMr ? 'संभाव्य राजकीय प्रभाव' : 'Electoral Impact'}
                        style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveIssue(idx)}
                        style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                  {isMr ? 'अतिरिक्त ग्राउंड निरीक्षणे व रणनीतिक शेरे (Ground Intelligence Notes)' : 'Ground Intelligence Observations'}
                </label>
                <textarea
                  rows="2"
                  value={groundObservations}
                  onChange={(e) => setGroundObservations(e.target.value)}
                  placeholder={isMr ? 'उदा. मतदारांमध्ये स्थानिक चेहऱ्याबाबत अनुकूलता असून बंडखोरी रोखल्यास आघाडीवर राहू शकतात.' : 'Add final strategic observations...'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>

          {/* 5. Big Action Button: Save to DB & Generate Analysis */}
          <div style={{ textAlign: 'center', marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAndGenerateAnalysis}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: '900',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                transition: 'transform 0.15s ease',
                opacity: isSaving ? 0.75 : 1
              }}
              onMouseOver={(e) => { if (!isSaving) e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseOut={(e) => { if (!isSaving) e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
              <span>
                {isSaving
                  ? (isMr ? 'डेटाबेसमध्ये सेव्ह होत आहे...' : 'Saving to Database...')
                  : (isMr ? '💾 डेटाबेसमध्ये जतन करा व विश्लेषण अहवाल पहा' : '💾 Save to DB & View Analysis Report')}
              </span>
            </button>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              {isMr ? 'सर्व पक्ष, मतदार व राजकीय समीकरणे MySQL डेटाबेसमध्ये सुरक्षित जतन होतात.' : 'All data, parties, and political metrics will be stored permanently in MySQL database.'}
            </p>
          </div>
        </div>
      )}

      {/* ================= TAB: VIEW ANALYZED REPORTS (जतन केलेले विश्लेषण अहवाल) ================= */}
      {activeTab === 'saved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card for Analyzed Reports */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            padding: '22px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>📑</span>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>
                  {isMr ? 'विश्लेषण केलेले सर्व अहवाल (Analyzed Reports Database)' : 'Analyzed Reports Database'}
                </h2>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                  {savedAnalyses.length} {isMr ? 'नोंदी उपलब्ध' : 'Records'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
                {isMr ? 'डेटाबेसमध्ये विश्लेषित केलेल्या सर्व निवडणुकांची यादी. अहवाल पाहण्यासाठी खालील "विश्लेषण पहा" बटणावर क्लिक करा.' : 'List of all analyzed elections in database. Click "View Analysis" to see complete intelligence report.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={savedSearchQuery}
                  onChange={(e) => setSavedSearchQuery(e.target.value)}
                  placeholder={isMr ? 'निवडणूक / जिल्हा शोधा...' : 'Search election or district...'}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={fetchSavedAnalyses}
                disabled={isLoadingSaved}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="डेटाबेस रिफ्रेश करा"
              >
                <RefreshCw size={13} className={isLoadingSaved ? 'animate-spin' : ''} />
                <span>{isMr ? 'रिफ्रेश' : 'Refresh'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('input')}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Plus size={14} />
                <span>{isMr ? 'नवीन निवडणूक जोडा' : 'New Election Entry'}</span>
              </button>
            </div>
          </div>

          {/* List of Saved Analyses Cards */}
          {isLoadingSaved ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <RefreshCw size={32} className="animate-spin" style={{ color: '#2563eb', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '14px', fontWeight: '750', color: '#475569' }}>
                {isMr ? 'डेटाबेसमधून अहवाल लोड होत आहेत...' : 'Loading saved election analyses from database...'}
              </div>
            </div>
          ) : savedAnalyses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1.5px dashed #cbd5e1' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🗳️</span>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
                {isMr ? 'अद्याप कोणतेही विश्लेषण जतन केलेले नाही' : 'No Election Analyses Saved Yet'}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
                {isMr ? 'सांगली नमुना लोड करा किंवा नवीन निवडणूक माहिती भरून अहवाल जतन करा.' : 'Load the Sangli Assembly sample or enter data to create your first analysis.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  loadTemplate('sangli_assembly');
                  setActiveTab('input');
                }}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ⚡ {isMr ? 'सांगली विधानसभा नमुना लोड करा' : 'Load Sangli Sample'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {savedAnalyses
                .filter((item) => {
                  if (!savedSearchQuery.trim()) return true;
                  const q = savedSearchQuery.toLowerCase();
                  return (
                    (item.election_name && item.election_name.toLowerCase().includes(q)) ||
                    (item.district && item.district.toLowerCase().includes(q)) ||
                    (item.constituency && item.constituency.toLowerCase().includes(q)) ||
                    (item.city_or_village && item.city_or_village.toLowerCase().includes(q))
                  );
                })
                .map((item, idx) => {
                  const itemParties = Array.isArray(item.parties) ? item.parties : [];
                  const sortedParties = [...itemParties].sort((a, b) => (Number(b.currentVotes) || 0) - (Number(a.currentVotes) || 0));
                  const leader = sortedParties[0];
                  const runnerUp = sortedParties[1];
                  const margin = leader && runnerUp ? Math.max(0, (Number(leader.currentVotes) || 0) - (Number(runnerUp.currentVotes) || 0)) : 0;
                  const typeObj = ELECTION_TYPES.find(t => t.id === item.election_type);

                  return (
                    <div
                      key={item.id || item.uuid || idx}
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1.5px solid #e2e8f0',
                        padding: '20px 22px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <span style={{ fontSize: '20px' }}>{typeObj?.icon || '🗳️'}</span>
                            <span style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}>
                              {isMr ? (typeObj?.label_mr || item.election_type) : (typeObj?.label_en || item.election_type)}
                            </span>
                            {item.election_year && (
                              <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                {item.election_year}
                              </span>
                            )}
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800' }}>
                              ✓ जतन विश्लेषण (Saved)
                            </span>
                          </div>

                          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#0f172a' }}>
                            {item.election_name}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '12.5px', color: '#64748b' }}>
                            <MapPin size={13} />
                            <span>
                              {[item.constituency, item.city_or_village, item.taluka, item.district, item.state].filter(Boolean).join(' • ')}
                            </span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleLoadSavedAnalysis(item, true)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '9px 18px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '850',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <BarChart3 size={15} />
                            <span>{isMr ? '📊 अहवाल पहा (View Report)' : 'View Analysis'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLoadSavedAnalysis(item, false)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              padding: '9px 14px',
                              borderRadius: '10px',
                              fontSize: '12.5px',
                              fontWeight: '750',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                            title="फॉर्ममध्ये लोड करा"
                          >
                            <Edit2 size={13} />
                            <span>{isMr ? 'संपादित करा' : 'Edit'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteSavedAnalysis(item.id || item.uuid, e)}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              padding: '9px 12px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: '750',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="डेटाबेसमधून हटवा"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Mini Metrics Row */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '10px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        border: '1px solid #f1f5f9'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>एकूण मतदार</div>
                          <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>
                            {Number(item.total_registered_voters) ? Number(item.total_registered_voters).toLocaleString('en-IN') : '-'}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#2563eb' }}>
                            मतदान: {item.voting_percentage || 0}%
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>आघाडीवर उमेदवार</div>
                          <div style={{ fontSize: '14px', fontWeight: '850', color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {leader?.candidate || '-'}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#15803d' }}>
                            {leader?.name ? `${leader.name} (${leader.voteShare || leader.computedVoteShare || 0}%)` : '-'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>संभाव्य आघाडी (Lead Margin)</div>
                          <div style={{ fontSize: '15px', fontWeight: '900', color: '#d97706' }}>
                            +{margin.toLocaleString('en-IN')} मते
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#b45309' }}>
                            {runnerUp?.candidate ? `विरुद्ध: ${runnerUp.candidate}` : 'दुसऱ्या उमेदवाराविरुद्ध'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>पक्ष सहभाग</div>
                          <div style={{ fontSize: '14px', fontWeight: '850', color: '#475569' }}>
                            {itemParties.length} पक्ष / उमेदवार
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'जतन दिनांक'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: GENERATED ANALYSIS REPORT ================= */}
      {activeTab === 'report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Action Bar for Report */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('input')}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} />
                <span>{isMr ? 'फॉर्मकडे परत जा' : 'Back to Form'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('saved');
                  fetchSavedAnalyses();
                }}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FolderOpen size={14} />
                <span>{isMr ? 'इतर जतन अहवाल पहा' : 'View Other Saved Reports'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopySummary}
                style={{ background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedNotice ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedNotice ? (isMr ? 'कॉपी झाले!' : 'Copied!') : (isMr ? 'अहवाल मजकूर कॉपी करा' : 'Copy Text')}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                style={{ background: '#0f172a', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} />
                <span>{isMr ? 'अहवाल प्रिंट करा / PDF' : 'Print / Save PDF'}</span>
              </button>
            </div>
          </div>

          {/* Verification Badge Bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
            <span style={{ fontWeight: '800', color: '#475569' }}>डेटा पडताळणी मानके:</span>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>🏛️ अधिकृत निकाल संकलित</span>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>✍️ वापरकर्ता माहिती प्रमाणित</span>
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>📊 सांख्यिकीय अंदाज (अंतिम निकाल नव्हे)</span>
          </div>

          {/* 1. Executive Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>एकूण मतदार (Total Voters)</div>
              <div style={{ fontSize: '24px', fontWeight: '950', color: '#0f172a', margin: '4px 0' }}>
                {Number(totalRegisteredVoters).toLocaleString('en-IN') || '-'}
              </div>
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '750' }}>
                मतदान: {votingPercentage}% ({calculatedVotesPolled.toLocaleString('en-IN')})
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>आघाडीवर असलेला पक्ष / उमेदवार</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#166534', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {leaderParty?.candidate || '-'}
              </div>
              <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '750' }}>
                {leaderParty?.name} ({leaderParty?.computedVoteShare}%)
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>संभाव्य मताधिक्य (Lead Margin)</div>
              <div style={{ fontSize: '24px', fontWeight: '950', color: '#d97706', margin: '4px 0' }}>
                +{projectedMargin.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '750' }}>
                दुसऱ्या क्रमांकाच्या उमेदवाराविरुद्ध
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #7c3aed', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '750' }}>लढतीचे स्वरूप</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#6d28d9', margin: '4px 0' }}>
                {parties.length === 2 ? 'द्विकोणी लढत' : parties.length === 3 ? 'त्रिकोणी लढत' : 'बहुरंगी चुरस'}
              </div>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '750' }}>
                {parties.length} पक्ष / प्रमुख उमेदवार
              </div>
            </div>
          </div>

          {/* 2. Visual Vote Share Graph Bars */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
              📊 {isMr ? 'पक्षनिहाय मतविभागणी व मतांची टक्केवारी (Vote Share Breakdown)' : 'Party-wise Vote Share Breakdown'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {partiesWithComputedMetrics.map((p, idx) => {
                const colors = ['#2563eb', '#ea580c', '#10b981', '#7c3aed', '#ec4899', '#f59e0b'];
                const barColor = colors[idx % colors.length];
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '12.5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '850', color: '#0f172a' }}>{p.candidate || p.name}</span>
                        <span style={{ color: '#64748b', fontSize: '11.5px' }}>({p.name})</span>
                      </div>
                      <div style={{ fontWeight: '900', color: barColor }}>
                        {Number(p.currentVotes).toLocaleString('en-IN')} मते ({p.computedVoteShare}%)
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '7px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(Number(p.computedVoteShare), 100)}%`,
                          height: '100%',
                          background: barColor,
                          borderRadius: '7px',
                          transition: 'width 0.5s ease-in-out'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Comprehensive Comparative Table */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
              📋 {isMr ? 'पक्षनिहाय व उमेदवारनिहाय सविस्तर तुलनात्मक तक्ता' : 'Candidate and Party Comparison Matrix'}
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 12px' }}>क्र.</th>
                    <th style={{ padding: '10px 12px' }}>उमेदवार नाव</th>
                    <th style={{ padding: '10px 12px' }}>पक्ष व आघाडी</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>मागील मते</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>सध्याची मते</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>मत टक्केवारी</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>स्विंग (बदल)</th>
                  </tr>
                </thead>
                <tbody>
                  {partiesWithComputedMetrics.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx === 0 ? '#f0fdf4' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '800' }}>#{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '850', color: '#0f172a' }}>
                        {p.candidate || '-'}
                        {idx === 0 && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>आघाडीवर</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '700' }}>{p.name}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>{p.alliance}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>
                        {Number(p.previousVotes) ? Number(p.previousVotes).toLocaleString('en-IN') : '-'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: '#0f172a' }}>
                        {Number(p.currentVotes) ? Number(p.currentVotes).toLocaleString('en-IN') : '-'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '850', color: '#2563eb' }}>
                        {p.computedVoteShare}%
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: p.computedSwing >= 0 ? '#16a34a' : '#dc2626' }}>
                        {p.computedSwing > 0 ? `+${p.computedSwing.toLocaleString('en-IN')}` : p.computedSwing.toLocaleString('en-IN')}
                        {p.computedSwingPct !== 0 && ` (${p.computedSwingPct}%)`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Strengths & Challenges Matrix */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
              ⚖️ {isMr ? 'प्रमुख पक्षांची ताकद व आव्हाने (SWOT Analysis)' : 'Strengths and Challenges Analysis'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {partiesWithComputedMetrics.map((p) => (
                <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '850', color: '#0f172a', marginBottom: '8px' }}>
                    🚩 {p.name} {p.candidate && `(${p.candidate})`}
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: '800', marginBottom: '2px' }}>
                      ✓ ताकद (Strengths):
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e293b' }}>
                      {p.strengths || 'पारंपरिक मतदार संघटन आणि संपर्क.'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '800', marginBottom: '2px' }}>
                      ⚠️ आव्हाने (Challenges):
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e293b' }}>
                      {p.challenges || 'मतविभागणी आणि स्थानिक असंतोषाचे व्यवस्थापन.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Civic Issues Impact Assessment */}
          {developmentIssues.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
                🌊 {isMr ? 'स्थानिक प्रश्न व संभाव्य राजकीय परिणाम' : 'Local Civic Issues & Electoral Impact'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {developmentIssues.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <div>
                      <span style={{ fontWeight: '850', color: '#0f172a' }}>{item.issue || 'स्थानिक प्रश्न'}</span>
                      {item.impact && <span style={{ color: '#64748b', marginLeft: '8px' }}>• {item.impact}</span>}
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: item.priority === 'Critical' ? '#fee2e2' : item.priority === 'High' ? '#fff7ed' : '#eff6ff',
                      color: item.priority === 'Critical' ? '#991b1b' : item.priority === 'High' ? '#c2410c' : '#1d4ed8'
                    }}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Data-Based Electoral Scenarios */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
              🎯 {isMr ? 'डेटा-आधारित संभाव्य निवडणूक परिस्थिती (Possible Electoral Scenarios)' : 'Data-Driven Electoral Scenarios'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '850', color: '#166534', marginBottom: '4px' }}>
                  परिस्थिती अ: थेट द्विकोणी मुकाबला (Bipolar Direct Contest)
                </div>
                <div style={{ fontSize: '12px', color: '#14532d', lineHeight: '1.4' }}>
                  अपक्षांचे मतदान ५% च्या आत राहिल्यास प्रमुख दोन पक्षांमध्ये चुरस वाढेल. अशा वेळी {projectedMargin.toLocaleString('en-IN')} मतांचे मताधिक्य निर्णायक ठरू शकते.
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '850', color: '#1d4ed8', marginBottom: '4px' }}>
                  परिस्थिती ब: उच्च मतदान लाट (High Turnout Surge)
                </div>
                <div style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: '1.4' }}>
                  मतदान ७०% च्या पुढे गेल्यास नवमतदार व महिला मतदारांचा कौल निर्णायक ठरेल. ज्यामुळे पारंपरिक मतांची समीकरणे बदलू शकतात.
                </div>
              </div>

              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '850', color: '#c2410c', marginBottom: '4px' }}>
                  परिस्थिती क: बंडखोरी व मतांची विभागणी (Vote Fragmentation)
                </div>
                <div style={{ fontSize: '12px', color: '#7c2d12', lineHeight: '1.4' }}>
                  तिसऱ्या आघाडीने किंवा अपक्षांनी १५,००० पेक्षा जास्त मते घेतल्यास निसटता विजय किंवा निकाल उलथण्याची दाट शक्यता निर्माण होते.
                </div>
              </div>
            </div>
          </div>

          {/* 7. Final Strategic Conclusion */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', borderRadius: '16px', padding: '22px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📌</span>
              <span>{isMr ? 'अंतिम रणनीतिक निष्कर्ष व निरीक्षण (Final Strategic Conclusion)' : 'Final Strategic Conclusion'}</span>
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: '13px', lineHeight: '1.6', opacity: 0.92 }}>
              {politicalEquations || 'या मतदारसंघात सर्व प्रमुख पक्षांमध्ये चुरशीची लढत अपेक्षित आहे.'}
            </p>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', opacity: 0.92 }}>
              {groundObservations || 'मतदान केंद्रांवरील प्रत्यक्ष बूथ व्यवस्थापन आणि मतदारांना केंद्रावर आणणे हीच विजयाची खरी गुरुकिल्ली ठरेल.'}
            </p>
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '11px', opacity: 0.7 }}>
              अधिकृत विश्लेषण कक्ष • राजकीय डेटाबेस नियंत्रण प्रणाली • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
