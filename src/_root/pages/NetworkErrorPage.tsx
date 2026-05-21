import { useUserContext } from "@/context/AuthContext";
import { Spinner } from "@nextui-org/react";
import { ArrowLeft, RefreshCcw, Router, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NetworkErrorPage() {
  const navigate = useNavigate();
  const { checkAuthUser, setInternetError } = useUserContext();
  const [isChecking, setIsChecking] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const retryConnection = async () => {
    if (!navigator.onLine) return;

    setIsChecking(true);
    const isAuthenticated = await checkAuthUser();
    setIsChecking(false);

    if (isAuthenticated || navigator.onLine) {
      setIsRestored(true);
      setInternetError(null);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsRestored(true);
      retryConnection();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <main className="grid min-h-screen w-full place-items-center overflow-hidden bg-dark-1 px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(135,126,255,0.22),transparent_24rem),radial-gradient(circle_at_85%_75%,rgba(93,95,239,0.16),transparent_28rem)]" />

      <section className="content-panel relative w-full max-w-5xl overflow-hidden rounded-[2rem]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="p-6 md:p-10">
            <span className={`inline-flex rounded-full border px-3 py-1 small-semibold ${isRestored ? "border-green-400/20 bg-green-400/10 text-green-300" : "border-red/20 bg-red/10 text-red"}`}>
              {isRestored ? "Connection restored" : "Network unavailable"}
            </span>

            <h1 className="mt-5 max-w-2xl text-[2rem] font-bold leading-tight md:text-[3rem]">
              {isRestored ? "You are back online." : "Postgram cannot reach the server."}
            </h1>
            <p className="mt-4 max-w-2xl text-light-3 base-regular">
              {isRestored
                ? "Your connection is responding again. You can retry the app or return to the page you were viewing."
                : "Check your Wi-Fi or mobile data. We will keep your session safe while the connection is unstable."}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={retryConnection}
                disabled={isChecking}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 py-3 small-semibold text-white transition hover:bg-primary-600 disabled:opacity-60"
              >
                {isChecking ? <Spinner size="sm" color="white" /> : <RefreshCcw size={18} />}
                {isChecking ? "Checking..." : "Retry connection"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setInternetError(null);
                  navigate("/", { replace: true });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dark-4 bg-dark-3 px-5 py-3 small-semibold text-light-1 transition hover:bg-dark-4"
              >
                <ArrowLeft size={18} />
                Go home
              </button>
            </div>
          </div>

          <aside className="border-t border-dark-4 bg-dark-2/70 p-6 md:p-8 lg:border-l lg:border-t-0">
            <div className={`mx-auto grid h-24 w-24 place-items-center rounded-[2rem] ${isRestored ? "bg-green-400/10 text-green-300" : "bg-red/10 text-red"}`}>
              {isRestored ? <Router size={42} /> : <WifiOff size={42} />}
            </div>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-dark-4 bg-dark-3/70 p-4">
                <p className="small-semibold text-light-1">Status</p>
                <p className="mt-1 text-light-3 small-regular">{navigator.onLine ? "Browser reports online" : "Browser reports offline"}</p>
              </div>
              <div className="rounded-2xl border border-dark-4 bg-dark-3/70 p-4">
                <p className="small-semibold text-light-1">What to try</p>
                <p className="mt-1 text-light-3 small-regular">Reconnect your network, restart the backend server, then retry this page.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
