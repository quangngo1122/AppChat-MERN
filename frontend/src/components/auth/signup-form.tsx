// used by SignUpPage

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { z } from "zod"; // kiem tra data theo dieu kien setup
import { useForm } from "react-hook-form"; // quan ly trang thai va su kien cua form
import { zodResolver } from "@hookform/resolvers/zod"; // giup zod ket noi voi react-hook-form
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

const signUpSchema = z.object({
  firstname: z.string().min(1, "Tên bắt buộc phải có"), // tên là string và phải có ít nhất 1 ký tự, ko thì hiện message
  lastname: z.string().min(1, "Họ bắt buộc phải có"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.email("email không hợp lệ"), // phải đúng định dạng email
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
}); //(zod) mô tả 1 đối tượng nhiều trường, mỗi trường tương ứng 1 ô input trong form
type SignupFormValues = z.infer<typeof signUpSchema>; // typeof--> lay kdl cua signUpSchema, infer --> đọc đoạn zod rồi tự suy ra kdl cua form

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signUpSchema),
  }); // register: theo gioi gia tri cua cac o input, handlesubmit: su kien xay ra khi bam dang ky
  // errors: input khong hop le, issubmitting: để biết khi nào đang trong quá trình gửi dữ liệu

  const onSubmit = async (data: SignupFormValues) => {
    const { firstname, lastname, username, email, password } = data;
    // goi api signup backend
    await signUp(username, password, email, firstname, lastname);

    navigate("/signin");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/vite.svg" alt="logo" />
                </a>
                <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                <p className="text-muted-foreground text-balance">
                  Chào mừng bạn, hãy đăng ký để bắt đầu!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  {/* input */}
                  <Label htmlFor="lastname" className="block text-sm">
                    Họ
                  </Label>
                  <Input type="text" id="lastname" {...register("lastname")} />
                  {/* error message from zod*/}
                  {errors.lastname && (
                    <p className="error-message">{errors.lastname.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm">
                    Tên
                  </Label>
                  <Input
                    type="text"
                    id="firstname"
                    {...register("firstname")}
                  />
                  {errors.firstname && (
                    <p className="error-message">{errors.firstname.message}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="QuangNgo"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="error-message">{errors.username.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="abc@gmail.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <Input
                  type="password"
                  id="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm">
                Đã có tài khoản?{" "}
                <a
                  href="/signin"
                  className="underline underline-offset-4 hover:text-[red]"
                >
                  {/* underline-offset-4:đẩy gạch chân xuống 4px */}
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute  object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-sm text-balance px-6 top-0.5 -translate-y-0.5 text-center *:[a]:hover:text-primary text-muted-foreground  *:[a]:underline  *:[a]:underline-offset-4">
        {/* tất cả thẻ a bên trong div khi hover đổi màu chữ, text-balance: xuống dòng cân bằng khi kích thước màn hình nhỏ */}
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều Khoản Dịch Vụ</a> và{" "}
        <a href="#">Chính Sách Bảo Mật của chúng tôi!</a>.
      </div>
    </div>
  );
}
