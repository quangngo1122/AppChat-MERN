import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { UserPlus } from "lucide-react";
import type { User } from "@/types/user";
import { useFriendStore } from "@/stores/useFriendStore";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SearchForm from "../addFriendModal/SearchForm";
import SendFriendRequestForm from "../addFriendModal/SendFriendRequestForm";

// import React from "react";
export interface IFormValues {
  username: string;
  message: string;
}

const AddFriendModal = () => {
  const [isFound, setIsFound] = useState<boolean | null>(null); // chưa tìm, ko tìm thấy, đã tìm thấy --> null, false, true

  // lưu thông tin user tìm đc
  const [searchUser, setSearchUser] = useState<User>();
  // báo tìm thấy hay ko tìm thấy
  const [searchedUsername, setsearchedUsername] = useState("");

  const { loading, searchByUserName, addFriend } = useFriendStore();

  const {
    register, // kết nối các input
    handleSubmit, // xử lý khi submit
    watch, // theo dỏi giá trị đang gõ
    reset,
    formState: { errors },
  } = useForm<IFormValues>({
    defaultValues: { username: "", message: "" },
  });

  // lưu giá trị username đc gõ
  const usernameValue = watch("username"); // theo gõi input lấy giá trị realtime

  // xử lý khi tìm người dùng = username, sẽ chạy call back của handlesubmit nhận vào data từ form
  const handleSearch = handleSubmit(async (data) => {
    const username = data.username.trim();
    if (!username) return;
    // trc khi gọi api thì reset trạng thái tìm kiếm về null để xóa gtri cũ
    setIsFound(null);

    setsearchedUsername(username);

    try {
      const foundUser = await searchByUserName(username); // tìm user

      if (foundUser) {
        setIsFound(true);
        setSearchUser(foundUser);
      } else {
        setIsFound(false);
      }
    } catch (error) {
      console.error(error);
      setIsFound(false); // ko tìm thấy
    }
  });

  // xử lý gửi yêu cầu kb
  const handleSend = handleSubmit(async (data) => {
    if (!searchUser) return;
    try {
      // gửi yc kb
      const message = await addFriend(searchUser._id, data.message.trim());
      toast.success(message);

      handleCancel();
    } catch (error) {
      console.error("Lỗi xãy ra khi gửi request từ form", error);
    }
  });

  // reset toàn bộ như lúc đóng model hay gửi thành công
  const handleCancel = () => {
    reset();
    setsearchedUsername("");
    setIsFound(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center size-5 rounded-full hover:bg-sidebar-accent cursor-pointer z-10">
          <UserPlus className="size-4" />
          <span className="sr-only">Kết bạn</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 border-none">
        {/* <DialogContent className="sm:max-w-[425px] border-none"> */}
        <DialogHeader>
          <DialogTitle>Kết bạn</DialogTitle>
        </DialogHeader>

        {/* form tìm user */}
        {!isFound && (
          <>
            <SearchForm
              register={register}
              errors={errors}
              usernameValue={usernameValue}
              loading={loading}
              isFound={isFound}
              searchedUsername={searchedUsername}
              onSubmit={handleSearch}
              onCancel={handleCancel}
            />
          </>
        )}

        {/* form gửi yc kb */}
        {isFound && (
          <>
            <SendFriendRequestForm
              register={register}
              loading={loading}
              searchedUsername={searchedUsername}
              onSubmit={handleSend}
              onBack={() => setIsFound(null)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
