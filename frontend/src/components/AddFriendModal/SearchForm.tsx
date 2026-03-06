import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../chat/AddFriendModal";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DialogClose, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

interface SearchFormProps {
  register: UseFormRegister<IFormValues>;
  errors: FieldErrors<IFormValues>; // dùng 9de63 hiển thị lỗi input
  loading: boolean;
  usernameValue: string; // input người dùng nhập vào
  isFound: boolean | null;
  searchedUsername: string; // username đã tìm
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void; //hàm gọi lại khi người dùng nhấn cancel
}

const SearchForm = ({
  register,
  errors,
  usernameValue,
  loading,
  isFound,
  searchedUsername,
  onSubmit,
  onCancel,
}: SearchFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-semibold">
          Tìm bằng username
        </Label>
        <Input
          id="username"
          placeholder="Gõ tên username vào đây..."
          className="glass border-border/50 focus:border-primary/50 transition-smooth"
          {...register("username", {
            required: "Username không được bỏ trống",
          })} // kết nối trực tiếp react-hook-form qua register
        ></Input>
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}

        {/* đã tìm nhưng user ko tồn tại */}
        {isFound === false && (
          <span className="error-message">
            Không tìm thấy
            <span className="font-semibold">@{searchedUsername}</span>
          </span>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="flex-1 cursor-pointer glass hover:text-destructive"
            onClick={onCancel} /*  reset state khi bấm close */
          >
            Cancel
          </Button>
        </DialogClose>

        <Button
          type="submit"
          disabled={loading || !usernameValue?.trim()}
          className="flex-1 cursor-pointer bg-gradient-chat text-white hover:opacity-90 transition-smooth"
        >
          {loading ? (
            <span>Đang tìm</span>
          ) : (
            <>
              <Search className="size-4 mr-2" /> Tìm
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SearchForm;
