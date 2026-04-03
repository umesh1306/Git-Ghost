import { Ghost, LogOut } from 'lucide-react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Link } from 'react-router-dom';

export default function Navbar({ user }: { user: User | null }) {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="border-b border-white/5 bg-[#030308]/60 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Ghost className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:text-purple-400 transition-colors" />
          <span className="font-display font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">GitGhost</span>
        </Link>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <img src={user.photoURL || ''} alt="Avatar" className="w-8 h-8 rounded-full border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]" />
                <span className="hidden sm:inline font-medium">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2 rounded-xl font-medium hover:bg-white/10 hover:border-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
