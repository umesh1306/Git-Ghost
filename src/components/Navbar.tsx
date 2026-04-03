import { Ghost, Github, LogOut } from 'lucide-react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, githubProvider } from '../firebase';
import { Link } from 'react-router-dom';

export default function Navbar({ user }: { user: User | null }) {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
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
    <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
          <Ghost className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight text-white">GitGhost</span>
        </Link>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <img src={user.photoURL || ''} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-800" />
                <span className="hidden sm:inline">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
