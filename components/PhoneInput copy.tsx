'use client';

import { useState, useRef, useEffect } from 'react';

// Common country codes for the dropdown
const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
];

interface PhoneInputProps {
  value: string;            // 10-digit number only (no country code)
  countryCode: string;      // e.g. "+91"
  onValueChange: (val: string) => void;
  onCountryCodeChange: (code: string) => void;
  onVerified: (fullPhone: string) => void; // called when OTP verified
  error?: string;
  label?: string;
  disabled?: boolean;
  isVerified?: boolean;
}

export default function PhoneInput({
  value,
  countryCode,
  onValueChange,
  onCountryCodeChange,
  onVerified,
  error,
  label = 'Mobile Number',
  disabled = false,
  isVerified = false,
}: PhoneInputProps) {
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const fullPhone = `${countryCode}${value}`;

  const startCountdown = () => {
    setResendCountdown(60);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (value.length !== 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }

    console.log('[OTP] Starting OTP flow');
    console.log('[OTP] Phone:', fullPhone);

    setSendLoading(true);
    setOtpError('');

    try {
      console.log('[OTP] Calling /api/send-mobile-otp');

      const sendRes = await fetch('/api/send-mobile-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhone,
        }),
      });

      console.log('[OTP] API Response Status:', sendRes.status);

      const sendData = await sendRes.json();

      console.log('[OTP] API Response:', sendData);

      if (!sendData.success) {
        console.error('[OTP] Failed:', sendData.error);

        setOtpError(
          sendData.error || 'Failed to send OTP. Please try again.'
        );

        return;
      }

      if (sendData.code) {
        console.log(
          `[DEV OTP] OTP for ${fullPhone}:`,
          sendData.code
        );
      }

      console.log('[OTP] OTP sent successfully');

      setOtpSent(true);
      setVerifying(true);

      startCountdown();
    } catch (error) {
      console.error('[OTP] Unexpected error:', error);

      setOtpError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }

    console.log('[VERIFY] Starting verification');
    console.log('[VERIFY] Phone:', fullPhone);
    console.log('[VERIFY] OTP:', otp);

    setOtpLoading(true);
    setOtpError('');

    try {
      console.log('[VERIFY] Calling /api/verify-mobile-otp');

      const res = await fetch('/api/verify-mobile-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhone,
          otp,
        }),
      });

      console.log(
        '[VERIFY] API Response Status:',
        res.status
      );

      const data = await res.json();

      console.log(
        '[VERIFY] API Response:',
        data
      );

      if (data.success) {
        console.log(
          '[VERIFY] Mobile number verified successfully'
        );

        setVerifying(false);
        setOtpSent(false);
        setOtp('');

        onVerified(fullPhone);
      } else {
        console.error(
          '[VERIFY] Verification failed:',
          data.error
        );

        setOtpError(
          data.error || 'Invalid OTP. Please try again.'
        );
      }
    } catch (error) {
      console.error(
        '[VERIFY] Unexpected error:',
        error
      );

      setOtpError(
        'Verification failed. Please try again.'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleClose = () => {
    setVerifying(false);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
        {label}
      </label>

      {/* Input Row */}
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <div className="relative shrink-0">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            disabled={disabled || isVerified}
            className="h-full pl-3 pr-8 py-3 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface font-medium appearance-none cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minWidth: '90px' }}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-on-surface-variant/50 pointer-events-none text-sm" translate="no">
            expand_more
          </span>
        </div>

        {/* Number Input */}
        <div className="flex-1 relative">
          <input
            type="tel"
            value={value}
            onChange={(e) => {
              const numeric = e.target.value.replace(/\D/g, '').slice(0, 10);
              onValueChange(numeric);
            }}
            placeholder="10-digit number"
            maxLength={10}
            disabled={disabled || isVerified}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-primary bg-surface font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isVerified
              ? 'border-green-400 bg-green-50 text-green-800'
              : error
                ? 'border-error'
                : 'border-outline-variant/30'
              }`}
          />
          {isVerified && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined notranslate text-green-600 text-xl"
              translate="no"
              title="Verified"
            >
              verified
            </span>
          )}
        </div>

        {/* Verify Button */}
        {!isVerified ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={disabled || sendLoading || value.length !== 10}
            className="shrink-0 px-4 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
          >
            {sendLoading ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </span>
            ) : (
              'Verify'
            )}
          </button>
        ) : (
          <div className="shrink-0 px-4 py-3 rounded-xl bg-green-100 text-green-700 font-bold text-xs flex items-center gap-1">
            <span className="material-symbols-outlined notranslate text-base" translate="no">check_circle</span>
            Verified
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-error text-xs mt-1 font-bold">{error}</p>}
      {!isVerified && value.length > 0 && value.length < 10 && (
        <p className="text-amber-600 text-xs mt-1">{value.length}/10 digits</p>
      )}
      {isVerified && (
        <p className="text-green-600 text-xs mt-1 font-bold flex items-center gap-1">
          <span className="material-symbols-outlined notranslate text-xs" translate="no">check_circle</span>
          Mobile number verified successfully
        </p>
      )}

      {/* OTP Modal Overlay */}
      {verifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined notranslate" translate="no">close</span>
            </button>

            {/* Icon */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
              >
                <span className="material-symbols-outlined notranslate text-white text-3xl" translate="no">
                  phone_iphone
                </span>
              </div>
              <h3 className="font-headline font-black text-xl text-on-surface">Verify Your Mobile</h3>
              <p className="text-on-surface-variant text-sm text-center mt-1">
                We've sent a 6-digit OTP to
              </p>
              <p className="font-bold text-on-surface text-sm mt-1">
                {selectedCountry.flag} {countryCode} {value}
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-4">
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const numeric = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(numeric);
                  setOtpError('');
                }}
                placeholder="• • • • • •"
                maxLength={6}
                className="w-full text-center text-2xl font-black tracking-[0.5em] px-4 py-4 border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary bg-surface transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerifyOtp();
                }}
              />
              {otpError && (
                <p className="text-error text-xs mt-2 font-bold text-center">{otpError}</p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.length !== 6}
              className="w-full py-3.5 text-white font-headline font-bold rounded-xl transition-all disabled:opacity-40 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #e55a24, #ff6b35)' }}
            >
              {otpLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined notranslate text-lg" translate="no">verified</span>
                  Confirm OTP
                </>
              )}
            </button>

            {/* Resend */}
            <div className="mt-4 text-center">
              {resendCountdown > 0 ? (
                <p className="text-on-surface-variant text-xs">
                  Resend OTP in{' '}
                  <span className="font-bold text-primary">{resendCountdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendLoading}
                  className="text-primary font-bold text-xs hover:underline disabled:opacity-50"
                >
                  {sendLoading ? 'Sending...' : "Didn't receive? Resend OTP"}
                </button>
              )}
            </div>

            {/* Note */}
            <p className="text-[10px] text-on-surface-variant/70 text-center mt-4">
              OTP is valid for 10 minutes. Please check SMS on your registered number.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
