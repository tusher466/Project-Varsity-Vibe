import React, { useState } from 'react';
import { Lock, Shield, ArrowRight, X, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { googleSignIn, logoutGoogle } from '../services/googleAuth';
import { StorageService, DEFAULT_ADMIN_EMAIL } from '../services/storageService';
import { VarsityLogo } from './DIULogo';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (adminEmail?: string) => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  if (!isOpen) return null;

  const handleGoogleOwnerLogin = async () => {
    setError(null);
    try {
      setIsSigningInGoogle(true);
      const res = await googleSignIn();
      if (!res?.user) {
        // User closed or dismissed the popup
        setError('Sign-in window was closed before completion. Please keep the window open to verify your account.');
        return;
      }

      const email = res.user.email;
      if (!email) {
        await logoutGoogle();
        setError('Google account did not return an email address. Access cannot be verified.');
        return;
      }

      // STRICT VERIFICATION: Check against authorized admin emails
      if (StorageService.isAuthorizedAdmin(email)) {
        onAuthenticated(email);
        onClose();
      } else {
        // Log out immediately if unauthorized
        await logoutGoogle();
        setError(
          `Access Denied: "${email}" is not an authorized admin email. Only verified store owner email (${DEFAULT_ADMIN_EMAIL}) has access to the Owner Portal.`
        );
      }
    } catch (err: any) {
      console.error('Owner Google Sign-in error:', err);
      setError(err?.message || 'Google sign-in could not be completed. Please try again.');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#071D36] border border-[#0E3A6E] text-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 sm:p-8 space-y-6 relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2.5">
          <div className="flex justify-center mb-1">
            <VarsityLogo variant="crest" size="lg" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Verified Admin Access Only</span>
          </div>

          <h2 className="font-classic text-2xl font-black text-white mt-1">
            Store Owner Sign In
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            Passcode access is disabled for security. Access is strictly restricted to verified owner email addresses.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Authentication Verification Failed</span>
            </div>
            <p className="text-[11px] text-rose-200 leading-relaxed pl-6">
              {error}
            </p>
          </div>
        )}

        {/* Security Notice Box */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-[#0E3A6E] text-xs space-y-2">
          <div className="flex items-center gap-2 text-sky-300 font-bold text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authorized Owner Account</span>
          </div>
          <p className="font-mono text-xs text-emerald-300 bg-slate-950 px-3 py-2 rounded-xl border border-white/10 truncate font-bold">
            {DEFAULT_ADMIN_EMAIL}
          </p>
          <p className="text-[10px] text-slate-400">
            Sign in with the verified Google account matching this address to manage jersey uploads and sync orders with Google Sheets.
          </p>
        </div>

        {/* Google Sign In Button */}
        <div>
          <button
            type="button"
            disabled={isSigningInGoogle}
            onClick={handleGoogleOwnerLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xl transition cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>
              {isSigningInGoogle ? 'Verifying Admin Email...' : 'Sign In with Verified Google Mail'}
            </span>
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel & Return to Student Store
          </button>
        </div>
      </div>
    </div>
  );
};
