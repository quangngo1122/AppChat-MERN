import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/logo.svg" alt="logo" />
                </a>
                <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                <p className="text-muted-foreground text-balance">
                  Chào mừng bạn, hãy đăng ký để bắt đầu!
                </p>
              </div>
              <div className="grid grid-col-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">
                    Họ
                  </Label>
                  <Input type="text" id="lastname" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fistname" className="block text-sm">
                    Tên
                  </Label>
                  <Input type="text" id="fistname" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input type="text" id="username" placeholder="QuangNgo" />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Input type="email" id="email" placeholder="abc@gmail.com" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <Input type="password" id="password" />
              </div>

              <Button type="submit" className="ư-full">
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm">
                Đã có tài khoản?{" "}
                <a href="/signin" className="underline underline-offset-4">
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
