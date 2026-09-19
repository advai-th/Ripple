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

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SubNavTabs } from './components/SubNavTabs';
import { MetricsCards } from './components/MetricsCards';
import { ImpactTrendChart } from './components/ImpactTrendChart';
import { StudentTable } from './components/StudentTable';
import { ImpactBreakdownCard } from './components/ImpactBreakdownCard';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { PipelineStages } from './components/PipelineStages';
import { HumanReviewModal } from './components/HumanReviewModal';
import { NotificationModal } from './components/NotificationModal';
import { AuditDrawer } from './components/AuditDrawer';
import { ToastContainer } from './components/ToastContainer';
import { CohortAnalyticsView } from './components/CohortAnalyticsView';

export function App() {
  // State
  const [samples, setSamples] = useState<PolicySample[]>([]);
  const [selectedSampleKey, setSelectedSampleKey] = useState<string>('');
  const [currentPolicyTitle, setCurrentPolicyTitle] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<number>(0);

  const [extractedRule, setExtractedRule] = useState<ExtractedRule | null>(null);
  const [summary, setSummary] = useState<CohortSummary | null>(null);
  const [allStudents, setAllStudents] = useState<ImpactResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ImpactResult | null>(null);

  // Batch selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [batchNoticeStudents, setBatchNoticeStudents] = useState<ImpactResult[] | undefined>(undefined);

  // Navigation & Cohort Filter Tabs
  const [activeNavTab, setActiveNavTab] = useState<string>('roster');
  const [activeCohortTab, setActiveCohortTab] = useState<'ALL' | 'AFFECTED' | 'AT_RISK' | 'UNAFFECTED'>('ALL');
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
      setCurrentStage(1);

      const detail = await api.getSampleContent(sampleKey);
      setCurrentPolicyTitle(detail.title);

      setCurrentStage(2);
      const extractRes = await api.extractRule(detail.content, detail.filename);
      const rule = extractRes.extracted_rule;
      setExtractedRule(rule);

      setCurrentStage(3);
      const confirmRes = await api.confirmRule(rule.rule_id);
      setExtractedRule(confirmRes.rule);

      setCurrentStage(4);
      const analysis = await api.runAnalysis(rule.rule_id);

      setCurrentStage(7);
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
        `Pipeline complete: ${analysis.summary.affected_count} non-compliant, ${analysis.summary.at_risk_count} at risk.`,
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

      setCurrentStage(2);
      const extractRes = await api.extractRule(uploadRes.text, uploadRes.filename);
      setExtractedRule(extractRes.extracted_rule);

      setCurrentStage(3);
      setIsReviewModalOpen(true);
      showToast('Policy uploaded & parsed. Please verify the extracted rule criteria.', 'info');
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
      setCurrentStage(4);

      const confirmRes = await api.confirmRule(extractedRule.rule_id, overrides);
      setExtractedRule(confirmRes.rule);

      setCurrentStage(5);
      const analysis = await api.runAnalysis(confirmRes.rule.rule_id);

      setCurrentStage(7);
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
        `Rule confirmed: ${analysis.summary.affected_count} students non-compliant.`,
        'success'
      );
    } catch (err: any) {
      showToast(`Confirmation error: ${err.message}`, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Batch Selection Handlers
  const handleToggleSelectStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.student_id));
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  const handleBatchNotify = (students: ImpactResult[]) => {
    if (!students || students.length === 0) {
      showToast('No students selected for notification.', 'info');
      return;
    }
    setBatchNoticeStudents(students);
    setIsNotificationModalOpen(true);
  };

  // Trigger Notification Simulation (Single or Selected)
  const handleOpenNotifications = async (student?: ImpactResult) => {
    if (!extractedRule) return;
    try {
      const target = student || selectedStudent;
      if (target) {
        setSelectedStudent(target);
      }
      setBatchNoticeStudents(undefined);
      setIsNotificationModalOpen(true);
      const targetId = target ? target.student_id : 'S002';
      const res = await api.simulateNotification(extractedRule.rule_id, [targetId]);
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
      const isBatch = batchNoticeStudents && batchNoticeStudents.length > 0;
      const count = isBatch ? batchNoticeStudents.length : 1;
      const targetName = isBatch
        ? `${count} students`
        : (selectedStudent?.display_name || 'student');
      showToast(
        `Advisory notices dispatched to ${targetName} via Email, SMS, and Advisor queue.`,
        'success'
      );
      setBatchNoticeStudents(undefined);
    }, 600);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (allStudents.length === 0) {
      showToast('No student evaluation results to export.', 'info');
      return;
    }

    const headers = [
      'Student ID', 'Name', 'Course', 'Field',
      'Actual Value', 'Required Value', 'Margin',
      'Status', 'Future Sessions Needed', 'Proof Calculation',
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
    link.setAttribute('download', `ripple_evaluation_${extractedRule?.rule_id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Evaluation ledger exported to CSV.', 'success');
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      if (activeCohortTab === 'AFFECTED' && s.status !== 'AFFECTED') return false;
      if (activeCohortTab === 'AT_RISK' && s.status !== 'AT_RISK') return false;
      if (activeCohortTab === 'UNAFFECTED' && s.status !== 'UNAFFECTED') return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesId = s.student_id.toLowerCase().includes(q);
        const matchesName = s.display_name.toLowerCase().includes(q);
        const matchesCourse = (s.course_id || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesCourse) return false;
      }
      return true;
    });
  }, [allStudents, activeCohortTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: allStudents.length,
      affected: allStudents.filter((s) => s.status === 'AFFECTED').length,
      atRisk: allStudents.filter((s) => s.status === 'AT_RISK').length,
      unaffected: allStudents.filter((s) => s.status === 'UNAFFECTED').length,
    };
  }, [allStudents]);

  return (
    <div className="h-screen w-screen flex flex-row overflow-hidden bg-[#F0F2F7] text-slate-700 antialiased">
      {/* Sidebar */}
      <Sidebar
        onOpenAudit={async () => {
          const logs = await api.getAuditLogs(20);
          setAuditEntries(logs);
          setIsAuditDrawerOpen(true);
        }}
        onOpenNotifications={() => handleOpenNotifications()}
        onOpenAdvisoryNotices={() => {
          const affected = allStudents.filter((s) => s.status === 'AFFECTED');
          handleBatchNotify(affected);
        }}
        onSelectDashboard={() => setActiveNavTab('roster')}
        onOpenReviewModal={() => setIsReviewModalOpen(true)}
        activePoliciesCount={samples.length || 4}
        affectedCount={counts.affected}
      />

      {/* Main Dashboard */}
      <main className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
        
        {/* Top Header */}
        <Header
          samples={samples}
          selectedSampleKey={selectedSampleKey}
          onSelectSample={loadPolicyScenario}
          isEvaluating={isEvaluating}
          onUploadFile={handleUploadFile}
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
          onOpenAudit={async () => {
            const logs = await api.getAuditLogs(20);
            setAuditEntries(logs);
            setIsAuditDrawerOpen(true);
          }}
          onOpenNotifications={() => handleOpenNotifications()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          extractedRule={extractedRule}
          currentPolicyTitle={currentPolicyTitle}
        />

        {/* Sub-Navigation */}
        <SubNavTabs
          activeNavTab={activeNavTab}
          onSelectNavTab={setActiveNavTab}
          activeCohortTab={activeCohortTab}
          onSelectCohortTab={setActiveCohortTab}
          counts={counts}
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
          threshold={extractedRule?.threshold_value || 75}
        />

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Metrics Row */}
          <MetricsCards
            summary={summary}
            onOpenReviewModal={() => setIsReviewModalOpen(true)}
            activePoliciesCount={samples.length || 4}
            onSelectCohortTab={(tab) => {
              setActiveCohortTab(tab);
              setActiveNavTab('roster');
            }}
            activeCohortTab={activeCohortTab}
          />

          {/* Conditional View: Cohort Analytics Tab vs Student Roster Tab */}
          {activeNavTab === 'analytics' ? (
            <CohortAnalyticsView
              allStudents={allStudents}
              summary={summary}
              onExportCSV={handleExportCSV}
              onSelectCohortTab={(tab) => {
                setActiveCohortTab(tab);
                setActiveNavTab('roster');
              }}
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
            />
          ) : (
            /* Main Grid: Left (8 cols) + Right (4 cols) */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
              
              {/* Left Column */}
              <div className="xl:col-span-8 space-y-4 min-w-0">
                <StudentTable
                  students={filteredStudents}
                  selectedStudent={selectedStudent}
                  onSelectStudent={setSelectedStudent}
                  onExportCSV={handleExportCSV}
                  selectedStudentIds={selectedStudentIds}
                  onToggleSelectStudent={handleToggleSelectStudent}
                  onSelectAllStudents={handleSelectAllStudents}
                  onClearSelection={handleClearSelection}
                  onOpenSingleNotify={(student) => handleOpenNotifications(student)}
                  onOpenBatchNotify={handleBatchNotify}
                />
                <ImpactTrendChart
                  onExportReport={handleExportCSV}
                  affectedTotal={counts.affected}
                />
              </div>

              {/* Right Column: Student Details (Immediate action) + Breakdown + Pipeline */}
              <div className="xl:col-span-4 space-y-4 min-w-0">
                <EvidenceDrawer
                  student={selectedStudent}
                  onOpenNotifications={() => handleOpenNotifications()}
                  onOpenReviewModal={() => setIsReviewModalOpen(true)}
                />
                <ImpactBreakdownCard
                  summary={summary}
                  onOpenNotifications={() => handleOpenNotifications()}
                  onOpenReviewModal={() => setIsReviewModalOpen(true)}
                  onSelectCohortTab={(tab) => {
                    setActiveCohortTab(tab);
                    setActiveNavTab('roster');
                  }}
                  onBatchNotifyAffected={() => {
                    const affected = allStudents.filter((s) => s.status === 'AFFECTED');
                    handleBatchNotify(affected);
                  }}
                />
                <PipelineStages
                  currentStage={currentStage}
                  isRunning={isEvaluating}
                  policyTitle={currentPolicyTitle}
                  confidence={extractedRule?.confidence}
                  onOpenReviewModal={() => setIsReviewModalOpen(true)}
                />
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <HumanReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        rule={extractedRule}
        onConfirmRule={handleConfirmRule}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setBatchNoticeStudents(undefined);
        }}
        student={selectedStudent}
        batchStudents={batchNoticeStudents}
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
