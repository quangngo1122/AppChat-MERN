// import React from "react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

const Logout = () => {
  const { signOut } = useAuthStore();

  const { setTheme } = useThemeStore();

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
      setTheme(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      variant="completeGhost"
      onClick={handleLogout}
      className="cursor-pointer"
    >
      <LogOut className="text-destructive" /> Log out
    </Button>
  );
};

export default Logout;
