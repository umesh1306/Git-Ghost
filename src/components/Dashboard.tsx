import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { Search, Loader2, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Analyze Repository</h1>
        <p className="text-gray-400">Enter a GitHub repository URL to search for deleted logic and safeguards.</p>
      </div>

      <form onSubmit={handleAnalyze} className="mb-12 max-w-3xl mx-auto">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="block w-full pl-11 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !repoUrl}
            className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Ghosts'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-8 flex items-start gap-3 max-w-3xl mx-auto">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {noGhostsMessage && (
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center max-w-3xl mx-auto mb-12">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Ghosts Found</h3>
          <p className="text-gray-400">{noGhostsMessage}</p>
        </div>
      )}

      {currentReport && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Forensic Report</h2>
            <span className="text-sm text-gray-500">
              {currentReport.repoUrl}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <Info className="w-5 h-5" />
                <h3 className="font-semibold">Purpose</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentReport.purpose}
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <Search className="w-5 h-5" />
                <h3 className="font-semibold">Reason Deleted</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentReport.reasonDeleted}
              </p>
            </div>

            <div className="bg-gray-900 border border-rose-500/30 p-6 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <div className="flex items-center gap-2 text-rose-400 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">Risk Assessment</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentReport.risk}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Deleted Code Snippet</h3>
            <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm text-rose-400 font-mono">
                {currentReport.deletedCode}
              </pre>
            </div>
          </div>
        </motion.div>
      )}

      {pastReports.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-gray-400" />
            Past Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastReports.map((report) => (
              <div key={report.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-gray-700 transition-colors cursor-pointer" onClick={() => setCurrentReport(report)}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-emerald-400">{report.repoUrl}</h3>
                  <span className="text-xs text-gray-500">
                    {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {report.purpose}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${report.risk.toLowerCase().includes('none') || report.risk.toLowerCase().includes('low') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    Risk: {report.risk.split(':')[0] || 'Assessed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
