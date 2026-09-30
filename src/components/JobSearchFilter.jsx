import { useState } from "react";

function JobSearchFilter({ jobs, onFilter }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    applyFilter(value, status);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);

    applyFilter(search, value);
  };

  const applyFilter = (searchValue, statusValue) => {
    const filtered = jobs.filter((job) => {
      // Search by Job ID or Job Name
      const searchText = searchValue.toLowerCase().trim();

      const matchesSearch =
        searchText === "" ||
        String(job.id).toLowerCase().includes(searchText) ||
        (job.name || "").toLowerCase().includes(searchText);

      // Filter by status
      const matchesStatus =
        statusValue === "ALL" ||
        (job.status || "").toUpperCase() === statusValue;

      return matchesSearch && matchesStatus;
    });

    onFilter(filtered);
  };

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <span
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-400
            dark:text-gray-500
          "
        >
          🔍
        </span>

        <input
          type="text"
          placeholder="Search by Job ID or Job Name..."
          value={search}
          onChange={handleSearchChange}
          className="
            w-full
            rounded-lg
            border border-gray-300
            bg-white
            py-3
            pl-11
            pr-4
            text-gray-900
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            dark:border-gray-600
            dark:bg-gray-800
            dark:text-white
            dark:placeholder:text-gray-500
            dark:focus:border-blue-400
          "
        />
      </div>

      {/* Status Filter */}
      <div className="w-full md:w-52">
        <select
          value={status}
          onChange={handleStatusChange}
          className="
            w-full
            rounded-lg
            border border-gray-300
            bg-white
            px-4
            py-3
            text-gray-900
            outline-none
            transition
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            dark:border-gray-600
            dark:bg-gray-800
            dark:text-white
            dark:focus:border-blue-400
          "
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="RUNNING">Running</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="DEAD">Dead</option>
        </select>
      </div>
    </div>
  );
}

export default JobSearchFilter;
