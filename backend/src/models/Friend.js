// chua thong tin ban be

import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// chuan hoa thứ tự, tránh lưu cùng 1 cập vd user A - B rồi lại B - A
// tạo 1 pre (như middleware) chuẩn hóa dữ liệu schema trc khi tạo model

friendSchema.pre("save", function (next) {
  // trc khi thuc hien hanh dong save, thuc hien func nay truc
  const a = this.userA.toString();
  const b = this.userB.toString();

  //   so sanh 2 id để hoán đỗi 2 id luôn giữ đúng 1 chiều A - B tránh [trùng lập ngược chiều]
  if (a > b) {
    this.userA = mongoose.Schema.Types.ObjectId(b);
    this.userB = mongoose.Schema.Types.ObjectId(a);
  }
  next();
});

friendSchema.index({ userA: 1, userB: 1 }, { unique: true }); // độc nhất, đảm bảo việc ko trùng

// tao modelFriend
const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
