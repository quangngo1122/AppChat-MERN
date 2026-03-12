import { Heart } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useUserStore } from "@/stores/useUserStore";

type EditableField = {
  key: keyof Pick<User, "displayName" | "username" | "email" | "phone">;
  label: string;
  type?: string;
};

const PERSONAL_FIELDS: EditableField[] = [
  { key: "displayName", label: "Tên hiển thị" },
  { key: "username", label: "Tên người dùng" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Số điện thoại" },
];

type Props = {
  userInfo: User | null;
};

const PersonalInfoForm = ({ userInfo }: Props) => {
  const updatePersonalInfo = useUserStore((s) => s.updatePersonalInfo);

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (userInfo) {
      setForm({
        displayName: userInfo.displayName || "",
        username: userInfo.username || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        bio: userInfo.bio || "",
      });
    }
  }, [userInfo]);

  if (!userInfo) return null;

  const handleChange =
    (key: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updatePersonalInfo(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="size-5 text-primary" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>
            Cập nhật chi tiết cá nhân và thông tin hồ sơ của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
          <div className="grid grid-cols-2 gap-4">
            {PERSONAL_FIELDS.map(({ key, label, type }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type={type ?? "text"}
                  value={form[key] ?? ""}
                  onChange={handleChange(key as keyof typeof form)}
                  className="glass-light border-border/30"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Giới thiệu</Label>
            <Textarea
              id="bio"
              rows={3}
              value={form.bio ?? ""}
              onChange={handleChange("bio")}
              className="glass-light border-border/30 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Lưu thay đổi
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default PersonalInfoForm;
