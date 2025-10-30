"use client";

import { auth } from "../../firebase";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import React, { FormEvent, useEffect, useState, useTransition } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Smartphone, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Spinner } from "./ui/spinner";
import Link from "next/link";

function OtpLogin() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );

    setRecaptchaVerifier(recaptchaVerifier);

    return () => {
      recaptchaVerifier.clear();
    };
  }, []);

  useEffect(() => {
    const hasEnteredAllDigits = otp.length === 6;
    if (hasEnteredAllDigits) {
      verifyOtp();
    }
  }, [otp]);

  const verifyOtp = async () => {
    startTransition(async () => {
      setError("");

      if (!confirmationResult) {
        setError("Please request OTP first.");
        return;
      }

      try {
        await confirmationResult?.confirm(otp);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/login`,
          {
            phoneNumber: phoneNumber,
          }
        );
       // console.log(response) ; 
        localStorage.setItem("arttagtoken" ,response.data.token) ; 
        localStorage.setItem("arttagUserId",response.data.userId) ; 
        router.replace("/");
      } catch (error) {
        console.log(error);
        setError("Failed to verify OTP. Please check the OTP.");
      }
    });
  };

  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setResendCountdown(60);

    startTransition(async () => {
      setError("");

      if (!recaptchaVerifier) {
        return setError("RecaptchaVerifier is not initialized.");
      }

      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifier
        );

        setConfirmationResult(confirmationResult);
        setSuccess("OTP sent successfully.");
      } catch (err: any) {
        console.log(err);
        setResendCountdown(0);

        if (err.code === "auth/invalid-phone-number") {
          setError("Invalid phone number. Please check the number.");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many requests. Please try again later.");
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border-1 shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-1">
              {!confirmationResult ? (
                 <Link href={'/'}>
                 <div className="flex items-center gap-2">
       <div className="w-auto h-10">
         <svg
           xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 270 54"
           className="h-full w-auto"
         >
           <defs>
             <style>
               {`
               .st0 {
                 font-family: MuktaMahee-Regular, 'Mukta Mahee';
                 font-size: 49.69px;
               }
               `}
             </style>
           </defs>
           <g>
             <path d="M62.85,33.21c.11,0,.17.04.19.21.2,1.7-.04,4.05-.01,5.84,0,.44.01.95-.3,1.15-.34.21-1.72-.06-2.18-.12-14.77-1.86-19.13-21.03-6.37-28.96,3.44-2.14,5.73-2.15,9.65-2.25.57-.01,1.26,0,1.76.06-2.15,2.88-1.5,7.52,2.16,8.77,1.53.52,2.98.08,4.52.4v21.62c0,.2-.1.41-.29.49h-6.67c-.08,0-.16-.03-.22-.09-.06-.06-.09-.14-.09-.22v-20.52c0-.35-.19-.72-.24-.86-1.18-3.54-5.67-2.47-7.9-.6-4.54,3.81-3.78,11.34,1.53,14.02.34.17,1.24.75,2.41.87l2.06.2Z" />
             <path d="M68.98,16.48c-.15,0-.29-.02-.44-.05-1.63-.42-2.77-2.4-2.6-4.02.15-1.44,1.7-3.34,3.22-3.34h20.4c.15,0,.17.11.18.44v6.66c0,.08-.03.16-.09.22-.06.06-.14.09-.22.09h-20.45Z" />
             <path d="M73.96,40.29v-21.62c0-.2.1-.41.29-.49h6.67c.08,0,.16.03.22.09.06.06.09.14.09.22v18.21c.03.76-.62,1.51-.8,1.75-1.53,2.1-4.13,2.17-6.49,1.83Z" />
           </g>
           <text className="st0" transform="translate(84.95 40.38)">
             <tspan x="0" y="0">Arttag</tspan>
           </text>
         </svg>
       </div>
     </div>
     
                 </Link>
              ) : (
                <Link href={'/'}>
                <div className="flex items-center gap-2">
      <div className="w-auto h-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 270 54"
          className="h-full w-auto"
        >
          <defs>
            <style>
              {`
              .st0 {
                font-family: MuktaMahee-Regular, 'Mukta Mahee';
                font-size: 49.69px;
              }
              `}
            </style>
          </defs>
          <g>
            <path d="M62.85,33.21c.11,0,.17.04.19.21.2,1.7-.04,4.05-.01,5.84,0,.44.01.95-.3,1.15-.34.21-1.72-.06-2.18-.12-14.77-1.86-19.13-21.03-6.37-28.96,3.44-2.14,5.73-2.15,9.65-2.25.57-.01,1.26,0,1.76.06-2.15,2.88-1.5,7.52,2.16,8.77,1.53.52,2.98.08,4.52.4v21.62c0,.2-.1.41-.29.49h-6.67c-.08,0-.16-.03-.22-.09-.06-.06-.09-.14-.09-.22v-20.52c0-.35-.19-.72-.24-.86-1.18-3.54-5.67-2.47-7.9-.6-4.54,3.81-3.78,11.34,1.53,14.02.34.17,1.24.75,2.41.87l2.06.2Z" />
            <path d="M68.98,16.48c-.15,0-.29-.02-.44-.05-1.63-.42-2.77-2.4-2.6-4.02.15-1.44,1.7-3.34,3.22-3.34h20.4c.15,0,.17.11.18.44v6.66c0,.08-.03.16-.09.22-.06.06-.14.09-.22.09h-20.45Z" />
            <path d="M73.96,40.29v-21.62c0-.2.1-.41.29-.49h6.67c.08,0,.16.03.22.09.06.06.09.14.09.22v18.21c.03.76-.62,1.51-.8,1.75-1.53,2.1-4.13,2.17-6.49,1.83Z" />
          </g>
          <text className="st0" transform="translate(84.95 40.38)">
            <tspan x="0" y="0">Arttag</tspan>
          </text>
        </svg>
      </div>
    </div>
    
                </Link>
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 ">
              {!confirmationResult ? "Welcome Back" : "Verify OTP"}
            </h1>
            <p className="text-slate-600">
              {!confirmationResult
                ? "Enter your phone number to continue"
                : `We've sent a code to ${phoneNumber}`}
            </p>
          </div>

          {/* Phone Number Input */}
          {!confirmationResult && (
            <form onSubmit={requestOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="pl-10 h-12 text-base"
                    disabled={isPending}
                  />
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                  Include country code (e.g., +1 for US, +44 for UK)
                </p>
              </div>

              <Button
                type="submit"
                disabled={!phoneNumber || isPending || resendCountdown > 0}
                className="w-full h-10 text-l font-medium bg-blue-700 text-white"
              >
                {isPending ? (
                  <>
                    
                <Spinner className='text-blue-700 text-5xl'></Spinner>
                <p className="text-gray-600 text-sm">Sending OTP</p>
               
                  </>
                ) : resendCountdown > 0 ? (
                  `Resend in ${resendCountdown}s`
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* OTP Input */}
          {confirmationResult && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isPending}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={() => {
                  setConfirmationResult(null);
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                variant="ghost"
                className="w-full"
                disabled={isPending}
              >
                Change Phone Number
              </Button>

              {resendCountdown === 0 && !isPending && (
                <Button
                  onClick={() => requestOtp()}
                  variant="outline"
                  className="w-full"
                >
                  Resend OTP
                </Button>
              )}

              {resendCountdown > 0 && (
                <p className="text-center text-sm text-slate-500">
                  Resend available in {resendCountdown}s
                </p>
              )}
            </div>
          )}

          {/* Status Messages */}
          {(error || success) && (
            <div className="space-y-2">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600 text-center">
                    {error}
                  </p>
                </div>
              )}
              {success && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-blue-600 text-center">
                    {success}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {isPending && (
            <div className="flex justify-center">
              <Spinner></Spinner>
            </div>
          )}

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}

export default OtpLogin;