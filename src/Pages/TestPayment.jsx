import { useState } from "react";
import IconButton from "../Component/Common/IconBtn";
import { FaInfoCircle } from "react-icons/fa";

export default function TestCredentials() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <IconButton
        text=""
        onClick={() => setShowTooltip(!showTooltip)}
        customClasses="ml-2"
      >
        <FaInfoCircle className="text-richblack-5" />
      </IconButton>

      {showTooltip && (
        <div className="absolute z-10 w-64 px-4 py-3 text-sm text-white bg-richblack-800 rounded-lg shadow-lg -right-2 top-8">
          <h4 className="font-semibold mb-2">Test Card Details:</h4>
          <ul className="space-y-1">
            <li>Card: 4111 1111 1111 1111</li>
            <li>CVV: Any 3 digits</li>
            <li>Expiry: Any future date</li>
            <li>OTP: 1111</li>
          </ul>
          <div className="absolute w-2 h-2 bg-richblack-800 -top-1 right-4 rotate-45" />
        </div>
      )}
    </div>
  );
}
