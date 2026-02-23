import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
// import { request } from "express";

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;

    const from = req.user._id; // id user dang dang nhap, lấy đc qua middleware: protected route

    if (from === to) {
      return res
        .status(400)
        .json({ message: "Không thể gửi lời mời kết bạn cho chính mình" });
    }

    const userExists = await User.exists({ _id: to }); // [kiểm tra] có user nào có _id = bien to không --> null / obj(_id)
    if (!userExists) {
      return res.status(404).json({ message: "Nguoi dung khong ton tai" });
    }

    // Chuẩn hoá thứ tự 2 user
    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) {
      [userA, userB] = [userB, userA]; // Nếu userA lớn hơn userB thì đổi chỗ lại.
    }

    // Promise.all: Kiểm tra đồng thời 2 thứ --> nhanh hon
    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }), //đã là bạn chưa
      FriendRequest.findOne({
        $or: [
          { from, to }, // kiểm tra chieu from - to
          { from: to, to: from }, // kiem tra chieu nguoc lai
        ],
      }), // Có lời mời kết bạn đang tồn tại chưa
    ]);

    if (alreadyFriends) {
      return res.status(400).json({ message: "Hai nguoi đã là bạn bè" });
    }
    if (existingRequest) {
      return res.status(400).json({ message: "Đã có lời mời kết bạn" });
    }

    // mọi thứ ok thì tiến hành tạo lời mời kết bạn
    const request = await FriendRequest.create({
      from,
      to,
      message,
    });

    return res
      .status(201)
      .json({ message: "Gui loi moi ket ban thanh cong", request });
  } catch (error) {
    console.error("Loi khi gui yeu cau ket ban");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params; // :requestId
    const userId = req.user._id; // id user dang nhap

    // kiem tra loi moi ket ban co ton tai ko
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res
        .status(404)
        .json({ message: "Khong tim thay loi moi ket ban" });
    }

    // dam bao rang nguoi nhan moi dc quyen chap nhan, (tránh tình trạng tự gửi lời mời rồi tự gọi api request chấp nhận)
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Ban ko co quyen chap nhan loi moi nay" });
    }

    // neu ok het thi create quan he ban be
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    // sau bước trên thì đã là bạn, nên xóa đi lời mời kết bạn cũ khỏi bảng FriendRequest
    await FriendRequest.findByIdAndDelete(requestId);

    // lay thong tin nguoi gui loi moi de tra ve cho client hien thi trong giao dien
    const from = await User.findById(request.from)
      .select("_id displayName avatarUrl")
      .lean(); // toi uu hieu nang query, nhanh, nhẹ hơn --> vi có lean() sẽ trả về obj thay vì mongoose document

    return res.status(200).json({
      message: "chap nhan loi moi ket ban thanh cong",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Loi khi chap nhan loi moi ket ban");
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    // kiem tra loi moi kb co ton tai ko
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Khong tim thay loi moi ket ban" });
    }
    if (request.to.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Ban ko co quyen tu choi loi moi nay" });
    }

    // xoa loi moi kb va ko can tra ve gia tri j ca
    await FriendRequest.findByIdAndDelete(requestId);

    return res.sendStatus(204);
  } catch (error) {
    console.error("Loi khi tu choi loi moi ket ban");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    // tim tat ca moi quan he ban be, ma user la mot trong 2 phia (userA or UserB)
    const friendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }], // tức là chỉ cần userId xuất hiện ở userA/B đều đc
    })
      .populate("userA", "_id displayName avatarUrl") // ko dùng populate nó sẽ chỉ trả về objId thôi,
      .populate("userB", "_id displayName avatarUrl") // dùng thì nó đi sang Đi sang collection User lấy thông tin tương ứng để khỏi mắt công viết hàm query thêm
      .lean(); // nhẹ, nhanh hơn , ...

    if (!friendships.length) {
      return res.status(200).json({ friends: [] }); // ý là đéo có bạn thì friends = rỗng
    }

    // lọc ra những friends (bỏ bản thân ra khỏi danh sách friendships)
    const friends = friendships.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
    ); // nếu id user A là bạn (=userId) thì friend của bạn là userB và ngược lại

    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Loi khi lay danh sach ban be");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const populateFields = "_id username displayName avatarUrl";

    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId }).populate("to", populateFields), // các lời mời đã gửi, lấy thông tin người nhận
      FriendRequest.find({ to: userId }).populate("from", populateFields), // các lời mời đã nhận, kèm thông tin người gửi
    ]);

    res.status(200).json({ sent, received }); // trả dữ liệu về frontend use
  } catch (error) {
    console.error("Loi khi lay danh sach yeu cau ket ban");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
