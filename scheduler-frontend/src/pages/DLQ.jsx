import { useEffect, useState } from "react";

function DLQ() {
  const [deadJobs, setDeadJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // Fetch Dead Jobs
  // =========================
  const fetchDeadJobs = async () => {
    try {
      const response = await fetch("http://localhost:8000/jobs/dead");

      if (!response.ok) {
        throw new Error("Failed to fetch dead jobs");
      }

      const data = await response.json();

      setDeadJobs(data);
      setError("");
      setLoading(false);
    } catch (error) {
      console.error("Fetch DLQ error:", error);
      setError("Unable to load dead jobs");
      setLoading(false);
    }
  };

  // =========================
  // Auto Refresh
  // =========================
  useEffect(() => {
    fetchDeadJobs();

    const interval = setInterval(() => {
      fetchDeadJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // Retry Job
  // =========================
  const handleRetry = async (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to retry Job ${id}?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`http://localhost:8000/jobs/${id}/retry`, {
        method: "POST",
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to retry job");
      }

      alert(message);

      fetchDeadJobs();
    } catch (error) {
      console.error("Retry job error:", error);

      setError(error.message || "Unable to retry job");
    }
  };

  return (
    <div
      className="
        min-h-screen
        w-full
        bg-gray-100
        text-gray-900
        transition-colors
        duration-200
        dark:bg-gray-950
        dark:text-gray-100
      "
    >
      {/* =========================
          HEADER
      ========================= */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dead Letter Queue
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            View failed jobs and retry them.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDeadJobs}
          className="
            rounded-lg
            bg-blue-600
            px-5
            py-3
            text-white
            shadow-sm
            transition
            hover:bg-blue-700
            dark:bg-blue-600
            dark:hover:bg-blue-500
          "
        >
          Refresh
        </button>
      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div
          className="
            mb-6
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            text-red-700
            dark:border-red-800
            dark:bg-red-950/40
            dark:text-red-400
          "
        >
          <div className="flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}
      {loading && (
        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                h-6
                w-6
                animate-spin
                rounded-full
                border-4
                border-gray-200
                border-t-blue-500
                dark:border-gray-700
                dark:border-t-blue-400
              "
            ></div>

            <p className="text-gray-500 dark:text-gray-400">
              Loading dead jobs...
            </p>
          </div>
        </div>
      )}

      {/* =========================
          EMPTY DLQ
      ========================= */}
      {!loading && deadJobs.length === 0 && (
        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-10
            text-center
            shadow-sm
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <div className="mb-4 text-5xl">✓</div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            DLQ is empty
          </h3>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            There are no permanently failed jobs.
          </p>
        </div>
      )}

      {/* =========================
          DEAD JOBS TABLE
      ========================= */}
      {!loading && deadJobs.length > 0 && (
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
            transition-colors
            duration-200
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          {/* Card Header */}
          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-gray-200
              px-6
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              dark:border-gray-700
            "
          >
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Dead Jobs
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Jobs that exceeded their maximum retry count.
              </p>
            </div>

            <span
              className="
                inline-flex
                w-fit
                items-center
                rounded-full
                border
                border-red-200
                bg-red-50
                px-3
                py-1.5
                text-sm
                font-semibold
                text-red-700
                dark:border-red-800
                dark:bg-red-950/50
                dark:text-red-400
              "
            >
              {deadJobs.length} Dead
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              {/* Table Header */}
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr
                  className="
                    border-b
                    border-gray-200
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-500
                    dark:border-gray-700
                    dark:text-gray-400
                  "
                >
                  <th className="px-6 py-4 font-semibold">ID</th>

                  <th className="px-6 py-4 font-semibold">Job Name</th>

                  <th className="px-6 py-4 font-semibold">Payload</th>

                  <th className="px-6 py-4 font-semibold">Retry Count</th>

                  <th className="px-6 py-4 font-semibold">Max Retries</th>

                  <th className="px-6 py-4 font-semibold">Status</th>

                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {deadJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="
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
                      <span
                        className="
                          font-mono
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-200
                        "
                      >
                        #{job.id}
                      </span>
                    </td>

                    {/* Job Name */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {job.name || "Unnamed Job"}
                      </span>
                    </td>

                    {/* Payload */}
                    <td className="max-w-xs px-6 py-4">
                      <span
                        className="
                          block
                          max-w-xs
                          truncate
                          text-sm
                          text-gray-600
                          dark:text-gray-400
                        "
                        title={job.payload}
                      >
                        {job.payload}
                      </span>
                    </td>

                    {/* Retry Count */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {job.retryCount}
                      </span>
                    </td>

                    {/* Max Retries */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {job.maxRetries}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className="
                          inline-flex
                          items-center
                          rounded-full
                          border
                          border-red-200
                          bg-red-50
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          text-red-700
                          dark:border-red-800
                          dark:bg-red-950/50
                          dark:text-red-400
                        "
                      >
                        <span className="mr-2 h-2 w-2 rounded-full bg-red-500"></span>
                        DEAD
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleRetry(job.id)}
                        className="
                          rounded-lg
                          bg-green-600
                          px-3
                          py-2
                          text-white
                          shadow-sm
                          transition
                          hover:bg-green-700
                          dark:bg-green-600
                          dark:hover:bg-green-500
                        "
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DLQ;
