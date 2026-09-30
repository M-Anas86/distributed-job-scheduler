import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import JobSearchFilter from "../components/JobSearchFilter";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);

  const nameRef = useRef(null);
  const payloadRef = useRef(null);
  const scheduledAtRef = useRef(null);
  const priorityRef = useRef(null);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const getCurrentDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const startIndex = (currentPage - 1) * jobsPerPage;

  const endIndex = startIndex + jobsPerPage;

  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const [formData, setFormData] = useState({
    name: "",
    payload: "",
    scheduledAt: getCurrentDateTime(),
    priority: 1,
  });

  // =========================
  // Fetch Jobs
  // =========================
  const fetchJobs = () => {
    setLoading(true);

    fetch("http://localhost:8000/jobs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setFilteredJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch jobs error:", error);
        setError("Unable to load jobs");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // =========================
  // Open Create Job Modal
  // =========================
  const openCreateForm = () => {
    setError("");

    setFormData({
      name: "",
      payload: "",
      scheduledAt: getCurrentDateTime(),
      priority: 1,
    });

    setShowForm(true);
  };

  // =========================
  // Close Create Job Modal
  // =========================
  const closeCreateForm = () => {
    setShowForm(false);
    setError("");
  };

  // =========================
  // Focus First Input
  // =========================
  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
    }
  }, [showForm]);

  // =========================
  // ESC to Close Modal
  // =========================
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showForm) {
        closeCreateForm();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm]);

  // =========================
  // Handle Input
  // =========================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: name === "priority" ? Number(value) : value,
    });
  };

  // =========================
  // Handle Enter Navigation
  // =========================
  const handleKeyDown = (event, nextRef) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (nextRef) {
        nextRef.current?.focus();
      }
    }
  };

  // =========================
  // Create Job
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const response = await fetch("http://localhost:8000/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to create job");
      }

      await response.json();

      setFormData({
        name: "",
        payload: "",
        scheduledAt: getCurrentDateTime(),
        priority: 1,
      });

      setShowForm(false);

      fetchJobs();
    } catch (error) {
      console.error("Create job error:", error);

      setError(error.message || "Unable to create job");
    }
  };

  // =========================
  // Cancel Job
  // =========================
  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel Job ${id}?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`http://localhost:8000/jobs/${id}`, {
        method: "DELETE",
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Unable to cancel job");
      }

      alert(message);

      fetchJobs();
    } catch (error) {
      console.error("Cancel error:", error);

      setError(error.message || "Unable to cancel job");
    }
  };

  // =========================
  // Status Style
  // =========================
  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return `
          bg-green-50
          text-green-700
          border-green-200
          dark:bg-green-950/50
          dark:text-green-400
          dark:border-green-800
        `;

      case "RUNNING":
        return `
          bg-yellow-50
          text-yellow-700
          border-yellow-200
          dark:bg-yellow-950/50
          dark:text-yellow-400
          dark:border-yellow-800
        `;

      case "PENDING":
        return `
          bg-blue-50
          text-blue-700
          border-blue-200
          dark:bg-blue-950/50
          dark:text-blue-400
          dark:border-blue-800
        `;

      case "CANCELLED":
        return `
          bg-gray-100
          text-gray-700
          border-gray-200
          dark:bg-gray-800
          dark:text-gray-300
          dark:border-gray-700
        `;

      case "DEAD":
        return `
          bg-red-50
          text-red-700
          border-red-200
          dark:bg-red-950/50
          dark:text-red-400
          dark:border-red-800
        `;

      default:
        return `
          bg-gray-100
          text-gray-700
          border-gray-200
          dark:bg-gray-800
          dark:text-gray-300
          dark:border-gray-700
        `;
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
            Jobs
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Manage and monitor scheduled jobs.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
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
          + Create Job
        </button>
      </div>

      {/* =========================
          ERROR MESSAGE
      ========================= */}
      {error && !showForm && (
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
          CREATE JOB MODAL
      ========================= */}
      {showForm && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateForm();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-2xl
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-6
              shadow-2xl
              dark:border-gray-700
              dark:bg-gray-800
            "
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Job
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Fill the details and press Enter to move to the next field.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateForm}
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-xl
                  text-gray-500
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                  dark:text-gray-400
                  dark:hover:bg-gray-700
                  dark:hover:text-white
                "
              >
                ✕
              </button>
            </div>

            {/* Form Error */}
            {error && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-3
                  text-sm
                  text-red-700
                  dark:border-red-800
                  dark:bg-red-950/40
                  dark:text-red-400
                "
              >
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Job Name */}
              <div>
                <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
                  Job Name
                </label>

                <input
                  ref={nameRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={(event) => handleKeyDown(event, payloadRef)}
                  placeholder="e.g. Send Email"
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-gray-900
                    placeholder-gray-400
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    dark:border-gray-700
                    dark:bg-gray-900
                    dark:text-white
                    dark:placeholder-gray-500
                  "
                />
              </div>

              {/* Payload */}
              <div>
                <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
                  Payload
                </label>

                <textarea
                  ref={payloadRef}
                  name="payload"
                  value={formData.payload}
                  onChange={handleChange}
                  onKeyDown={(event) => handleKeyDown(event, scheduledAtRef)}
                  placeholder="Enter job payload"
                  required
                  rows="3"
                  className="
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-gray-900
                    placeholder-gray-400
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    dark:border-gray-700
                    dark:bg-gray-900
                    dark:text-white
                    dark:placeholder-gray-500
                  "
                />
              </div>

              {/* Scheduled At */}
              <div>
                <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
                  Scheduled At
                </label>

                <input
                  ref={scheduledAtRef}
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  onKeyDown={(event) => handleKeyDown(event, priorityRef)}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-gray-900
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    dark:border-gray-700
                    dark:bg-gray-900
                    dark:text-white
                  "
                />

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Current time is selected automatically. You can change it.
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>

                <input
                  ref={priorityRef}
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  min="1"
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-gray-900
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    dark:border-gray-700
                    dark:bg-gray-900
                    dark:text-white
                  "
                />
              </div>

              {/* Buttons */}
              <div
                className="
                  flex
                  justify-end
                  gap-3
                  border-t
                  border-gray-200
                  pt-5
                  dark:border-gray-700
                "
              >
                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-5
                    py-3
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-100
                    dark:border-gray-600
                    dark:bg-gray-700
                    dark:text-gray-200
                    dark:hover:bg-gray-600
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    rounded-lg
                    bg-green-600
                    px-5
                    py-3
                    font-medium
                    text-white
                    shadow-sm
                    transition
                    hover:bg-green-700
                    dark:bg-green-600
                    dark:hover:bg-green-500
                  "
                >
                  Create Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          JOBS TABLE
      ========================= */}

      <JobSearchFilter
        jobs={jobs}
        onFilter={(filtered) => {
          setFilteredJobs(filtered);
          setCurrentPage(1);
        }}
      />
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
        {/* Table Header */}
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
            All Jobs
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage all scheduled jobs
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-10 text-center">
            <div
              className="
                inline-block
                h-8
                w-8
                animate-spin
                rounded-full
                border-4
                border-gray-200
                border-t-indigo-500
                dark:border-gray-700
                dark:border-t-indigo-400
              "
            ></div>

            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading jobs...
            </p>
          </div>
        )}

        {/* No Jobs */}
        {!loading && jobs.length === 0 && (
          <div className="p-12 text-center">
            <div className="mb-3 text-4xl">📭</div>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              No jobs found
            </h4>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create a job to see it appear here.
            </p>
          </div>
        )}

        {/* Jobs */}
        {!loading && jobs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
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
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Worker</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
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

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between mb-3">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="
                      rounded-lg
                      border border-gray-300
                      bg-white
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-gray-700
                      hover:bg-gray-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      dark:border-gray-600
                      dark:bg-gray-800
                      dark:text-gray-200
                      dark:hover:bg-gray-700
                      ml-3
                    "
                >
                  ← Previous
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="
                      rounded-lg
                      border border-gray-300
                      bg-white
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-gray-700
                      hover:bg-gray-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      dark:border-gray-600
                      dark:bg-gray-800
                      dark:text-gray-200
                      dark:hover:bg-gray-700
                      mr-3
                    "
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
