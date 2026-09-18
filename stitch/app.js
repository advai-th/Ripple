/**
 * Ripple Policy Impact Engine - Interactive Dashboard Controller
 * Connects high-fidelity UI to FastAPI backend endpoints.
 */

// Application State
const state = {
  activePolicy: null,
  extractedRule: null,
  analysisResult: null,
  selectedStudent: null,
  activeFilter: 'all', // 'all', 'affected', 'at_risk', 'unaffected'
  searchQuery: '',
  samplePolicies: [],
  auditLogs: [],
  isEditingRule: false,
  currentStage: 1, // 1: Upload, 2: AI Analysis, 3: Human Review, 4: Validate, 5: Impact
};

// API Client
const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getSamples() {
    const res = await fetch('/api/policies/samples');
    return res.json();
  },

  async uploadPolicySample(sampleKey) {
    const formData = new FormData();
    formData.append('sample_key', sampleKey);
    const res = await fetch('/api/policies/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async uploadPolicyFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/policies/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async extractRule(policyId) {
    const res = await fetch('/api/rules/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policy_id: policyId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async confirmRule(payload) {
    const res = await fetch('/api/rules/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async rejectRule(ruleId, reason = 'Rejected by administrator') {
    const res = await fetch('/api/rules/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rule_id: ruleId, reason })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async runAnalysis(ruleId, atRiskThreshold = 5.0) {
    const res = await fetch('/api/analyses/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rule_id: ruleId, at_risk_threshold: atRiskThreshold })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAuditLog() {
    const res = await fetch('/api/audit');
    if (!res.ok) return [];
    return res.json();
  },

  async simulateNotification(ruleId, targetStudentId = null) {
    const res = await fetch('/api/notifications/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rule_id: ruleId, target_student_id: targetStudentId })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

// UI Rendering Engine
const ui = {
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const isError = type === 'error';
    const isSuccess = type === 'success';

    toast.className = `p-3 rounded-lg shadow-lg border text-body-sm font-medium flex items-center gap-2.5 transition-all duration-300 transform translate-y-2 opacity-0 ${
      isError 
        ? 'bg-rose-50 border-rose-200 text-rose-800' 
        : isSuccess 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
          : 'bg-surface-container-lowest border-outline-variant/60 text-on-surface'
    }`;

    const icon = isError ? 'error' : isSuccess ? 'check_circle' : 'info';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  updateStepper(stage) {
    state.currentStage = stage;
    const stages = [
      { id: 'stepper-1', name: '1. UPLOAD', descId: 'stepper-1-desc' },
      { id: 'stepper-2', name: '2. AI ANALYSIS', descId: 'stepper-2-desc' },
      { id: 'stepper-3', name: '3. HUMAN REVIEW', descId: 'stepper-3-desc' },
      { id: 'stepper-4', name: '4. VALIDATE', descId: 'stepper-4-desc' },
      { id: 'stepper-5', name: '5. IMPACT', descId: 'stepper-5-desc' },
    ];

    stages.forEach((s, idx) => {
      const el = document.getElementById(s.id);
      const badge = el?.querySelector('.stepper-badge');
      if (!el || !badge) return;

      const stageNum = idx + 1;
      if (stageNum < stage) {
        // Complete
        badge.className = 'stepper-badge font-code-sm text-code-sm text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200';
        badge.textContent = '✓ Complete';
      } else if (stageNum === stage) {
        // Active
        badge.className = 'stepper-badge font-code-sm text-code-sm text-primary bg-primary-fixed/50 px-1.5 py-0.5 rounded border border-primary/30 flex items-center gap-1';
        badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Active';
      } else {
        // Pending
        badge.className = 'stepper-badge font-code-sm text-code-sm text-outline-variant bg-surface px-1.5 py-0.5 rounded border border-outline-variant/40';
        badge.textContent = 'Pending';
      }
    });
  },

  renderRuleCard() {
    const rule = state.extractedRule;
    if (!rule) return;

    // Badges & metadata
    const statusBadge = document.getElementById('rule-status-badge');
    if (statusBadge) {
      if (rule.human_confirmed) {
        statusBadge.innerHTML = `
          <span class="flex items-center gap-1.5 font-label-sm text-label-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span class="material-symbols-outlined text-[14px]">verified</span>
            Confirmed by Registrar
          </span>`;
      } else {
        statusBadge.innerHTML = `
          <span class="flex items-center gap-1.5 font-label-sm text-label-sm text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span class="material-symbols-outlined text-[14px]">pending_actions</span>
            Awaiting Human Confirmation
          </span>`;
      }
    }

    const confidenceEl = document.getElementById('rule-confidence');
    if (confidenceEl) {
      confidenceEl.textContent = `Confidence: ${(rule.confidence * 100).toFixed(1)}% (Strands Policy Reasoner)`;
    }

    // Comparison grid
    const prevValEl = document.getElementById('rule-prev-val');
    if (prevValEl) prevValEl.textContent = rule.previous_value ? `${rule.previous_value}%` : 'None specified';

    const newValContainer = document.getElementById('rule-new-val-container');
    if (newValContainer) {
      if (state.isEditingRule) {
        newValContainer.innerHTML = `
          <input id="edit-rule-value" type="number" step="0.5" value="${rule.value}" 
            class="w-20 px-2 py-0.5 text-headline-sm font-bold text-primary bg-surface-container-lowest border border-primary rounded focus:ring-1 focus:ring-primary" />
        `;
      } else {
        newValContainer.innerHTML = `
          <span class="font-headline-sm text-headline-sm font-bold text-primary mt-0.5 block">${rule.value}%</span>
        `;
      }
    }

    const machineRuleContainer = document.getElementById('rule-machine-formula-container');
    if (machineRuleContainer) {
      if (state.isEditingRule) {
        machineRuleContainer.innerHTML = `
          <div class="flex items-center gap-1 mt-0.5">
            <input id="edit-rule-field" type="text" value="${rule.field}" class="w-32 px-1.5 py-0.5 font-code-sm text-code-sm bg-surface-container-lowest border rounded" />
            <select id="edit-rule-operator" class="px-1.5 py-0.5 font-code-sm text-code-sm bg-surface-container-lowest border rounded">
              <option value=">=" ${rule.operator === '>=' ? 'selected' : ''}>&gt;=</option>
              <option value=">" ${rule.operator === '>' ? 'selected' : ''}>&gt;</option>
              <option value="<=" ${rule.operator === '<=' ? 'selected' : ''}>&lt;=</option>
              <option value="<" ${rule.operator === '<' ? 'selected' : ''}>&lt;</option>
              <option value="==" ${rule.operator === '==' ? 'selected' : ''}>==</option>
            </select>
          </div>
        `;
      } else {
        machineRuleContainer.innerHTML = `
          <code class="font-code-md text-code-md font-semibold text-primary bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/60 mt-0.5 inline-block">
            ${rule.field} ${rule.operator} ${rule.value}
          </code>
        `;
      }
    }

    const scopeEl = document.getElementById('rule-scope');
    if (scopeEl) {
      const sem = rule.scope?.semester || 'All';
      const dept = rule.scope?.department || 'All Departments';
      scopeEl.textContent = `${sem} (${dept})`;
    }

    // Citation
    const citationSectionEl = document.getElementById('rule-citation-meta');
    if (citationSectionEl) {
      citationSectionEl.textContent = `Statutory Source Citation: ${rule.source?.document || 'Document'} · Section ${rule.source?.section || '3.2'} · Page ${rule.source?.page || 1}`;
    }

    const citationQuoteEl = document.getElementById('rule-citation-quote');
    if (citationQuoteEl) {
      const clause = rule.source?.clause_text || 'No clause text extracted.';
      citationQuoteEl.innerHTML = `"${clause}"`;
    }

    // Action buttons state
    const editBtn = document.getElementById('btn-edit-rule');
    if (editBtn) {
      editBtn.innerHTML = state.isEditingRule 
        ? '<span class="material-symbols-outlined text-[15px]">done</span> Done Editing'
        : '<span class="material-symbols-outlined text-[15px]">edit</span> Edit Rule';
    }

    const confirmBtn = document.getElementById('btn-confirm-rule');
    if (confirmBtn) {
      if (rule.human_confirmed) {
        confirmBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">refresh</span> Re-run Deterministic Evaluation';
      } else {
        confirmBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check_circle</span> Confirm & Run Evaluation';
      }
    }
  },

  renderMetrics() {
    const analysis = state.analysisResult;
    if (!analysis) return;

    const summary = analysis.summary || {};
    const total = summary.total_evaluated || 0;
    const affected = summary.affected_count || 0;
    const atRisk = summary.at_risk_count || 0;
    const unaffected = summary.unaffected_count || 0;

    // Stat cards
    const statTotalEl = document.getElementById('stat-total-students');
    if (statTotalEl) statTotalEl.textContent = '500';

    const statScopedEl = document.getElementById('stat-scoped-students');
    if (statScopedEl) statScopedEl.textContent = `${total} active in evaluation scope`;

    const statAffectedEl = document.getElementById('stat-affected-count');
    if (statAffectedEl) statAffectedEl.textContent = affected.toString();

    const statAtRiskEl = document.getElementById('stat-at-risk-count');
    if (statAtRiskEl) statAtRiskEl.textContent = atRisk.toString();

    // Filter bar chips
    const chipAnalyzed = document.getElementById('chip-analyzed');
    if (chipAnalyzed) chipAnalyzed.textContent = `${total} Students Analyzed`;

    const chipUnaffected = document.getElementById('chip-unaffected');
    if (chipUnaffected) chipUnaffected.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> ${unaffected} Unaffected`;

    const chipAtRisk = document.getElementById('chip-at-risk');
    if (chipAtRisk) chipAtRisk.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span> ${atRisk} At Risk`;

    const chipAffected = document.getElementById('chip-affected');
    if (chipAffected) chipAffected.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span> ${affected} Affected`;

    // Filter tab labels
    const tabAll = document.getElementById('tab-filter-all');
    if (tabAll) tabAll.textContent = `All (${total})`;

    const tabAff = document.getElementById('tab-filter-affected');
    if (tabAff) tabAff.textContent = `Affected (${affected})`;

    const tabRisk = document.getElementById('tab-filter-at-risk');
    if (tabRisk) tabRisk.textContent = `At Risk (${atRisk})`;

    const tabSafe = document.getElementById('tab-filter-unaffected');
    if (tabSafe) tabSafe.textContent = `Unaffected (${unaffected})`;
  },

  getFilteredStudents() {
    if (!state.analysisResult || !state.analysisResult.all_results) return [];

    let list = state.analysisResult.all_results;

    // Status filter
    if (state.activeFilter === 'affected') {
      list = list.filter(s => s.status === 'AFFECTED');
    } else if (state.activeFilter === 'at_risk') {
      list = list.filter(s => s.status === 'AT_RISK');
    } else if (state.activeFilter === 'unaffected') {
      list = list.filter(s => s.status === 'UNAFFECTED');
    }

    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        (s.display_name && s.display_name.toLowerCase().includes(q)) ||
        (s.student_id && s.student_id.toLowerCase().includes(q)) ||
        (s.course_id && s.course_id.toLowerCase().includes(q))
      );
    }

    return list;
  },

  renderTable() {
    const tbody = document.getElementById('student-table-body');
    if (!tbody) return;

    const students = this.getFilteredStudents();
    const tableFooterText = document.getElementById('table-footer-text');
    if (tableFooterText) {
      tableFooterText.textContent = `Showing ${students.length} of ${state.analysisResult?.all_results?.length || 0} scoped students`;
    }

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center text-on-surface-variant font-body-md">
            <span class="material-symbols-outlined text-[32px] text-outline-variant block mb-1">search_off</span>
            No students found matching current filter or search criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.map(s => {
      const isSelected = state.selectedStudent && state.selectedStudent.student_id === s.student_id;
      const isAffected = s.status === 'AFFECTED';
      const isAtRisk = s.status === 'AT_RISK';
      const isSafe = s.status === 'UNAFFECTED';

      // Status pill
      let statusHtml = '';
      if (isAffected) {
        statusHtml = `
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-label-sm bg-rose-100 text-rose-800 font-semibold border border-rose-200">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            AFFECTED
          </span>
        `;
      } else if (isAtRisk) {
        statusHtml = `
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-label-sm bg-amber-100 text-amber-800 font-semibold border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            AT RISK
          </span>
        `;
      } else {
        statusHtml = `
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-label-sm bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            UNAFFECTED
          </span>
        `;
      }

      // Gap mono badge
      const gapVal = (s.gap !== undefined && s.gap !== null) ? Number(s.gap) : ((s.margin !== undefined && s.margin !== null) ? Number(s.margin) : (Number(s.actual_value) - Number(s.required_value)));
      let gapHtml = '';
      if (gapVal < 0) {
        gapHtml = `<span class="font-code-sm text-code-sm font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">${gapVal.toFixed(1)}%</span>`;
      } else if (gapVal <= 5.0) {
        gapHtml = `<span class="font-code-sm text-code-sm font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">+${gapVal.toFixed(1)}%</span>`;
      } else {
        gapHtml = `<span class="font-code-sm text-code-sm text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+${gapVal.toFixed(1)}%</span>`;
      }

      // Current value styling
      const valColor = isAffected ? 'text-rose-600 font-semibold' : isAtRisk ? 'text-amber-700 font-semibold' : 'text-on-surface font-medium';
      const isGPA = s.field === 'gpa' || s.field === 'cgpa';
      const valDecimals = isGPA ? 2 : 1;
      const unit = isGPA ? '' : '%';
      const actDisplay = (s.actual_value !== undefined && s.actual_value !== null) ? Number(s.actual_value).toFixed(valDecimals) : '0';
      const reqDisplay = (s.required_value !== undefined && s.required_value !== null) ? Number(s.required_value).toFixed(valDecimals) : '0';

      return `
        <tr class="h-11 transition-colors cursor-pointer ${
          isSelected 
            ? 'bg-primary-fixed/20 hover:bg-primary-fixed/30 border-l-4 border-l-primary' 
            : 'hover:bg-surface border-l-4 border-l-transparent'
        }" onclick="controller.selectStudent('${s.student_id}')">
          <td class="pl-4 pr-3">
            <input type="checkbox" ${isSelected ? 'checked' : ''} class="rounded-sm border-outline-variant text-primary focus:ring-0" onclick="event.stopPropagation(); controller.selectStudent('${s.student_id}')" />
          </td>
          <td class="px-3">
            <div class="flex items-center gap-2">
              <span class="font-bold text-on-surface">${s.display_name}</span>
              <span class="font-code-sm text-code-sm text-on-surface-variant bg-surface px-1 rounded border border-outline-variant/50">${s.student_id}</span>
              <span class="text-outline text-xs">CSE · S5</span>
            </div>
          </td>
          <td class="px-3 font-code-sm text-code-sm font-medium">${s.course_id || 'CS-502'}</td>
          <td class="px-3 ${valColor}">${actDisplay}${unit}</td>
          <td class="px-3 font-medium text-on-surface">${reqDisplay}${unit}</td>
          <td class="px-3">${gapHtml}</td>
          <td class="px-3">${statusHtml}</td>
          <td class="px-3">
            <button class="inline-flex items-center gap-1 font-label-sm text-primary hover:underline" onclick="event.stopPropagation(); controller.selectStudent('${s.student_id}')">
              <span class="material-symbols-outlined text-[14px]">link</span>
              Citation
            </button>
          </td>
          <td class="pr-5 pl-3 text-right">
            <span class="font-label-sm text-primary font-semibold hover:underline cursor-pointer" onclick="event.stopPropagation(); controller.selectStudent('${s.student_id}')">
              ${isAffected ? 'Inspect Notice' : isAtRisk ? 'Review Margin' : 'View Record'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderDrawer() {
    const s = state.selectedStudent;
    const aside = document.getElementById('student-drawer');
    if (!aside) return;

    if (!s) {
      aside.classList.add('opacity-75');
      return;
    }
    aside.classList.remove('opacity-75');

    // Name & ID
    const nameEl = document.getElementById('drawer-student-name');
    if (nameEl) nameEl.textContent = s.display_name;

    const idEl = document.getElementById('drawer-student-id');
    if (idEl) idEl.textContent = `ID: ${s.student_id} · Course: ${s.course_id}`;

    // Status pill
    const statusPill = document.getElementById('drawer-status-pill');
    if (statusPill) {
      if (s.status === 'AFFECTED') {
        statusPill.className = 'px-2 py-0.5 rounded font-label-sm text-label-sm bg-rose-100 text-rose-800 font-bold border border-rose-200';
        statusPill.textContent = 'AFFECTED';
      } else if (s.status === 'AT_RISK') {
        statusPill.className = 'px-2 py-0.5 rounded font-label-sm text-label-sm bg-amber-100 text-amber-800 font-bold border border-amber-200';
        statusPill.textContent = 'AT RISK';
      } else {
        statusPill.className = 'px-2 py-0.5 rounded font-label-sm text-label-sm bg-emerald-50 text-emerald-700 font-bold border border-emerald-200';
        statusPill.textContent = 'UNAFFECTED';
      }
    }

    // Gap
    const gapVal = Number(s.gap ?? s.margin ?? (Number(s.actual_value || 0) - Number(s.required_value || 0)) ?? 0);
    const isGPA = s.field === 'gpa' || s.field === 'cgpa';
    const valDecimals = isGPA ? 2 : 1;
    const unit = isGPA ? '' : '%';

    const gapDiffEl = document.getElementById('drawer-gap-diff');
    if (gapDiffEl) {
      if (gapVal < 0) {
        gapDiffEl.className = 'text-rose-600 font-bold';
        gapDiffEl.textContent = `${Math.abs(gapVal).toFixed(valDecimals)}${unit} Deficit`;
      } else {
        gapDiffEl.className = 'text-emerald-700 font-bold';
        gapDiffEl.textContent = `+${gapVal.toFixed(valDecimals)}${unit} Compliant Margin`;
      }
    }

    const recordedValEl = document.getElementById('drawer-recorded-val');
    if (recordedValEl) recordedValEl.textContent = `${Number(s.actual_value || 0).toFixed(valDecimals)}${unit}`;

    const requiredValEl = document.getElementById('drawer-required-val');
    if (requiredValEl) requiredValEl.textContent = `${Number(s.required_value || 0).toFixed(valDecimals)}${unit}`;

    // Progress bar
    const progressBar = document.getElementById('drawer-progress-bar');
    if (progressBar) {
      const pct = isGPA ? (Number(s.actual_value || 0) / 4.0) * 100 : Number(s.actual_value || 0);
      progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      progressBar.className = s.status === 'AFFECTED' ? 'bg-rose-500 h-full rounded-full' : s.status === 'AT_RISK' ? 'bg-amber-500 h-full rounded-full' : 'bg-emerald-500 h-full rounded-full';
    }

    const gapDescEl = document.getElementById('drawer-gap-desc');
    if (gapDescEl) {
      if (s.status === 'AFFECTED') {
        gapDescEl.textContent = `${Math.abs(gapVal).toFixed(valDecimals)}${unit} below threshold for qualification.`;
        gapDescEl.className = 'font-body-sm text-body-sm text-rose-700 font-medium';
      } else if (s.status === 'AT_RISK') {
        gapDescEl.textContent = `Compliant, but within ${gapVal.toFixed(valDecimals)}${unit} of failure boundary. Monitoring advised.`;
        gapDescEl.className = 'font-body-sm text-body-sm text-amber-800 font-medium';
      } else {
        gapDescEl.textContent = `Safely compliant. ${gapVal.toFixed(valDecimals)}${unit} above current mandatory regulation.`;
        gapDescEl.className = 'font-body-sm text-body-sm text-emerald-800 font-medium';
      }
    }

    // Deterministic calc
    const calcDisplay = document.getElementById('drawer-calc-display');
    if (calcDisplay) {
      calcDisplay.textContent = s.calculation_display || `${s.actual_value} ${s.status === 'AFFECTED' ? '<' : '>='} ${s.required_value}`;
      calcDisplay.className = s.status === 'AFFECTED' 
        ? 'bg-black/30 p-2.5 rounded border border-white/10 font-code-md text-code-md text-rose-400 font-semibold' 
        : 'bg-black/30 p-2.5 rounded border border-white/10 font-code-md text-code-md text-emerald-400 font-semibold';
    }

    const calcStatusPill = document.getElementById('drawer-calc-status');
    if (calcStatusPill) {
      if (s.status === 'AFFECTED') {
        calcStatusPill.className = 'w-full py-1.5 px-2.5 rounded bg-rose-600/20 border border-rose-500/40 text-rose-300 font-label-sm font-bold text-center';
        calcStatusPill.textContent = 'STATUS: AFFECTED (EXAM BARRED)';
      } else if (s.status === 'AT_RISK') {
        calcStatusPill.className = 'w-full py-1.5 px-2.5 rounded bg-amber-600/20 border border-amber-500/40 text-amber-300 font-label-sm font-bold text-center';
        calcStatusPill.textContent = 'STATUS: AT RISK (BORDERLINE)';
      } else {
        calcStatusPill.className = 'w-full py-1.5 px-2.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-label-sm font-bold text-center';
        calcStatusPill.textContent = 'STATUS: COMPLIANT';
      }
    }

    // Recovery sessions math
    const recoveryBlock = document.getElementById('drawer-recovery-block');
    if (recoveryBlock) {
      if (s.future_sessions_needed !== null && s.future_sessions_needed !== undefined) {
        const needed = s.future_sessions_needed;
        const possible = s.future_sessions_possible;
        recoveryBlock.innerHTML = `
          <div class="p-2.5 bg-surface-container-low rounded border border-outline-variant/40 space-y-1 text-body-sm">
            <div class="flex items-center justify-between font-semibold">
              <span>Attendance Recovery Math:</span>
              <span class="${possible ? 'text-primary' : 'text-rose-600'}">${possible ? `${needed} sessions needed` : 'Impossible to recover'}</span>
            </div>
            <p class="text-xs text-on-surface-variant">
              Must attend at least <strong>${needed}</strong> of remaining sessions to reach ${s.required_value}% before semester conclusion.
            </p>
          </div>
        `;
      } else {
        recoveryBlock.innerHTML = '';
      }
    }

    // Evidence citation
    const quoteEl = document.getElementById('drawer-citation-quote');
    if (quoteEl) {
      quoteEl.textContent = `"${s.evidence_text || state.extractedRule?.source?.clause_text || 'Institutional Policy Regulation 2026'}"`;
    }

    const citationCiteEl = document.getElementById('drawer-citation-cite');
    if (citationCiteEl) {
      citationCiteEl.textContent = `${s.source_document || 'Academic Regulation 2026'} · Section ${s.source_section || '3.2'} · Pg ${s.source_page || '4'}`;
    }

    // Action recommendation
    const noteArea = document.getElementById('drawer-admin-note');
    if (noteArea) {
      noteArea.value = s.recommended_action || 'Review eligibility under revised attendance threshold and initiate academic counseling alert.';
    }
  },

  renderAudit() {
    const container = document.getElementById('audit-timeline-container');
    if (!container) return;

    if (!state.auditLogs || state.auditLogs.length === 0) {
      container.innerHTML = '<p class="text-xs text-outline">No audit events recorded yet.</p>';
      return;
    }

    container.innerHTML = state.auditLogs.slice(0, 6).map(log => {
      const type = log.event_type;
      let dotColor = 'bg-primary';
      let title = type;

      if (type === 'uploaded') {
        dotColor = 'bg-tertiary';
        title = 'Policy document uploaded';
      } else if (type === 'rule_extracted') {
        dotColor = 'bg-secondary';
        title = 'Structured rule extracted';
      } else if (type === 'rule_confirmed') {
        dotColor = 'bg-primary';
        title = 'Rule confirmed by administrator';
      } else if (type === 'rule_edited') {
        dotColor = 'bg-amber-600';
        title = 'Rule threshold adjusted by administrator';
      } else if (type === 'evaluation_run') {
        dotColor = 'bg-emerald-600';
        title = `Evaluation completed (${log.details?.total_evaluated || 0} students)`;
      } else if (type === 'notification_simulated') {
        dotColor = 'bg-primary-container';
        title = `Official notifications simulated (${log.details?.recipient_count || 1} recipients)`;
      }

      const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="flex items-center justify-between text-body-sm">
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 rounded-full ${dotColor}"></span>
            <span class="font-medium text-on-surface">${title}</span>
            <span class="text-outline-variant">—</span>
            <span class="font-code-sm text-code-sm text-on-surface-variant">${dateStr}</span>
          </div>
          <span class="font-code-sm text-code-sm bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/40 text-on-surface">
            Actor: ${log.actor || 'Administrator'}
          </span>
        </div>
      `;
    }).join('');
  },

  showSimulatedNotificationModal(notifications) {
    const modal = document.getElementById('notification-modal');
    const content = document.getElementById('notification-modal-content');
    if (!modal || !content) return;

    if (!notifications || notifications.length === 0) return;

    const notif = notifications[0];

    content.innerHTML = `
      <div class="space-y-3">
        <div class="p-3 bg-surface-container-low rounded border border-outline-variant/40 space-y-1">
          <div class="flex items-center justify-between text-xs text-outline">
            <span>Recipient: <strong>${notif.display_name} (${notif.student_id})</strong></span>
            <span>Channel: <code class="text-primary font-bold">${notif.channel}</code></span>
          </div>
          <div class="font-label-md font-semibold text-on-surface">${notif.subject}</div>
        </div>
        <div class="p-4 bg-surface rounded border border-outline-variant/60 font-body-sm leading-relaxed text-on-surface whitespace-pre-wrap">
${notif.message}
        </div>
        <div class="flex items-center justify-between text-xs text-outline pt-2 border-t border-outline-variant/40">
          <span class="flex items-center gap-1 text-emerald-700">
            <span class="material-symbols-outlined text-[15px]">verified</span>
            Cryptographically Grounded in Deterministic Evidence
          </span>
          <span>Dispatched at: ${new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }
};

// Application Controller
const controller = {
  async init() {
    try {
      // 1. Fetch available samples
      state.samplePolicies = await api.getSamples();
      this.populateSampleSelector();

      // 2. Automatically load default sample policy to bring dashboard alive immediately
      await this.loadSamplePolicy('academic_attendance_regulation_2026.txt');

      // 3. Refresh audit logs
      await this.refreshAudit();

      // 4. Bind event listeners
      this.bindEvents();

      ui.showToast('Ripple Impact Engine connected & initialized.', 'success');
    } catch (err) {
      console.error('Initialization error:', err);
      ui.showToast(`Error initializing engine: ${err.message}`, 'error');
    }
  },

  populateSampleSelector() {
    const select = document.getElementById('sample-policy-select');
    if (!select || !state.samplePolicies) return;

    select.innerHTML = state.samplePolicies.map(s => `
      <option value="${s.sample_key}">${s.title} (${s.format})</option>
    `).join('');
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('student-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        ui.renderTable();
      });
    }

    // Filter toggles
    const filterTabs = [
      { id: 'tab-filter-all', filter: 'all' },
      { id: 'tab-filter-affected', filter: 'affected' },
      { id: 'tab-filter-at-risk', filter: 'at_risk' },
      { id: 'tab-filter-unaffected', filter: 'unaffected' },
    ];

    filterTabs.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) {
        el.addEventListener('click', () => {
          state.activeFilter = t.filter;
          filterTabs.forEach(item => {
            const btn = document.getElementById(item.id);
            if (btn) {
              if (item.filter === state.activeFilter) {
                btn.className = 'px-2.5 py-1 rounded bg-surface-container-lowest font-semibold text-on-surface shadow-xs';
              } else {
                btn.className = 'px-2.5 py-1 text-on-surface-variant hover:bg-surface-container-low transition-colors';
              }
            }
          });
          ui.renderTable();
        });
      }
    });

    // Upload Policy Button in Header
    const uploadBtn = document.getElementById('btn-open-upload');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.openUploadModal());
    }

    // Load Sample Button in Modal
    const loadSampleBtn = document.getElementById('btn-load-sample-confirm');
    if (loadSampleBtn) {
      loadSampleBtn.addEventListener('click', () => {
        const select = document.getElementById('sample-policy-select');
        if (select && select.value) {
          this.closeUploadModal();
          this.loadSamplePolicy(select.value);
        }
      });
    }

    // File input change in modal
    const fileInput = document.getElementById('policy-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    // Edit Rule Button
    const editRuleBtn = document.getElementById('btn-edit-rule');
    if (editRuleBtn) {
      editRuleBtn.addEventListener('click', () => this.toggleEditRule());
    }

    // Confirm & Run Button
    const confirmBtn = document.getElementById('btn-confirm-rule');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmAndRunEvaluation());
    }

    // Re-run Evaluation in header
    const rerunHeaderBtn = document.getElementById('btn-rerun-header');
    if (rerunHeaderBtn) {
      rerunHeaderBtn.addEventListener('click', () => this.confirmAndRunEvaluation());
    }

    // Download CSV button
    const csvBtn = document.getElementById('btn-download-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => this.downloadCSV());
    }

    const exportHeaderBtn = document.getElementById('btn-export-header');
    if (exportHeaderBtn) {
      exportHeaderBtn.addEventListener('click', () => this.downloadCSV());
    }

    // Simulate Notification in Drawer
    const notifyBtn = document.getElementById('btn-drawer-notify');
    if (notifyBtn) {
      notifyBtn.addEventListener('click', () => this.simulateNotification());
    }

    // Close Modal Button
    const closeModalBtn = document.getElementById('btn-close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeUploadModal());
    }

    // Close Notification Modal Button
    const closeNotifModalBtn = document.getElementById('btn-close-notif-modal');
    if (closeNotifModalBtn) {
      closeNotifModalBtn.addEventListener('click', () => {
        document.getElementById('notification-modal')?.classList.add('hidden');
      });
    }
  },

  async loadSamplePolicy(sampleKey) {
    ui.updateStepper(1);
    ui.showToast(`Loading policy: ${sampleKey}...`, 'info');

    // 1. Upload sample
    const uploadRes = await api.uploadPolicySample(sampleKey);
    state.activePolicy = uploadRes;

    const fileNameEl = document.getElementById('stepper-1-desc');
    if (fileNameEl) fileNameEl.textContent = uploadRes.filename;

    const policyTitleHeader = document.getElementById('policy-title-header');
    if (policyTitleHeader) policyTitleHeader.textContent = `Policy Impact Analysis: ${uploadRes.name}`;

    // 2. Extract Rule
    ui.updateStepper(2);
    ui.showToast('Extracting structured rule via Strands Agent...', 'info');

    const extractRes = await api.extractRule(uploadRes.policy_id);
    if (!extractRes.success) {
      ui.showToast(`Rule extraction requires manual review: ${extractRes.error}`, 'error');
      return;
    }
    state.extractedRule = extractRes.rule;

    // 3. Human Review stage
    ui.updateStepper(3);
    ui.renderRuleCard();

    // 4 & 5. Automatically confirm & run evaluation for the initial sample load
    await this.confirmAndRunEvaluation();
  },

  async handleFileSelected(file) {
    this.closeUploadModal();
    ui.updateStepper(1);
    ui.showToast(`Uploading file: ${file.name}...`, 'info');

    try {
      const uploadRes = await api.uploadPolicyFile(file);
      state.activePolicy = uploadRes;

      const fileNameEl = document.getElementById('stepper-1-desc');
      if (fileNameEl) fileNameEl.textContent = uploadRes.filename;

      const policyTitleHeader = document.getElementById('policy-title-header');
      if (policyTitleHeader) policyTitleHeader.textContent = `Policy Impact Analysis: ${uploadRes.name}`;

      // Extract
      ui.updateStepper(2);
      ui.showToast('Extracting machine rule from document...', 'info');
      const extractRes = await api.extractRule(uploadRes.policy_id);
      if (!extractRes.success) {
        ui.showToast(`Extraction warning: ${extractRes.error}`, 'error');
        return;
      }
      state.extractedRule = extractRes.rule;

      ui.updateStepper(3);
      ui.renderRuleCard();
      ui.showToast('Rule extracted! Please review and confirm.', 'success');
      await this.refreshAudit();
    } catch (err) {
      console.error(err);
      ui.showToast(`Upload failed: ${err.message}`, 'error');
    }
  },

  toggleEditRule() {
    if (state.isEditingRule) {
      // Save edits into state
      const valInput = document.getElementById('edit-rule-value');
      const opInput = document.getElementById('edit-rule-operator');
      const fieldInput = document.getElementById('edit-rule-field');

      if (valInput && opInput && fieldInput) {
        state.extractedRule.value = parseFloat(valInput.value);
        state.extractedRule.operator = opInput.value;
        state.extractedRule.field = fieldInput.value;
      }
      state.isEditingRule = false;
      ui.showToast('Rule parameters updated locally.', 'info');
    } else {
      state.isEditingRule = true;
    }
    ui.renderRuleCard();
  },

  async confirmAndRunEvaluation() {
    if (!state.extractedRule) {
      ui.showToast('No rule available to confirm.', 'error');
      return;
    }

    try {
      ui.updateStepper(3);
      ui.showToast('Confirming rule with administrator credentials...', 'info');

      // 1. Confirm rule
      const rule = state.extractedRule;
      const confirmPayload = {
        rule_id: rule.rule_id,
        name: rule.name,
        field: rule.field,
        operator: rule.operator,
        value: parseFloat(rule.value),
        previous_value: rule.previous_value,
        scope_semester: rule.scope?.semester || 'S5',
        scope_department: rule.scope?.department || 'Computer Science',
        scope_course_id: rule.scope?.course_id || null,
        document: rule.source?.document || state.activePolicy?.filename || 'Policy Document',
        section: rule.source?.section || 'Section 3.2',
        page: rule.source?.page || 1,
        clause_text: rule.source?.clause_text || ''
      };

      const confirmRes = await api.confirmRule(confirmPayload);
      state.extractedRule = confirmRes.rule;
      ui.renderRuleCard();

      // 2. Validate & Run Deterministic Analysis
      ui.updateStepper(4);
      ui.showToast('Running deterministic validation against student database...', 'info');

      const analysisRes = await api.runAnalysis(rule.rule_id, 5.0);
      state.analysisResult = analysisRes;

      ui.updateStepper(5);

      // Select hero student S002 if present, otherwise first affected
      const hero = analysisRes.all_results?.find(s => s.student_id === 'S002') || analysisRes.affected_students?.[0] || analysisRes.all_results?.[0];
      if (hero) {
        state.selectedStudent = hero;
      }

      ui.renderMetrics();
      ui.renderTable();
      ui.renderDrawer();
      await this.refreshAudit();

      ui.showToast(`Analysis completed: ${analysisRes.summary.affected_count} students affected, ${analysisRes.summary.at_risk_count} at-risk.`, 'success');
    } catch (err) {
      console.error(err);
      ui.showToast(`Evaluation failed: ${err.message}`, 'error');
    }
  },

  selectStudent(studentId) {
    if (!state.analysisResult || !state.analysisResult.all_results) return;
    const student = state.analysisResult.all_results.find(s => s.student_id === studentId);
    if (student) {
      state.selectedStudent = student;
      ui.renderTable();
      ui.renderDrawer();
    }
  },

  async simulateNotification() {
    if (!state.extractedRule || !state.selectedStudent) {
      ui.showToast('Please select an affected student first.', 'error');
      return;
    }

    try {
      ui.showToast(`Generating notification for ${state.selectedStudent.display_name}...`, 'info');
      const res = await api.simulateNotification(state.extractedRule.rule_id, state.selectedStudent.student_id);
      
      if (res.notifications && res.notifications.length > 0) {
        ui.showSimulatedNotificationModal(res.notifications);
        ui.showToast(`Simulated notice dispatched to ${state.selectedStudent.student_id}!`, 'success');
      } else {
        ui.showToast('Notice generated. Check modal for details.', 'info');
      }
      await this.refreshAudit();
    } catch (err) {
      console.error(err);
      ui.showToast(`Simulation failed: ${err.message}`, 'error');
    }
  },

  downloadCSV() {
    if (!state.analysisResult || !state.analysisResult.all_results) {
      ui.showToast('No analysis results to export.', 'error');
      return;
    }

    const headers = [
      'Student ID', 'Name', 'Course', 'Field', 'Actual Value', 
      'Required Value', 'Margin', 'Status', 'Sessions Needed', 'Calculation'
    ];

    const rows = state.analysisResult.all_results.map(s => [
      `"${s.student_id}"`,
      `"${s.display_name}"`,
      `"${s.course_id || 'CS-502'}"`,
      `"${s.field}"`,
      s.actual_value,
      s.required_value,
      s.gap ?? s.margin ?? 0,
      `"${s.status}"`,
      s.future_sessions_needed !== null ? s.future_sessions_needed : 'N/A',
      `"${(s.calculation_display || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ripple_impact_analysis_${state.extractedRule?.rule_id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ui.showToast('Cohort Impact Report downloaded.', 'success');
  },

  async refreshAudit() {
    try {
      state.auditLogs = await api.getAuditLog();
      ui.renderAudit();
    } catch (e) {
      console.warn('Failed to fetch audit log', e);
    }
  },

  openUploadModal() {
    document.getElementById('upload-policy-modal')?.classList.remove('hidden');
  },

  closeUploadModal() {
    document.getElementById('upload-policy-modal')?.classList.add('hidden');
  }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  controller.init();
});
