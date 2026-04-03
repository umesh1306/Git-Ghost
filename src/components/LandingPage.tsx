import { motion } from 'motion/react';
import { Search, ShieldAlert, GitCommit, ArrowRight, Sparkles } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function LandingPage() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center pt-12 pb-24 relative">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mb-24 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-8 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          Forensic AI for Git History
        </div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-purple-400 drop-shadow-sm leading-tight">
          Recovering the logic that time forgot.
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
          Deleted safeguards vanish unnoticed. GitGhost resurrects them with AI, analyzing your repository's history to find critical logic that was accidentally or maliciously removed.
        </p>
        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-cyan-400 hover:to-purple-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)] border border-white/10"
        >
          Start Analyzing Ghosts
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </motion.div>

      {/* Workflow Section */}
      <div className="w-full max-w-5xl mb-32 relative z-10">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">How GitGhost Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-cyan-500/0 via-purple-500/50 to-fuchsia-500/0 -z-10 transform -translate-y-1/2 blur-[1px]"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl text-center relative shadow-xl hover:border-cyan-500/30 transition-colors group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
              <GitCommit className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="font-display font-bold text-xl mb-3 text-white">1. Connect Repo</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Link your GitHub repository securely via OAuth to grant read access to your commit history.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a12]/80 backdrop-blur-xl border border-purple-500/30 p-8 rounded-3xl text-center relative shadow-[0_0_30px_-15px_rgba(168,85,247,0.4)] hover:border-purple-400/50 transition-colors group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/50 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
              <Search className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </div>
            <h3 className="font-display font-bold text-xl mb-3 text-white">2. Extract Ghosts</h3>
            <p className="text-gray-400 text-sm leading-relaxed">We scan recent commits, isolating deleted lines of code and logic that might be critical.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl text-center relative shadow-xl hover:border-fuchsia-500/30 transition-colors group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-8 h-8 text-fuchsia-400" />
            </div>
            <h3 className="font-display font-bold text-xl mb-3 text-white">3. AI Analysis</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Gemini AI evaluates the removed code, assessing the risk and purpose of the deletion.</p>
          </motion.div>
        </div>
      </div>

      {/* Example Report */}
      <div className="w-full max-w-4xl relative z-10">
        <h2 className="font-display text-3xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Example Forensic Report</h2>
        <div className="bg-[#05050a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden font-mono text-sm shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5),0_0_30px_-10px_rgba(34,211,238,0.15)] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500"></div>
          <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
            </div>
            <span className="ml-2 text-gray-400 font-sans text-xs font-medium tracking-wider">ghost_report.json</span>
          </div>
          <div className="p-8 text-gray-300 overflow-x-auto leading-loose text-[15px]">
            <pre>
<span className="text-cyan-400">{"{"}</span>
  <span className="text-purple-300">"repo"</span>: <span className="text-amber-200">"github.com/company/core-api"</span>,
  <span className="text-purple-300">"deleted_code"</span>: <span className="text-amber-200">"if (!user.isVerified) throw Error('Unauthorized');"</span>,
  <span className="text-purple-300">"analysis"</span>: <span className="text-cyan-400">{"{"}</span>
    <span className="text-purple-300">"purpose"</span>: <span className="text-amber-200">"User validation safeguard before processing payments"</span>,
    <span className="text-purple-300">"reason_deleted"</span>: <span className="text-amber-200">"Assumed redundant during refactoring of auth middleware"</span>,
    <span className="text-purple-300">"risk"</span>: <span className="text-rose-400 font-bold drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">"CRITICAL: Unverified users can now initiate transactions"</span>
  <span className="text-cyan-400">{"}"}</span>,
  <span className="text-purple-300">"timestamp"</span>: <span className="text-amber-200">"2026-04-03T20:12:00Z"</span>
<span className="text-cyan-400">{"}"}</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
