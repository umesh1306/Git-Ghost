import { motion } from 'motion/react';
import { Github, Search, ShieldAlert, GitCommit, ArrowRight } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, githubProvider } from '../firebase';

export default function LandingPage() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center pt-12 pb-24">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mb-24"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Forensic AI for Git History
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
          Recovering the logic that time forgot.
        </h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          Deleted safeguards vanish unnoticed. GitGhost resurrects them with AI, analyzing your repository's history to find critical logic that was accidentally or maliciously removed.
        </p>
        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
        >
          <Github className="w-6 h-6" />
          Start Analyzing Ghosts
        </button>
      </motion.div>

      {/* Workflow Section */}
      <div className="w-full max-w-5xl mb-24">
        <h2 className="text-2xl font-bold text-center mb-12">How GitGhost Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-gray-800 via-emerald-500/50 to-gray-800 -z-10 transform -translate-y-1/2"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center relative"
          >
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <GitCommit className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Connect Repo</h3>
            <p className="text-gray-400 text-sm">Link your GitHub repository securely via OAuth.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-emerald-500/30 p-6 rounded-2xl text-center relative shadow-[0_0_30px_-15px_rgba(16,185,129,0.3)]"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
              <Search className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">2. Extract Ghosts</h3>
            <p className="text-gray-400 text-sm">We scan recent commits for deleted lines of code and logic.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center relative"
          >
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">3. AI Analysis</h3>
            <p className="text-gray-400 text-sm">Gemini AI evaluates the risk and purpose of the removed code.</p>
          </motion.div>
        </div>
      </div>

      {/* Example Report */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-8">Example Forensic Report</h2>
        <div className="bg-[#0d1117] border border-gray-800 rounded-xl overflow-hidden font-mono text-sm shadow-2xl">
          <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="ml-2 text-gray-500">ghost_report.json</span>
          </div>
          <div className="p-6 text-gray-300 overflow-x-auto">
            <pre>
<span className="text-emerald-400">{"{"}</span>
  <span className="text-blue-400">"repo"</span>: <span className="text-amber-300">"github.com/company/core-api"</span>,
  <span className="text-blue-400">"deleted_code"</span>: <span className="text-amber-300">"if (!user.isVerified) throw Error('Unauthorized');"</span>,
  <span className="text-blue-400">"analysis"</span>: <span className="text-emerald-400">{"{"}</span>
    <span className="text-blue-400">"purpose"</span>: <span className="text-amber-300">"User validation safeguard before processing payments"</span>,
    <span className="text-blue-400">"reason_deleted"</span>: <span className="text-amber-300">"Assumed redundant during refactoring of auth middleware"</span>,
    <span className="text-blue-400">"risk"</span>: <span className="text-rose-400">"CRITICAL: Unverified users can now initiate transactions"</span>
  <span className="text-emerald-400">{"}"}</span>,
  <span className="text-blue-400">"timestamp"</span>: <span className="text-amber-300">"2026-04-03T20:12:00Z"</span>
<span className="text-emerald-400">{"}"}</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
