import { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import type { 
  PolicySample, 
  ExtractedRule, 
  ImpactResult, 
  CohortSummary, 
  AuditEntry, 
  NotificationPreview, 
  ToastMessage 
} from './types';

import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { PolicyBanner } from './components/PolicyBanner';
import { MetricsCards } from './components/MetricsCards';
import { StudentTable } from './components/StudentTable';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { HumanReviewModal } from './components/HumanReviewModal';
import { NotificationModal } from './components/NotificationModal';
import { AuditDrawer } from './components/AuditDrawer';
import { ToastContainer } from './components/ToastContainer';

export function App() {
  // State
  const [samples, setSamples] = useState<PolicySample[]>([]);
  const [selectedSampleKey, setSelectedSampleKey] = useState<string>('');
  const [currentPolicyTitle, setCurrentPolicyTitle] = useState<string>('');
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<number>(1);

  const [extractedRule, setExtractedRule] = useState<ExtractedRule | null>(null);
  const [summary, setSummary] = useState<CohortSummary | null>(null);
  const [allStudents, setAllStudents] = useState<ImpactResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ImpactResult | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  // Async indicators
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [notificationPreview, setNotificationPreview] = useState<NotificationPreview | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load
  useEffect(() => {
    async function init() {
      try {
        const sampleList = await api.getSamples();
        setSamples(sampleList);
        if (sampleList.length > 0) {
          const firstKey = sampleList[0].sample_key;
          await loadPolicyScenario(firstKey);
        }
      } catch (err: any) {
        showToast(`Initialization error: ${err.message}`, 'error');
      }
    }
    init();
  }, []);

  // Scenario Loader
  const loadPolicyScenario = async (sampleKey: string) => {
    try {
      setIsEvaluating(true);
      setSelectedSampleKey(sampleKey);
      setCurrentStage(1); // Upload

      const detail = await api.getSampleContent(sampleKey);
      setCurrentPolicyTitle(detail.title);
      setCurrentFilename(detail.filename);

      setCurrentStage(2); // AI Analysis
      const extractRes = await api.extractRule(detail.content, detail.filename);
      const rule = extractRes.extracted_rule;
      setExtractedRule(rule);

      setCurrentStage(3); // Human Review
      const confirmRes = await api.confirmRule(rule.rule_id);
      setExtractedRule(confirmRes.rule);

      setCurrentStage(4); // Validate
      const analysis = await api.runAnalysis(rule.rule_id);

      setCurrentStage(5); // Impact
      setSummary(analysis.summary);
      setAllStudents(analysis.all_results || []);

      // Select S002 (Elena Rostova) by default if available, or first affected
      const hero = analysis.all_results?.find((s) => s.student_id === 'S002') ||
        analysis.affected_students?.[0] ||
        analysis.all_results?.[0] ||
        null;
      setSelectedStudent(hero);

      // Refresh Audit
      const logs = await api.getAuditLogs(15);
      setAuditEntries(logs);

      showToast(
        `Analysis complete: ${analysis.summary.affected_count} affected, ${analysis.summary.at_risk_count} at-risk.`,
        'success'
      );
    } catch (err: any) {
      showToast(`Scenario error: ${err.message}`, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Upload Custom File
  const handleUploadFile = async (file: File) => {
    try {
      setIsEvaluating(true);
      setCurrentStage(1);
      const uploadRes = await api.uploadPolicy(file);
      setCurrentPolicyTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      setCurrentFilename(uploadRes.filename);

      setCurrentStage(2);
      const extractRes = await api.extractRule(uploadRes.text, uploadRes.filename);
      setExtractedRule(extractRes.extracted_rule);

      setCurrentStage(3);
      // Open review modal for human verification
      setIsReviewModalOpen(true);
      showToast('Policy uploaded & parsed. Please review rule criteria.', 'info');
    } catch (err: any) {
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Confirm Rule from Modal
  const handleConfirmRule = async (overrides: Partial<ExtractedRule>) => {
    if (!extractedRule) return;
    try {
      setIsEvaluating(true);
      setIsReviewModalOpen(false);

      const confirmRes = await api.confirmRule(extractedRule.rule_id, overrides);
      setExtractedRule(confirmRes.rule);

      setCurrentStage(4);
      const analysis = await api.runAnalysis(confirmRes.rule.rule_id);

      setCurrentStage(5);
      setSummary(analysis.summary);
      setAllStudents(analysis.all_results || []);

      const hero = analysis.all_results?.find((s) => s.student_id === 'S002') ||
        analysis.affected_students?.[0] ||
        analysis.all_results?.[0] ||
        null;
      setSelectedStudent(hero);

      const logs = await api.getAuditLogs(15);
      setAuditEntries(logs);

      showToast(
        `Rule verified and evaluated: ${analysis.summary.affected_count} students affected.`,
        'success'
      );
    } catch (err: any) {
      showToast(`Confirmation error: ${err.message}`, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Trigger Notification Simulation
  const handleOpenNotifications = async () => {
    if (!selectedStudent || !extractedRule) return;
    try {
      setIsNotificationModalOpen(true);
      const res = await api.simulateNotification(extractedRule.rule_id, [selectedStudent.student_id]);
      if (res.preview && res.preview.length > 0) {
        setNotificationPreview(res.preview[0]);
      }
    } catch (err: any) {
      showToast(`Failed to generate notification: ${err.message}`, 'error');
    }
  };

  // Dispatch Notification Simulation
  const handleDispatchNotification = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setIsNotificationModalOpen(false);
      showToast(
        `Notice dispatched to ${selectedStudent?.display_name} across Email, SMS, and Advisor queues.`,
        'success'
      );
    }, 600);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (allStudents.length === 0) {
      showToast('No student evaluation results to export.', 'info');
      return;
    }

    const headers = [
      'Student ID',
      'Name',
      'Course',
      'Field',
      'Actual Value',
      'Required Value',
      'Margin',
      'Status',
      'Future Sessions Needed',
      'Proof Calculation',
    ];

    const rows = allStudents.map((s) => [
      `"${s.student_id}"`,
      `"${s.display_name}"`,
      `"${s.course_id || 'CS-502'}"`,
      `"${s.field}"`,
      s.actual_value,
      s.required_value,
      s.gap ?? s.margin ?? 0,
      `"${s.status}"`,
      s.future_sessions_needed !== null && s.future_sessions_needed !== undefined ? s.future_sessions_needed : 'N/A',
      `"${(s.calculation_display || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ripple_impact_analysis_${extractedRule?.rule_id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Cohort evaluation ledger exported to CSV.', 'success');
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      // Tab filter
      if (activeTab === 'AFFECTED' && s.status !== 'AFFECTED') return false;
      if (activeTab === 'AT_RISK' && s.status !== 'AT_RISK') return false;
      if (activeTab === 'UNAFFECTED' && s.status !== 'UNAFFECTED') return false;

      // Query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesId = s.student_id.toLowerCase().includes(q);
        const matchesName = s.display_name.toLowerCase().includes(q);
        const matchesCourse = (s.course_id || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesCourse) return false;
      }
      return true;
    });
  }, [allStudents, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: allStudents.length,
      affected: allStudents.filter((s) => s.status === 'AFFECTED').length,
      atRisk: allStudents.filter((s) => s.status === 'AT_RISK').length,
      unaffected: allStudents.filter((s) => s.status === 'UNAFFECTED').length,
    };
  }, [allStudents]);

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      {/* 1. Header */}
      <Header onOpenAudit={async () => {
        const logs = await api.getAuditLogs(15);
        setAuditEntries(logs);
        setIsAuditDrawerOpen(true);
      }} />

      {/* 2. 5-Stage Stepper */}
      <Stepper currentStage={currentStage} />

      {/* 3. Active Policy Banner */}
      <PolicyBanner
        currentPolicyTitle={currentPolicyTitle}
        currentFilename={currentFilename}
        extractedRule={extractedRule}
        samples={samples}
        selectedSampleKey={selectedSampleKey}
        isEvaluating={isEvaluating}
        onSelectSample={loadPolicyScenario}
        onUploadFile={handleUploadFile}
        onOpenReviewModal={() => setIsReviewModalOpen(true)}
        onRunAnalysis={() => extractedRule && handleConfirmRule({})}
      />

      {/* 4. Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* KPI Metrics */}
        <MetricsCards
          summary={summary}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Workspace: Table + Evidence Drawer */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <StudentTable
            students={filteredStudents}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={counts}
            onExportCSV={handleExportCSV}
          />

          <EvidenceDrawer
            student={selectedStudent}
            onOpenNotifications={handleOpenNotifications}
          />
        </div>
      </div>

      {/* Modals & Drawers */}
      <HumanReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        rule={extractedRule}
        onConfirmRule={handleConfirmRule}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        student={selectedStudent}
        notificationPreview={notificationPreview}
        isDispatching={isDispatching}
        onDispatch={handleDispatchNotification}
      />

      <AuditDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        entries={auditEntries}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
