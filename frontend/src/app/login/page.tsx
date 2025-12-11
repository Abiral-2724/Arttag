'use client'
import OtpLogin from "@/components/OtpLogin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("arttagtoken") && localStorage.getItem("arttagUserId")) {
      router.push('/');
    }
  }, [])

  return (
    <div className="">

      <OtpLogin />
    </div>
  );
}

export default LoginPage;