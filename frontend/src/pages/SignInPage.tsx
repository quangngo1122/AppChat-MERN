import { SigninForm } from "@/components/auth/signin-form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const SignInPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const hasShownToast = useRef(false);

  useEffect(() => {
    if (user && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.info("Bạn đã đăng nhập");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0 bg-gradient-purple">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SigninForm />
      </div>
    </div>
  );
};

export default SignInPage;
