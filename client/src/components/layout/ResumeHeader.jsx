import { NavLink } from 'react-router-dom';

const ResumeHeader = () => {
  return (
    <div className="bg-white dark:bg-dark-900 border-b border-dark-200/50 dark:border-dark-800 py-4 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-dark-900 dark:text-white">Developer Resume Suite</h1>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">Build ATS-optimized resumes and review them against job descriptions</p>
          </div>
          <div className="flex gap-2 bg-dark-100 dark:bg-dark-800/50 p-1.5 rounded-xl border border-dark-200/50 dark:border-dark-700/50">
            <NavLink
              to="/resume/builder"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white dark:text-dark-950 shadow-sm'
                    : 'text-dark-600 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white'
                }`
              }
            >
              Resume Builder
            </NavLink>
            <NavLink
              to="/resume/reviewer"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white dark:text-dark-950 shadow-sm'
                    : 'text-dark-600 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white'
                }`
              }
            >
              ATS Reviewer
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeHeader;
