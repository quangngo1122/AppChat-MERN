import { useFriendStore } from "@/stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";
import { Button } from "@/components/ui/button";

const SentRequests = () => {
  const { sentList, cancelRequest } = useFriendStore();

  if (!sentList || sentList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Bạn chưa gửi lời mời kết bạn nào
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <>
        {sentList.map((req) => (
          <FriendRequestItem
            key={req._id}
            requestInfo={req}
            type="sent"
            actions={
              <div className="flex items-baseline justify-between w-full ml-6">
                <p className="text-muted-foreground text-sm">
                  Đang chờ trả lời ...
                </p>
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="sm"
                  onClick={() => cancelRequest(req._id)}
                >
                  Thu hồi
                </Button>
              </div>
            }
          />
        ))}
      </>
    </div>
  );
};

export default SentRequests;
