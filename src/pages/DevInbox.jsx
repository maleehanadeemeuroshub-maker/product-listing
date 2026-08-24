import { useEffect, useState } from "react";
import { Mail, Inbox } from "lucide-react";
import { getDevInbox } from "../services/email";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function DevInbox() {
  const [emails, setEmails] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  function load() {
    setError(null);
    setEmails(null);
    getDevInbox()
      .then((data) => {
        setEmails(data);
        setSelected(data[0] || null);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-base-100 sm:text-3xl">
          Dev Email <span className="text-gradient">Inbox</span>
        </h1>
        <p className="mt-1 text-sm text-base-400">
          Every email Shoply "sends" is recorded here so the full auth &amp; order flow can be tested locally.
          Add a <code className="rounded bg-overlay/5 px-1.5 py-0.5 text-xs">RESEND_API_KEY</code> to <code className="rounded bg-overlay/5 px-1.5 py-0.5 text-xs">.env</code> to also deliver these for real.
        </p>
      </div>

      {emails === null && !error ? (
        <LoadingSkeleton count={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : emails.length === 0 ? (
        <EmptyState icon={Inbox} title="No emails yet" message="Register, log in, or place an order to see emails appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-2 lg:col-span-1">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelected(email)}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                  selected?.id === email.id
                    ? "border-accent-500/50 bg-accent-500/10"
                    : "border-overlay/8 bg-base-900 hover:border-overlay/20"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-base-100">
                    <Mail size={13} className="shrink-0 text-accent-400" />
                    {email.subject}
                  </span>
                  {email.delivered && (
                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      SENT
                    </span>
                  )}
                </div>
                <span className="truncate text-xs text-base-400">to {email.to}</span>
                <span className="text-[11px] text-base-400">{new Date(email.createdAt).toLocaleString()}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected && (
              <iframe
                title="Email preview"
                srcDoc={selected.html}
                sandbox=""
                className="h-[600px] w-full rounded-xl border border-overlay/8 bg-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
