import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";
import { chatService } from "@/services/chatService";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  // lưu nd tin nhắn trong ô input
  const [value, setValue] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const { sendDirectMessage, sendGroupMessage } = useChatStore();

  const {
    sendDirectMessage,
    sendGroupMessage,
    addUploadingMessage,
    removeUploadingMessage,
    activeConversationId,
  } = useChatStore();

  if (!user) return;

  const sendMessage = async (imgUrl?: string) => {
    // tin nhắn rỗng hoặc full khoản trắng và không có ảnh
    if (!value.trim() && !imgUrl) return;

    const currValue = value;
    const currImgUrl = imgUrl;

    setValue("");
    setSelectedImage(null);

    try {
      // nếu nhắn đơn, thì gửi cho đối phương
      if (selectedConvo.type === "direct") {
        const participants = selectedConvo.participants; // lấy danh sách người trong cuộc tt
        const otherUser = participants.filter((p) => p._id !== user._id)[0]; // id khác id mình, [0] để lấy phần tử ra luôn thay vì mảng
        await sendDirectMessage(otherUser._id, currValue, currImgUrl);
        // ngược lại, khi nhắn vào group
      } else {
        await sendGroupMessage(selectedConvo._id, currValue, currImgUrl); // id cuộc hội thoại, và giá trị vào
      }
    } catch (error) {
      console.error(error);
      toast.error("lỗi xãy ra khi gửi tin nhắn. Bạn hãy thử lại!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // chặn hành vi mặc định như xuống dòng chẳn hạn
      sendMessage();
    }
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ được chọn file ảnh!");
      return;
    }

    // check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File ảnh không được vượt quá 5MB!");
      return;
    }

    setSelectedImage(file);
    setIsUploading(true);

    // tạo temporary id cho pending message
    const tempId = `temp-${Date.now()}`;

    // tạo object URL để preview ảnh đang upload
    const previewUrl = URL.createObjectURL(file);

    // thêm pending message vào store
    if (activeConversationId) {
      addUploadingMessage(activeConversationId, tempId, previewUrl);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const imgUrl = await chatService.uploadImage(formData);

      // xóa pending message
      if (activeConversationId) {
        removeUploadingMessage(activeConversationId, tempId);
      }

      // gửi message với ảnh
      await sendMessage(imgUrl);
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      // xóa pending message khi lỗi
      if (activeConversationId) {
        removeUploadingMessage(activeConversationId, tempId);
      }
      toast.error("Lỗi khi upload ảnh!");
    } finally {
      setIsUploading(false);
      // cleanup preview URL
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 min-h-14 bg-background">
      <Button
        onClick={handleImageSelect}
        disabled={isUploading}
        variant="ghost"
        size="icon"
        className="hover:bg-primary/10 transition-smooth"
      >
        <ImagePlus className="size-4" />
      </Button>
      <div className="flex-1 relative">
        <Input
          onKeyDown={handleKeyPress}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Soạn tin nhắn ..."
          className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50
          transition-smooth resize-none"
        ></Input>
        <div
          className="absolute right-2 top-1/2 transform
           -translate-y-1/2 flex items-center gap-1"
        >
          <Button
            asChild // chỉ mang hình thức button hiển thị thôi, moi hành vi, thiết lập đều đc truyền cho phần tử con của nó
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-primary/10 transition-smooth"
          >
            <div>
              {/* emoji picker --> mỗi lần chọn emoji thì thêm emoji đó vào cuối tin nhắn hiện tại*/}
              <EmojiPicker
                onChange={(emoji: string) => setValue(`${value}${emoji}`)} // text + emoji
              />
            </div>
          </Button>
        </div>
      </div>
      <Button
        onClick={() => sendMessage()}
        className="bg-gradient-chat hover:shadow-glow 
        transition-smooth hover:scale-105"
        disabled={!value.trim() && !selectedImage}
      >
        <Send className="size-4 text-white " />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default MessageInput;
