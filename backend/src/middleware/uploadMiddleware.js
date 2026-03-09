import multer from "multer"; // nhận và xử lý các file upload lên server
import { v2 as cloudinary } from "cloudinary";

export const upload = multer({
  storage: multer.memoryStorage(), // lưu file dưới dạng dữ liệu thô trong memory để tối ưu tốc độ upload
  limits: {
    fileSize: 1024 * 1024 * 2, //2MB --> giới hạn kick thước file
  },
});

// buffer--> khối dữ liệu ảnh thô, options --> các tùy chọn khác của cloudinary
export const uploadImagefromBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "q_chat/avatars", // có thư mục thì upload vào, ko thì tự tạo rồi upload vào
        resource_type: "image",
        transformation: [{ width: 200, height: 200, crop: "fill" }], // điều chỉnh kích thước ảnh
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result); // url và id hình
        }
      },
    );
    uploadStream.end(buffer);
  });
};
