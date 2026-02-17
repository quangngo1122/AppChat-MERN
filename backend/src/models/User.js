import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // ko dc để trống
      unique: true, // độc nhất, tự tạo index --> tìm theo trường này thì nhanh hơn
      trim: true, // bỏ khoản trắng đầu cuối
      lowercase: true, // full chữ thường
    },
    hashedPassword: {
      type: String, // save mk sau khi ma hoa
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String, // link CDN để hiển thị hình
    },
    avatarId: {
      type: String, // lưu Cloudinary public_id để xóa hình
    },
    bio: {
      type: String, // mô tả ngắng của người dùng
      maxlength: 500, // giới hạn 500 ký tự
    },
    phone: {
      type: String,
      sparse: true, // cho phép ko nhập (null), nhưng nếu nhập thì ko đc trùng
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
