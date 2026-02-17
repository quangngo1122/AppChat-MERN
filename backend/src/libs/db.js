import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONECTIONSTRING);
    console.log("liên kết thành công mongoose db");
  } catch (error) {
    console.log("lỗi khi kết nối csdl", error);
    process.exit(1); // dừng ctrinh khi ko knoi đc db
  }
};
