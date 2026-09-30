import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/jobs";
import Workers from "./pages/Workers";
import DLQ from "./pages/DLQ";
import JobDetails from "./pages/JobDetails";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
  };

  return (
    <BrowserRouter>
      <div className={darkMode ? "dark" : ""}>
        <div
          className="
            flex
            h-screen
            overflow-hidden
            bg-gray-100 dark:bg-gray-950
            text-gray-900 dark:text-gray-100
            transition-colors duration-200
          "
        >
          {/* Sidebar */}
          <aside
            className="
              w-64
              shrink-0
              h-screen
              bg-white dark:bg-gray-900
              border-r border-gray-200 dark:border-gray-800
              p-6
              transition-colors duration-200
            "
          >
            <h1 className="text-2xl font-bold mb-10 text-gray-900 dark:text-white">
              Job Scheduler
            </h1>

            <nav className="space-y-3">
              <Link
                to="/"
                className="
                  block px-4 py-3 rounded-lg
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition
                "
              >
                Dashboard
              </Link>

              <Link
                to="/jobs"
                className="
                  block px-4 py-3 rounded-lg
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition
                "
              >
                Jobs
              </Link>

              <Link
                to="/workers"
                className="
                  block px-4 py-3 rounded-lg
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition
                "
              >
                Workers
              </Link>

              <Link
                to="/dlq"
                className="
                  block px-4 py-3 rounded-lg
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition
                "
              >
                DLQ
              </Link>
            </nav>
          </aside>

          {/* Main Content - ONLY THIS AREA SCROLLS */}
          <main
            className="
              flex-1
              min-w-0
              h-screen
              overflow-y-auto
              p-8
              transition-colors duration-200
            "
          >
            {/* Theme Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={toggleTheme}
                className="
                  flex items-center gap-2
                  px-4 py-2.5
                  rounded-lg
                  bg-white dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  shadow-sm
                  transition
                "
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/dlq" element={<DLQ />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
