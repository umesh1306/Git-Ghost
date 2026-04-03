import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { Search, Loader2, AlertTriangle, CheckCircle, Info, Clock, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';

interface Analysis {
  purpose: string;
  reason_deleted: string;
  risk: string;
}

interface Report {
  id?: string;
  repoUrl: string;
  deletedCode: string;
  purpose: string;
  reasonDeleted: string;
  risk: string;
  userId: string;
  createdAt: any;
}

export default function Dashboard({ user }: { user: User }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [pastReports, setPastReports] = useState<Report[]>([]);
  const [error, setError] = useState('');
  const [noGhostsMessage, setNoGhostsMessage] = useState('');

  useEffect(() => {
    fetchPastReports();
  }, [user]);

  const fetchPastReports = async () => {
    try {
      const q = query(
        collection(db, 'reports'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const reports: Report[] = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as Report);
      });
      setPastReports(reports);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError('');
    setCurrentReport(null);
    setNoGhostsMessage('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze repository');
      }

      if (data.status === 'no_ghosts') {
        setNoGhostsMessage(data.message);
        return;
      }

      const newReport: Report = {
        repoUrl: data.repo,
        deletedCode: data.deleted_code,
        purpose: data.analysis.purpose,
        reasonDeleted: data.analysis.reason_deleted,
        risk: data.analysis.risk,
        userId: user.uid,
        createdAt: new Date(), // Use client date for immediate display
      };

      setCurrentReport(newReport);

      // Save to Firestore
      await addDoc(collection(db, 'reports'), {
        ...newReport,
        createdAt: serverTimestamp(),
      });

      fetchPastReports();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto relative z-10">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Analyze Repository</h1>
        <p className="text-gray-400">Enter a GitHub repository URL to search for deleted logic and safeguards.</p>
      </div>

      <form onSubmit={handleAnalyze} className="mb-16 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="block w-full pl-12 pr-4 py-4 bg-[#0a0a12]/80 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-[inset_0_0_20px_rgba(34,211,238,0.02)]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !repoUrl}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-cyan-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] min-w-[180px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Ghosts'}
          </button>
        </div>
      </form>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-5 rounded-2xl mb-12 flex items-start gap-3 max-w-3xl mx-auto shadow-[0_0_20px_rgba(244,63,94,0.1)]">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </motion.div>
      )}

      {noGhostsMessage && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a12]/80 backdrop-blur-xl border border-cyan-500/30 p-10 rounded-3xl text-center max-w-3xl mx-auto mb-12 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
            <CheckCircle className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <h3 className="font-display text-2xl font-bold mb-2 text-white">No Ghosts Found</h3>
          <p className="text-gray-400">{noGhostsMessage}</p>
        </motion.div>
      )}

      {currentReport && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-20"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <h2 className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Forensic Report</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-mono text-gray-300">
                {currentReport.repoUrl}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0a0a12]/80 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-3xl shadow-[0_0_20px_rgba(34,211,238,0.05)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
              <div className="flex items-center gap-3 text-cyan-400 mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                  <Info className="w-5 h-5 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Purpose</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentReport.purpose}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0a0a12]/80 backdrop-blur-xl border border-purple-500/20 p-6 rounded-3xl shadow-[0_0_20px_rgba(168,85,247,0.05)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
              <div className="flex items-center gap-3 text-purple-400 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Search className="w-5 h-5 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Reason Deleted</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentReport.reasonDeleted}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0a0a12]/80 backdrop-blur-xl border border-fuchsia-500/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(217,70,239,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-rose-500"></div>
              <div className="flex items-center gap-3 text-fuchsia-400 mb-4">
                <div className="p-2 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/30 group-hover:bg-fuchsia-500/20 transition-colors">
                  <AlertTriangle className="w-5 h-5 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Risk Assessment</h3>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">
                {currentReport.risk}
              </p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
            <h3 className="font-display text-xl font-bold mb-4 text-white">Deleted Code Snippet</h3>
            <div className="bg-[#05050a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-x-auto shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50"></div>
              <pre className="text-[15px] text-rose-400 font-mono leading-loose">
                {currentReport.deletedCode}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}

      {pastReports.length > 0 && (
        <div className="border-t border-white/10 pt-12">
          <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-3 text-white">
            <Clock className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
            Past Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastReports.map((report) => {
              const isHighRisk = report.risk.toLowerCase().includes('high') || report.risk.toLowerCase().includes('critical');
              return (
                <div 
                  key={report.id} 
                  className="bg-[#0a0a12]/60 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-cyan-500/30 hover:bg-[#0a0a12]/90 transition-all cursor-pointer group shadow-lg" 
                  onClick={() => setCurrentReport(report)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-mono font-medium text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors">{report.repoUrl}</h3>
                    <span className="text-xs text-gray-500 font-mono">
                      {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-5 leading-relaxed">
                    {report.purpose}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className={`px-3 py-1 rounded-full border ${isHighRisk ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                      Risk: {report.risk.split(':')[0] || 'Assessed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
