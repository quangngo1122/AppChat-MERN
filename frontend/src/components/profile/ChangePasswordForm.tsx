import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";

interface Props {
  onCancel: () => void;
}

const ChangePasswordForm = ({ onCancel }: Props) => {
  const changePassword = useUserStore((s) => s.changePassword);

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

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      onCancel();
    } catch {
      // error toast handled in store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label>Mật khẩu hiện tại</Label>
        <Input
          type="password"
          value={form.currentPassword}
          onChange={handleChange("currentPassword")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Mật khẩu mới</Label>
        <Input
          type="password"
          value={form.newPassword}
          onChange={handleChange("newPassword")}
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label>Xác nhận mật khẩu</Label>
        <Input
          type="password"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          required
          minLength={6}
        />
      </div>

      <div className="flex gap-2 justify-between mx-10">
        <Button
          type="submit"
          className="w-1/3 bg-linear-to-r from-blue-500 to-blue-700 text-white"
        >
          Lưu mật khẩu
        </Button>

        <Button
          type="button"
          className="w-1/3 bg-linear-to-r from-red-500 to-red-700 text-white"
          onClick={onCancel}
        >
          Huỷ
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
