import { useEffect, useState } from "react";

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/workers`);

      if (!response.ok) {
        throw new Error("Failed to fetch workers");
      }

      const data = await response.json();

      setWorkers(data);
      setError("");
      setLoading(false);
    } catch (error) {
      console.error("Fetch workers error:", error);
      setError("Unable to load workers");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();

    const interval = setInterval(() => {
      fetchWorkers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isWorkerActive = (lastHeartbeat) => {
    const heartbeatTime = new Date(lastHeartbeat).getTime();
    const currentTime = new Date().getTime();

    const difference = currentTime - heartbeatTime;

    return difference <= 10000;
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
            Workers
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Monitor worker health and heartbeat status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchWorkers}
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
              Loading workers...
            </p>
          </div>
        </div>
      )}

      {/* =========================
          NO WORKERS
      ========================= */}
      {!loading && workers.length === 0 && (
        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-8
            text-center
            shadow-sm
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <div className="mb-3 text-4xl">🖥️</div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            No workers found
          </h3>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No scheduler workers are currently registered.
          </p>
        </div>
      )}

      {/* =========================
          WORKERS TABLE
      ========================= */}
      {!loading && workers.length > 0 && (
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
              border-b
              border-gray-200
              px-6
              py-5
              dark:border-gray-700
            "
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Worker Status
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Workers are automatically refreshed every 5 seconds.
            </p>
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
                  <th className="px-6 py-4 font-semibold">Worker ID</th>

                  <th className="px-6 py-4 font-semibold">Status</th>

                  <th className="px-6 py-4 font-semibold">Running Jobs</th>

                  <th className="px-6 py-4 font-semibold">Last Heartbeat</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {workers.map((worker) => {
                  const active = isWorkerActive(worker.lastHeartbeat);

                  return (
                    <tr
                      key={worker.workerId}
                      className="
                        border-b
                        border-gray-100
                        transition
                        hover:bg-gray-50
                        dark:border-gray-700
                        dark:hover:bg-gray-700/50
                      "
                    >
                      {/* Worker ID */}
                      <td className="px-6 py-4">
                        <span
                          className="
                            rounded-md
                            bg-gray-100
                            px-2.5
                            py-1
                            font-mono
                            text-sm
                            font-semibold
                            text-gray-700
                            dark:bg-gray-700
                            dark:text-gray-200
                          "
                        >
                          {worker.workerId}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {active ? (
                          <span
                            className="
                              inline-flex
                              items-center
                              rounded-full
                              border
                              border-green-200
                              bg-green-50
                              px-3
                              py-1.5
                              text-xs
                              font-semibold
                              text-green-700
                              dark:border-green-800
                              dark:bg-green-950/50
                              dark:text-green-400
                            "
                          >
                            <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            ACTIVE
                          </span>
                        ) : (
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
                            STALE
                          </span>
                        )}
                      </td>

                      {/* Running Jobs */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {worker.runningJobs}
                        </span>
                      </td>

                      {/* Last Heartbeat */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {new Date(worker.lastHeartbeat).toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workers;
