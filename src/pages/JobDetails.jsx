import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/${id}`);

        if (!response.ok) {
          throw new Error("Job not found");
        }

        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error("Fetch job error:", error);
        setError(error.message || "Unable to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-gray-200
              border-t-blue-600
              dark:border-gray-700
              dark:border-t-blue-400
            "
          ></div>

          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading job...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl">⚠️</div>

        <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
          Job Not Found
        </h2>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {error || `Job #${id} could not be loaded.`}
        </p>

        <button
          onClick={() => navigate("/jobs")}
          className="
            mt-6
            rounded-lg
            bg-blue-600
            px-5
            py-3
            text-white
            transition
            hover:bg-blue-700
          "
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

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
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2">
            <button
              onClick={() => navigate("/jobs")}
              className="
                text-sm
                font-medium
                text-blue-600
                hover:text-blue-700
                dark:text-blue-400
                dark:hover:text-blue-300
              "
            >
              ← Back to Jobs
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Job Details
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Detailed information about Job #{job.id}
          </p>
        </div>

        <span
          className={`
            inline-flex
            w-fit
            items-center
            rounded-full
            border
            px-4
            py-2
            text-sm
            font-semibold
            ${getStatusStyle(job.status)}
          `}
        >
          {job.status || "UNKNOWN"}
        </span>
      </div>

      {/* Main Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <div
          className="
            rounded-2xl
            border border-gray-200
            bg-white
            p-6
            shadow-sm
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <h3 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
            Basic Information
          </h3>

          <div className="space-y-5">
            <DetailItem label="Job ID" value={`#${job.id}`} />

            <DetailItem label="Job Name" value={job.name || "Unnamed Job"} />

            <DetailItem label="Status" value={job.status || "UNKNOWN"} />

            <DetailItem label="Priority" value={job.priority ?? "—"} />

            <DetailItem label="Worker" value={job.workerId || "Not assigned"} />
          </div>
        </div>

        {/* Execution Information */}
        <div
          className="
            rounded-2xl
            border border-gray-200
            bg-white
            p-6
            shadow-sm
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <h3 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
            Execution Information
          </h3>

          <div className="space-y-5">
            <DetailItem label="Retry Count" value={job.retryCount ?? "0"} />

            <DetailItem label="Max Retries" value={job.maxRetries ?? "—"} />

            <DetailItem label="Scheduled At" value={job.scheduledAt || "—"} />

            <DetailItem label="Created At" value={job.createdAt || "—"} />

            <DetailItem label="Updated At" value={job.updatedAt || "—"} />
          </div>
        </div>

        {/* Payload */}
        <div
          className="
            rounded-2xl
            border border-gray-200
            bg-white
            p-6
            shadow-sm
            md:col-span-2
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <h3 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
            Payload
          </h3>

          <pre
            className="
              overflow-x-auto
              rounded-xl
              border border-gray-200
              bg-gray-50
              p-5
              font-mono
              text-sm
              leading-6
              text-gray-700
              dark:border-gray-700
              dark:bg-gray-900
              dark:text-gray-300
            "
          >
            {job.payload || "No payload"}
          </pre>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>

      <p className="mt-1 break-words font-medium text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default JobDetails;
