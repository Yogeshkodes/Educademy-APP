import { useState } from "react";

const TestLoginTooltip = ({ userType }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const credentials = {
    student: {
      email: "yadavyogesh0712@gmail.com",
      password: "123456",
    },
    instructor: {
      email: "starkronaldo6@gmail.com",
      password: "123456",
    },
  };

  return (
    <div className="relative inline-block ml-2">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="text-sm text-richblack-300 hover:text-yellow-50"
      >
        <span>ℹ️</span>
      </button>

      {showTooltip && (
        <div className="absolute z-50 w-50 p-3 text-sm bg-richblack-800 border border-richblack-700 rounded-lg shadow-lg -right-2 top-8">
          <p className="font-semibold mb-2 text-richblack-5">
            Test Credentials: For testing purpose only
          </p>
          <p className="text-richblack-100">
            Email: {credentials[userType].email}
          </p>
          <p className="text-richblack-100">
            Password: {credentials[userType].password}
          </p>

          {/* Tooltip arrow */}
          <div className="absolute w-2 h-2 bg-richblack-800 border-l border-t border-richblack-700 -top-1 right-4 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default TestLoginTooltip;
