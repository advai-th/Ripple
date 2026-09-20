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
import { RuleReviewPage } from './components/RuleReviewPage';
import { NotificationModal } from './components/NotificationModal';
import { AuditDrawer } from './components/AuditDrawer';
import { ToastContainer } from './components/ToastContainer';
import { CohortAnalyticsView } from './components/CohortAnalyticsView';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { SettingsModal } from './components/SettingsModal';
import { AwsStatusModal } from './components/AwsStatusModal';

export function App() {
  // Authentication State
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAwsStatusOpen, setIsAwsStatusOpen] = useState<boolean>(false);

  // View & Routing State (Dashboard vs Dedicated Rule Review Page)
  const [currentView, setCurrentView] = useState<'dashboard' | 'rule-review'>('dashboard');
  const [currentPolicyContent, setCurrentPolicyContent] = useState<string>('');
  const [currentPolicyFilename, setCurrentPolicyFilename] = useState<string>('');

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

  // URL Routing Sync
  const openRuleReviewPage = () => {
    const policyId = selectedSampleKey || 'policy';
    const ruleId = extractedRule?.rule_id || 'rule';
    window.history.pushState({}, '', `/policies/${policyId}/rules/${ruleId}/review`);
    setCurrentView('rule-review');
  };

  const returnToDashboard = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('dashboard');
  };

  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname.includes('/review')) {
        setCurrentView('rule-review');
      } else {
        setCurrentView('dashboard');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

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
      setCurrentPolicyContent(detail.content);
      setCurrentPolicyFilename(detail.filename);

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
      setCurrentPolicyContent(uploadRes.text);
      setCurrentPolicyFilename(uploadRes.filename || file.name);

      setCurrentStage(2);
      const extractRes = await api.extractRule(uploadRes.text, uploadRes.filename);
      setExtractedRule(extractRes.extracted_rule);

      setCurrentStage(3);
      openRuleReviewPage();
      showToast('Policy uploaded & parsed. Please verify Ripple\'s interpretation.', 'info');
    } catch (err: any) {
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Confirm Rule from Full-Screen Review Page
  const handleConfirmRule = async (overrides: Partial<ExtractedRule>) => {
    if (!extractedRule) return;
    try {
      setIsEvaluating(true);
      setCurrentStage(4);

      const confirmRes = await api.confirmRule(extractedRule.rule_id, {
        ...overrides,
        confirmed_by: user?.name || 'Dr. Aris Thorne',
      });
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

      returnToDashboard();

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

  // Reject Rule Handler
  const handleRejectRule = async (reason: string) => {
    if (!extractedRule) return;
    try {
      setIsEvaluating(true);
      await api.rejectRule(extractedRule.rule_id, reason);

      const updatedRule: ExtractedRule = {
        ...extractedRule,
        human_confirmed: false,
      };
      setExtractedRule(updatedRule);

      const logs = await api.getAuditLogs(15);
      setAuditEntries(logs);

      returnToDashboard();
      showToast(`Rule rejected: "${reason}". Policy flagged for manual review.`, 'info');
    } catch (err: any) {
      showToast(`Rejection failed: ${err.message}`, 'error');
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

  // Loading session screen
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0C101A] text-slate-400 font-sans select-none">
        <div className="w-12 h-12 rounded-xl bg-[#1A2338] border border-white/10 p-2 flex items-center justify-center mb-4 shadow-xl">
          <img src="/logo.png" alt="Ripple" className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.svg'; }} />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <svg className="w-4 h-4 animate-spin text-[#8FA5D8]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, display full-screen modern LoginPage
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onOpenForgotPassword={() => setIsForgotPasswordOpen(true)} />
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

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
        onSelectDashboard={() => {
          returnToDashboard();
          setActiveNavTab('roster');
        }}
        onOpenReviewModal={openRuleReviewPage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activePoliciesCount={samples.length || 4}
        affectedCount={counts.affected}
        currentView={currentView}
      />

      {/* Main Content Workspace: Full-Screen Dedicated Rule Review Page vs Dashboard */}
      {currentView === 'rule-review' ? (
        <RuleReviewPage
          rule={extractedRule}
          policyTitle={currentPolicyTitle}
          policyContent={currentPolicyContent}
          policyFilename={currentPolicyFilename}
          onConfirmRule={handleConfirmRule}
          onRejectRule={handleRejectRule}
          onBackToDashboard={returnToDashboard}
          isConfirming={isEvaluating}
          reviewerName={user?.name || 'Dr. Aris Thorne'}
        />

      ) : (
        <main className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
        
          {/* Top Header */}
          <Header
            samples={samples}
            selectedSampleKey={selectedSampleKey}
            onSelectSample={loadPolicyScenario}
            isEvaluating={isEvaluating}
            onUploadFile={handleUploadFile}
            onOpenReviewModal={openRuleReviewPage}
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
            onOpenReviewModal={openRuleReviewPage}
            threshold={extractedRule?.threshold_value || 75}
            field={extractedRule?.field}
          />

          {/* Dashboard Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Metrics Row */}
            <MetricsCards
              summary={summary}
              onOpenReviewModal={openRuleReviewPage}
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
                onOpenReviewModal={openRuleReviewPage}
              />
            ) : (
              /* Split Layout: Student Roster (8 cols) + Evidence & Actions (4 cols) */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                
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
                    onOpenReviewModal={openRuleReviewPage}
                  />
                  <ImpactBreakdownCard
                    summary={summary}
                    onOpenNotifications={() => handleOpenNotifications()}
                    onOpenReviewModal={openRuleReviewPage}
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
                    onOpenReviewModal={openRuleReviewPage}
                  />
                </div>

              </div>
            )}
          </div>
        </main>
      )}

      {/* Modals & Drawers */}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AwsStatusModal
        isOpen={isAwsStatusOpen}
        onClose={() => setIsAwsStatusOpen(false)}
        onSuccessToast={(msg) => showToast(msg, 'success')}
        onErrorToast={(msg) => showToast(msg, 'error')}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}

export default App;
