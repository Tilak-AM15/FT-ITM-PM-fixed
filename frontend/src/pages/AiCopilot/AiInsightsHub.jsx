import React, {
  useEffect,
  useState,
} from 'react';

import { aiApi } from '../../api/endpoints';

import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Clock3,
  Users,
  Target,
  RefreshCw,
} from 'lucide-react';

const getRiskClass = (level) => {

  if (level === 'HIGH') {
    return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
  }

  if (level === 'MEDIUM') {
    return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  }

  return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
};

export const AiInsightsHub = () => {

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const loadInsights = async () => {

    setLoading(true);
    setError('');

    try {

      const response =
        await aiApi.getExecutiveSummary();

      setData(
        response?.data || null
      );

    } catch (err) {

      console.error(
        'Failed to load AI insights:',
        err
      );

      setError(
        'AI insights could not be loaded.'
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-extrabold text-white">
            AI Project Intelligence
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Future Transformation • Delivery intelligence
          </p>
        </div>

        <div className="glass-card min-h-[50vh] flex items-center justify-center">

          <div className="text-center">

            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>

            <p className="text-xs text-slate-400">
              Analysing project operations...
            </p>

          </div>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-extrabold text-white">
            AI Project Intelligence
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Future Transformation
          </p>
        </div>

        <div className="glass-card p-8 text-center">

          <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-3" />

          <p className="text-sm text-white font-semibold">
            {error}
          </p>

          <button
            onClick={loadInsights}
            className="btn btn-secondary btn-sm mt-4"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>

        </div>

      </div>
    );
  }

  const risks =
    data?.riskPredictions || [];

  const anomalies =
    data?.anomalies || [];

  const actions =
    data?.recommendedNextActions || [];

  const highRiskCount =
    risks.filter(
      (risk) =>
        risk?.riskLevel === 'HIGH'
    ).length;

  const mediumRiskCount =
    risks.filter(
      (risk) =>
        risk?.riskLevel === 'MEDIUM'
    ).length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>

            <div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
                AI Project Intelligence
              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Future Transformation • Risk, delivery, resource and effort intelligence
              </p>

            </div>

          </div>

        </div>

        <button
          onClick={loadInsights}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Analysis
        </button>

      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="glass-card p-6 border-indigo-500/20">

        <div className="flex items-start gap-4">

          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-sm font-bold text-white">
                Executive Intelligence
              </h2>

              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                AI
              </span>

            </div>

            <p className="text-sm text-slate-300 leading-6 mt-2">
              {data?.executiveSummary ||
                'No executive AI summary is currently available.'}
            </p>

          </div>

        </div>

      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="glass-card p-5">

          <div className="flex justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Projects Assessed
              </p>

              <strong className="text-2xl text-white block mt-2">
                {risks.length}
              </strong>
            </div>

            <Target className="w-5 h-5 text-indigo-400" />

          </div>

        </div>

        <div className="glass-card p-5">

          <div className="flex justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                High Risk
              </p>

              <strong className="text-2xl text-rose-300 block mt-2">
                {highRiskCount}
              </strong>
            </div>

            <AlertTriangle className="w-5 h-5 text-rose-400" />

          </div>

        </div>

        <div className="glass-card p-5">

          <div className="flex justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Medium Risk
              </p>

              <strong className="text-2xl text-amber-300 block mt-2">
                {mediumRiskCount}
              </strong>
            </div>

            <Clock3 className="w-5 h-5 text-amber-400" />

          </div>

        </div>

        <div className="glass-card p-5">

          <div className="flex justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Recommended Actions
              </p>

              <strong className="text-2xl text-emerald-300 block mt-2">
                {actions.length}
              </strong>
            </div>

            <Lightbulb className="w-5 h-5 text-emerald-400" />

          </div>

        </div>

      </div>

      {/* RISK TABLE */}
      <div className="glass-card overflow-hidden">

        <div className="px-5 py-4 border-b border-white/5">

          <div className="flex items-center gap-2">

            <AlertTriangle className="w-4 h-4 text-amber-400" />

            <h2 className="text-sm font-bold text-white">
              Project Risk Forecast
            </h2>

          </div>

          <p className="text-[11px] text-slate-500 mt-1">
            Projects requiring management attention.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-white/5">

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Project
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Risk
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Delay Probability
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Cost Risk
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Primary Factor
                </th>

              </tr>

            </thead>

            <tbody>

              {risks.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-xs text-slate-500"
                  >
                    No project risk predictions available.
                  </td>
                </tr>

              ) : (

                risks.map((risk, index) => (

                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >

                    <td className="px-5 py-4">

                      <div className="text-xs font-bold text-white">
                        {risk.projectName ||
                          'Unnamed Project'}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {risk.projectCode || '—'}
                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex px-2 py-1 rounded-md border text-[10px] font-bold ${getRiskClass(
                          risk.riskLevel
                        )}`}
                      >
                        {risk.riskLevel ||
                          'UNKNOWN'}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="text-xs font-bold text-amber-300">
                        {risk.delayProbabilityPercentage ??
                          '—'}
                        {risk.delayProbabilityPercentage != null
                          ? '%'
                          : ''}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="text-xs font-bold text-rose-300">
                        {risk.predictedCostOverrunPercentage !=
                        null
                          ? `+${risk.predictedCostOverrunPercentage}%`
                          : '—'}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {risk.primaryRiskFactor ||
                        'No primary factor provided.'}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* LOWER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ANOMALIES */}
        <div className="glass-card">

          <div className="px-5 py-4 border-b border-white/5">

            <div className="flex items-center gap-2">

              <ShieldAlert className="w-4 h-4 text-cyan-400" />

              <h2 className="text-sm font-bold text-white">
                Effort & Timesheet Anomalies
              </h2>

            </div>

          </div>

          <div className="p-5 space-y-3">

            {anomalies.length === 0 ? (

              <div className="text-center py-8">

                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />

                <p className="text-xs text-slate-400">
                  No anomalies detected.
                </p>

              </div>

            ) : (

              anomalies.map(
                (item, index) => (

                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-950/40 border border-white/5"
                  >

                    <div className="flex items-start gap-3">

                      <Users className="w-4 h-4 text-cyan-400 mt-0.5" />

                      <div>

                        <p className="text-xs font-bold text-white">
                          {item.employeeName ||
                            'Employee'}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-1">
                          {item.projectOrTaskName ||
                            'Task'}
                        </p>

                        <p className="text-[11px] text-slate-500 mt-2 leading-5">
                          {item.description ||
                            'No description available.'}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

        {/* ACTIONS */}
        <div className="glass-card">

          <div className="px-5 py-4 border-b border-white/5">

            <div className="flex items-center gap-2">

              <Lightbulb className="w-4 h-4 text-amber-400" />

              <h2 className="text-sm font-bold text-white">
                Recommended Management Actions
              </h2>

            </div>

          </div>

          <div className="p-5 space-y-3">

            {actions.length === 0 ? (

              <div className="text-center py-8">

                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />

                <p className="text-xs text-slate-400">
                  No immediate actions recommended.
                </p>

              </div>

            ) : (

              actions.map(
                (action, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-slate-950/40 border border-white/5"
                  >

                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center shrink-0">

                      <span className="text-[10px] font-bold text-indigo-300">
                        {index + 1}
                      </span>

                    </div>

                    <p className="text-xs text-slate-300 leading-5">
                      {action}
                    </p>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500">

        <TrendingUp className="w-3.5 h-3.5" />

        AI insights should support management decisions using project,
        task, resource, deadline and timesheet data.

      </div>

    </div>
  );
};
