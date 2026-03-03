// các hàm helper tái sử dụng, cập nhật lại dữ liệu của một
// conversation mỗi khi có tin nhắn mới được tạo.
export const updateConversationAfterCreateMessage = (
  conversation,
  message,
  senderId,
) => {
  conversation.set({
    seenBy: [], // Khi có tin nhắn mới, chưa ai xem cả --> reset danh sách người đã xem
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: message.content,
      senderId,
      createdAt: message.createdAt,
    }, // Thay vì phải query message collection, lưu luôn snapshot
  });

  // Cập nhật số tin chưa đọc (unreadCounts)
  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString(); // = nhau thì người này là người gửi tin nhắn
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1); // ai là người gửi thì unread = 0, còn người kia thì tăng 1
  });
};

// phát sự kiện newmessage vào 1 room
export const emitNewMessage = (io, conversation, message) => {
  // join vào 1 cái room xong emit
  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
    },
    unreadCounts: conversation.unreadCounts,
  });
};
