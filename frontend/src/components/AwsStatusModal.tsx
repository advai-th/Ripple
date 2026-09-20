import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { AwsDiagnostics } from '../types';

interface AwsStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
  onErrorToast?: (msg: string) => void;
}

export const AwsStatusModal: React.FC<AwsStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
  onErrorToast,
}) => {
  const [diagnostics, setDiagnostics] = useState<AwsDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testingBedrock, setTestingBedrock] = useState(false);
  const [bedrockTestResult, setBedrockTestResult] = useState<{
    latency_ms: number;
    engine: string;
    message?: string;
  } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getAwsStatus();
      setDiagnostics(data);
    } catch (err: any) {
      onErrorToast?.(err.message || 'Failed to fetch AWS status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.syncAws();
      if (res.success) {
        onSuccessToast?.(res.message || 'AWS synchronization complete!');
        fetchStatus();
      } else {
        onErrorToast?.(res.message || 'AWS synchronization failed.');
      }
    } catch (err: any) {
      onErrorToast?.(err.message || 'Sync error');
    } finally {
      setSyncing(false);
    }
  };

  const handleTestBedrock = async () => {
    setTestingBedrock(true);
    try {
      const res = await api.testBedrock();
      setBedrockTestResult({
        latency_ms: res.latency_ms,
        engine: res.engine,
        message: res.message,
      });
      if (res.success) {
        onSuccessToast?.(`Bedrock responded in ${res.latency_ms}ms!`);
      } else {
        onErrorToast?.(res.message || 'Bedrock test failed');
      }
    } catch (err: any) {
      onErrorToast?.(err.message || 'Bedrock ping error');
    } finally {
      setTestingBedrock(false);
    }
  };

  const isLive = diagnostics?.credentials?.valid && diagnostics?.cloud_mode.includes('Active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">AWS Cloud Architecture Engine</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isLive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {diagnostics?.cloud_mode || 'Loading...'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bedrock reasoning · DynamoDB storage · S3 circulars · Serverless Lambda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {/* Identity & Session Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                AWS Identity & Credentials
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-xs">
                  {diagnostics?.credentials?.status || 'CHECKING...'}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  Region: <span className="font-bold text-[#3B4F7A]">{diagnostics?.region || 'ap-south-1'}</span>
                </span>
              </div>
              {diagnostics?.credentials?.account_id && (
                <p className="text-[10px] text-slate-500 font-mono">
                  Account: {diagnostics.credentials.account_id}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition flex items-center gap-1"
                title="Refresh diagnostics"
              >
                <svg
                  className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                {loading ? 'Checking...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Amazon Bedrock Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-b from-purple-50/50 to-white border border-purple-100/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    Amazon Bedrock
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      diagnostics?.bedrock?.accessible
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {diagnostics?.bedrock?.mode || 'Offline'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Strands Agent reasoning for rule predicate extraction and advisor notices.
                </p>
                <div className="mt-2.5 space-y-1 text-[10px] text-slate-500">
                  <div>
                    <span className="text-slate-400">Model:</span>{' '}
                    <span className="font-mono font-medium text-slate-700">Amazon Nova Pro</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Inference Region:</span>{' '}
                    <span className="font-mono font-medium text-slate-700">{diagnostics?.bedrock?.region || 'us-east-1'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-purple-100/60">
                <button
                  onClick={handleTestBedrock}
                  disabled={testingBedrock}
                  className="w-full py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[10px] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {testingBedrock ? 'Testing...' : 'Test Bedrock Latency'}
                </button>
                {bedrockTestResult && (
                  <p className="text-[9px] text-center mt-1 text-slate-500 font-mono">
                    {bedrockTestResult.latency_ms}ms · {bedrockTestResult.engine}
                  </p>
                )}
              </div>
            </div>

            {/* Amazon DynamoDB Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-100/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Amazon DynamoDB
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      diagnostics?.dynamodb?.accessible
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {diagnostics?.dynamodb?.mode || 'Local Mock'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Pay-per-request storage for student cohort, policies, rules, and immutable audit logs.
                </p>
                <div className="mt-2.5 space-y-1 text-[10px] text-slate-500">
                  <div>
                    <span className="text-slate-400">Prefix:</span>{' '}
                    <span className="font-mono font-medium text-slate-700">{diagnostics?.dynamodb?.prefix || 'ripple-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Active Tables:</span>{' '}
                    <span className="font-bold text-slate-800">{diagnostics?.dynamodb?.tables_count || 0} / 5</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-blue-100/60">
                <span className="text-[9px] text-slate-400 block text-center">
                  Includes SSE Encryption & GSI Indexing
                </span>
              </div>
            </div>

            {/* Amazon S3 Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Amazon S3
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      diagnostics?.s3?.accessible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {diagnostics?.s3?.mode || 'Local Disk'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Encrypted object store for raw institutional policy PDFs and circular documents.
                </p>
                <div className="mt-2.5 space-y-1 text-[10px] text-slate-500">
                  <div>
                    <span className="text-slate-400">Bucket:</span>{' '}
                    <span className="font-mono font-medium text-slate-700 truncate block">
                      {diagnostics?.s3?.bucket || 'ripple-policy-circulars'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Access:</span>{' '}
                    <span className="font-medium text-emerald-700">Public Access Blocked</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-emerald-100/60">
                <span className="text-[9px] text-slate-400 block text-center">
                  SSE-AES256 Server-Side Encryption
                </span>
              </div>
            </div>
          </div>

          {/* Architectural Separation Guarantee Notice */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-2.5 text-[11px] text-amber-900">
            <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold block">Architectural Principle: Deterministic Isolation</span>
              <span>
                Amazon Bedrock is isolated exclusively to policy interpretation and phrasing. Student eligibility and deficit calculations are evaluated purely via deterministic code engine without model hallucination risk.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-lg bg-[#3B4F7A] hover:bg-[#2E3F63] text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            {syncing ? 'Syncing to AWS...' : 'Sync Cohort & S3 Circulars'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-200 hover:bg-slate-200/60 text-slate-700 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
