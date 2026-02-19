export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ middleware, api nào đc middleware đó bọc vào thì dùng đc
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
