import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, BadgeCheck } from "lucide-react";
import { verifyEmail } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, updateUser } = useAuth();

  const [status, setStatus] = useState("loading"); // loading | success | already | error | expired
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    verifyEmail(token)
      .then((data) => {
        if (data.alreadyVerified) {
          setStatus("already");
        } else {
          setStatus("success");
          if (user) updateUser({ emailVerified: true });
        }
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus(err.data?.expired ? "expired" : "error");
        setMessage(err.message || "This verification link is invalid.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const content = {
    loading: {
      icon: <Loader2 size={32} className="animate-spin text-accent-400" />,
      title: "Verifying your email...",
      body: "Hang tight, this only takes a second.",
    },
    success: {
      icon: <CheckCircle2 size={32} className="text-emerald-400" />,
      title: "Email verified!",
      body: message || "Your account is now fully activated.",
    },
    already: {
      icon: <BadgeCheck size={32} className="text-accent2-400" />,
      title: "Already verified",
      body: message || "Your email was already verified.",
    },
    expired: {
      icon: <XCircle size={32} className="text-amber-400" />,
      title: "Link expired",
      body: "This verification link has expired. Log in and resend a fresh one from your profile.",
    },
    error: {
      icon: <XCircle size={32} className="text-red-400" />,
      title: "Verification failed",
      body: message || "This verification link is invalid.",
    },
  }[status];

  return (
    <div className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass relative z-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl p-8 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-overlay/5"
        >
          {content.icon}
        </motion.span>
        <h1 className="text-xl font-extrabold text-base-100">{content.title}</h1>
        <p className="text-sm text-base-400">{content.body}</p>

        {status !== "loading" && (
          <Link
            to="/login"
            className="mt-2 w-full rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Continue to Login
          </Link>
        )}
      </motion.div>
    </div>
  );
}
