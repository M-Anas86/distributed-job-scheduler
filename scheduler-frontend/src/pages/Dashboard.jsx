import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  // =========================
  // Fetch Jobs
  // =========================
  const fetchJobs = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/jobs?_=${Date.now()}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      setJobs(data);
      setError("");
      setLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setError("Unable to connect to Job Scheduler backend");
      setLoading(false);
    }
  };

  // =========================
  // Auto Refresh
  // =========================
  useEffect(() => {
    fetchJobs();

    const intervalId = setInterval(() => {
      fetchJobs();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // =========================
  // Statistics
  // =========================
  const totalJobs = jobs.length;

  const pendingJobs = jobs.filter((job) => job.status === "PENDING").length;

  const runningJobs = jobs.filter((job) => job.status === "RUNNING").length;

  const completedJobs = jobs.filter((job) => job.status === "COMPLETED").length;

  const cancelledJobs = jobs.filter((job) => job.status === "CANCELLED").length;

  const deadJobs = jobs.filter((job) => job.status === "DEAD").length;

  const stats = [
    {
      title: "Total Jobs",
      value: totalJobs,
      icon: "📊",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/60",
      text: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Pending",
      value: pendingJobs,
      icon: "⏳",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      iconBg: "bg-blue-100 dark:bg-blue-900/60",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Running",
      value: runningJobs,
      icon: "⚡",
      bg: "bg-yellow-50 dark:bg-yellow-950/40",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/60",
      text: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Completed",
      value: completedJobs,
      icon: "✓",
      bg: "bg-green-50 dark:bg-green-950/40",
      iconBg: "bg-green-100 dark:bg-green-900/60",
      text: "text-green-600 dark:text-green-400",
    },
    {
      title: "Cancelled",
      value: cancelledJobs,
      icon: "⊘",
      bg: "bg-gray-50 dark:bg-gray-800",
      iconBg: "bg-gray-200 dark:bg-gray-700",
      text: "text-gray-600 dark:text-gray-300",
    },
    {
      title: "Dead",
      value: deadJobs,
      icon: "⚠",
      bg: "bg-red-50 dark:bg-red-950/40",
      iconBg: "bg-red-100 dark:bg-red-900/60",
      text: "text-red-600 dark:text-red-400",
    },
  ];

  // =========================
  // Status Style
  // =========================
  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800";

      case "RUNNING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800";

      case "PENDING":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800";

      case "CANCELLED":
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";

      case "DEAD":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  // =========================
  // Status Dot
  // =========================
  const getStatusDot = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";

      case "RUNNING":
        return "bg-yellow-500 animate-pulse";

      case "PENDING":
        return "bg-blue-500";

      case "CANCELLED":
        return "bg-gray-500";

      case "DEAD":
        return "bg-red-500";

      default:
        return "bg-gray-400";
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 p-3">
      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h2>

            {/* LIVE */}
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Monitor and manage your distributed job scheduler
          </p>
        </div>

        {/* Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="
      flex items-center justify-center gap-2
      px-4 py-2.5
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      text-gray-700 dark:text-gray-200
      rounded-lg
      shadow-sm
      hover:bg-gray-50 dark:hover:bg-gray-700
      transition
    "
          >
            <span>↻</span>
            Refresh
          </button>
        </div>
      </div>

      {/* =========================
          CONNECTION ERROR
      ========================= */}

      {error && (
        <div
          className="
            flex items-center gap-3
            bg-red-50 dark:bg-red-950/40
            border border-red-200 dark:border-red-800
            text-red-700 dark:text-red-400
            px-4 py-3
            rounded-xl
            mb-6
          "
        >
          <span className="text-lg">⚠</span>

          <div>
            <p className="font-semibold">Connection Error</p>

            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* =========================
          STATISTICS
      ========================= */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-6
          gap-4
        "
      >
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`
              ${stat.bg}
              rounded-2xl
              border border-white dark:border-gray-700
              p-5
              shadow-sm
              hover:shadow-md
              transition
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>

                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? "—" : stat.value}
                </h3>
              </div>

              <div
                className={`
                  w-11 h-11
                  ${stat.iconBg}
                  ${stat.text}
                  rounded-xl
                  flex items-center justify-center
                  text-xl
                  font-bold
                `}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          RECENT JOBS
      ========================= */}

      <div
        className="
          bg-white dark:bg-gray-800
          rounded-2xl
          shadow-sm
          border border-gray-100 dark:border-gray-700
          mt-8
          overflow-hidden
        "
      >
        {/* Table Header */}

        <div
          className="
            px-6 py-5
            border-b border-gray-100 dark:border-gray-700
            flex flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-3
          "
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Jobs
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Latest jobs processed by your workers
            </p>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Updating..."}
          </div>
        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (
          <div className="p-10 text-center">
            <div
              className="
                inline-block
                w-8 h-8
                border-4
                border-gray-200 dark:border-gray-700
                border-t-indigo-500
                rounded-full
                animate-spin
              "
            ></div>

            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Loading jobs...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          /* =========================
             EMPTY
          ========================= */

          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              No jobs found
            </h4>

            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Create a job to see it appear here.
            </p>
          </div>
        ) : (
          /* =========================
             TABLE
          ========================= */

          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Head */}

              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr
                  className="
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-500 dark:text-gray-400
                  "
                >
                  <th className="px-6 py-4 font-semibold">ID</th>

                  <th className="px-6 py-4 font-semibold">Job</th>

                  <th className="px-6 py-4 font-semibold">Status</th>

                  <th className="px-6 py-4 font-semibold">Worker</th>

                  <th className="px-6 py-4 font-semibold">Retry</th>

                  <th className="px-6 py-4 font-semibold">Created</th>
                </tr>
              </thead>

              {/* Table Body */}

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {jobs.slice(0, 10).map((job) => (
                  <tr
                    key={job.id}
                    onClick={() =>
                      navigate(`/jobs/${job.id}`, { state: { job } })
                    }
                    className="
        cursor-pointer
        border-b
        border-gray-100
        transition
        hover:bg-gray-50
        dark:border-gray-700
        dark:hover:bg-gray-700/50
      "
                  >
                    {/* ID */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                        #{job.id}
                      </span>
                    </td>

                    {/* Job Name */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {job.name || "Unnamed Job"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`
            inline-flex
            items-center
            gap-2
            px-3 py-1.5
            rounded-full
            border
            text-xs
            font-semibold
            ${getStatusStyle(job.status)}
          `}
                      >
                        <span
                          className={`
              w-2 h-2
              rounded-full
              ${getStatusDot(job.status)}
            `}
                        ></span>
                        {job.status || "UNKNOWN"}
                      </span>
                    </td>

                    {/* Worker */}
                    <td className="px-6 py-4">
                      {job.workerId ? (
                        <span
                          className="
              inline-flex
              items-center
              px-2.5 py-1
              rounded-md
              bg-gray-100 dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              text-sm
              font-mono
            "
                        >
                          {job.workerId}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Retry */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {job.retryCount ?? 0}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleString()
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          FOOTER
      ========================= */}

      <div
        className="
          mt-5
          flex flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          text-sm
          text-gray-400
          gap-2
        "
      >
        <p>Dashboard automatically refreshes every 5 seconds</p>

        <p>Distributed Job Scheduler</p>
      </div>
    </div>
  );
}

export default Dashboard;
