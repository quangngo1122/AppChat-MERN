import { SidebarInset } from "../ui/sidebar";

const ChatWindowSkeleton = () => {
  return (
    <SidebarInset className="flex w-full h-full bg-transparent animate-pulse">
      <div className="flex bg-primary-foreground rounded-2xl flex-1 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-42 mx-auto mb-6 bg-muted rounded-full shadow-inner" />
          <div className="w-96 h-10 bg-muted rounded mx-auto" />
          <div className="w-72 h-8 bg-muted rounded mx-auto" />
        </div>
      </div>
    </SidebarInset>
  );
};

export default ChatWindowSkeleton;

// skeleton --> giao diện giả hiển thị trước khi dữ liệu thật được trả về

// --> cách tạo thường là copy toàn bộ khung UI của conponent thật, nhưng ko có bất kỳ data nào, set chiều rộng và chiều cao cố định
// cho từng phần tử, tô tông màu xám để thể hiện chưa load xong, có thể thêm animation nhấp nháy để thể hiện app ko bị crack
