import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

function VerifyEmail() {
  const [code, setCode] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { error, isLoading, verifyEmail } = useAuthStore();
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const submitVerification = async () => {
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode);
      toast.success("Email verified Successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    submitVerification();
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasted)) return;

    const newCode = pasted.split("");
    while (newCode.length < 6) newCode.push("");

    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  //auto submit when all filed are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "") && !isLoading) {
      submitVerification();
    }
  }, [code]);

  return (
    <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-linear-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Enter the 6-digit code sent to your email address
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-2xl font-bold 
          bg-gray-700 text-white border-2 border-gray-500 
          rounded-lg focus:border-green-500 focus:outline-none"
              />
            ))}
          </div>
          {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
            className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
