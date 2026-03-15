import { Shield, Bell, ShieldBan } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";

const PrivacySettings = () => {
  const changePassword = useUserStore((s) => s.changePassword);
  const [showChange, setShowChange] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange =
    (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    try {
      await changePassword(
        form.currentPassword,
        form.newPassword,
        form.confirmPassword,
      );
      setShowChange(false);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      // error toast already shown by store
    }
  };

  return (
    <Card className="glass-strong border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Quyền riêng tư & Bảo mật
        </CardTitle>
        <CardDescription>
          Quản lý cài đặt quyền riêng tư và bảo mật của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {showChange ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange("currentPassword")}
                className="glass-light border-border/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                className="glass-light border-border/30"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                className="glass-light border-border/30"
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-2 justify-between mx-10">
              <Button
                type="submit"
                variant="outline"
                className="w-1/3 bg-linear-to-r from-blue-500 to-blue-700 text-white hover:opacity-90 transition-opacity"
              >
                Lưu mật khẩu
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-1/3 bg-linear-to-r from-red-500 to-red-700 text-white hover:opacity-90 transition-opacity"
                onClick={() => setShowChange(false)}
              >
                Huỷ
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="cursor-pointer w-full justify-start glass-light border-border/30 hover:text-warning"
                onClick={() => setShowChange(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </Button>

              <Button
                variant="outline"
                className="cursor-pointer w-full justify-start glass-light border-border/30 hover:text-info"
              >
                <Bell className="h-4 w-4 mr-2" />
                Cài đặt thông báo
              </Button>

              <Button
                variant="outline"
                className="cursor-pointer w-full justify-start glass-light border-border/30 hover:text-destructive"
              >
                <ShieldBan className="size-4 mr-2" />
                Chặn & Báo cáo
              </Button>
            </div>

            {/* position {1} */}
            <div className="pt-4 border-t border-border/30">
              <h4 className="font-medium mb-3 text-destructive">
                Khu vực nguy hiểm
              </h4>
              <Button variant="destructive" className="w-full cursor-pointer">
                Xoá tài khoản
              </Button>
            </div>
            {/*  */}
          </>
        )}
        {/* position {2} */}
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
