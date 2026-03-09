// giao diện để người dùng có thể chọn vào upload lên

import { useUserStore } from "@/stores/useUserStore";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Camera } from "lucide-react";

const AvatarUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateAvatarUrl } = useUserStore();

  // kích hoạt thẻ input đã bị ẩn đi, khi thẻ nào chứa sự kiện này thì khi kích hoạt sự kiện thì input uploadfile sẽ đc kích hoạt
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // sử lý khi chọn ảnh
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // nếu có file thì tạo obj form data
    const formData = new FormData();

    formData.append("file", file); // để muter có thể đọc từ phía backend

    await updateAvatarUrl(formData);
  };

  return (
    <>
      <Button
        size="icon"
        variant="secondary"
        onClick={handleClick}
        className="absolute -bottom-2 -right-2 size-9 rounded-full shadow-md 
        hover:scale-115 transition duration-300 hover:bg-background"
      >
        <Camera className="size-4" />
      </Button>
      {/* input này ko hiển thị, nó chỉ có chức năng bấm vào thì mở uploadfile */}
      <Input type="file" hidden ref={fileInputRef} onChange={handleUpload} />
    </>
  );
};

export default AvatarUploader;
