import React, { useState } from 'react';
import { ModernInput } from './ModernInput';
import { ModernButton } from './ModernButton';

interface PhoneVerificationInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVerified: () => void;
  error?: string;
  name?: string;
}

export const PhoneVerificationInput: React.FC<PhoneVerificationInputProps> = ({
  label = "Mobile Number",
  value,
  onChange,
  onVerified,
  error,
  name
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleVerifyClick = async () => {
    if (!value || value.length < 8) {
      setLocalError("Please enter a valid phone number first.");
      return;
    }
    
    setIsVerifying(true);
    setLocalError(null);

    try {
      const res = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value })
      });
      const data = await res.json();

      if (data.success) {
        // Validation and uniqueness passed!
        // Simulate OTP sending
        setShowOtp(true);
      } else {
        setLocalError(data.error || "Failed to verify phone number.");
      }
    } catch (err: any) {
      setLocalError(err.message || "An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpVerify = () => {
    if (otp === '123456') {
      setIsVerified(true);
      setShowOtp(false);
      onVerified();
    } else {
      setLocalError("Invalid OTP. For demo, use 123456.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <ModernInput 
            name={name}
            label={label}
            type="tel"
            value={value}
            onChange={(e) => {
              setIsVerified(false);
              onChange(e);
            }}
            error={error || localError || undefined}
            disabled={isVerified}
          />
        </div>
        <div className="mb-1">
          {!isVerified ? (
            <ModernButton 
              type="button"
              variant="outline" 
              onClick={handleVerifyClick}
              loading={isVerifying}
              disabled={!value || value.length < 8}
            >
              Verify
            </ModernButton>
          ) : (
            <ModernButton 
              type="button"
              variant="primary"
              disabled
              className="bg-success border-success text-white"
            >
              Verified ✓
            </ModernButton>
          )}
        </div>
      </div>

      {showOtp && !isVerified && (
        <div className="mt-4 p-4 border rounded-xl bg-surface-container-low relative">
          <button 
            type="button" 
            className="absolute top-2 right-2 text-on-surface-variant hover:text-error"
            onClick={() => setShowOtp(false)}
          >
            ✕
          </button>
          <p className="text-sm font-bold text-on-surface mb-2">Enter Verification Code</p>
          <p className="text-xs text-on-surface-variant mb-3">We've verified your number format. Please enter the 6-digit OTP sent to your phone (Use 123456 for demo).</p>
          <div className="flex gap-2">
            <ModernInput 
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
            <ModernButton type="button" onClick={handleOtpVerify}>Confirm</ModernButton>
          </div>
        </div>
      )}
    </div>
  );
};
