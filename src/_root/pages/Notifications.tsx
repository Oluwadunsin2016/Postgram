import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/lib/react-query/queries";
import { formatRelativeTime } from "@/lib/utils";
import { Bell, Heart, MessageCircle, Repeat2, UserPlus, CheckCheck, AtSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@nextui-org/react";

const notificationIcon = {
  post_like: Heart,
  post_comment: MessageCircle,
  comment_reply: MessageCircle,
  comment_like: Heart,
  repost: Repeat2,
  tag: AtSign,
  follow: UserPlus,
};

const getNotificationTarget = (notification: any) => {
  if (notification.type === "follow" && notification.actor?._id) return `/profile/${notification.actor._id}`;
  if (notification.post?._id) return `/posts/${notification.post._id}`;
  return "/";
};

const Notifications = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetNotifications();
  const { mutateAsync: markRead } = useMarkNotificationRead();
  const { mutateAsync: markAllRead, isLoading: isMarkingAll } = useMarkAllNotificationsRead();
  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleOpenNotification = async (notification: any) => {
    if (!notification.readAt) await markRead(notification._id);
    navigate(getNotificationTarget(notification));
  };

  return (
    <div className="common-container">
      <div className="w-full max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-500/15 text-primary-500">
                <Bell size={22} />
              </span>
              <div>
                <h1 className="h2-bold md:h1-semibold">Notifications</h1>
                <p className="mt-1 text-light-3 small-regular">Likes, comments, reposts, tags, and new followers.</p>
              </div>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 small-semibold text-white transition hover:bg-primary-600 disabled:opacity-60"
            >
              <CheckCheck size={17} />
              Mark all read
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-dark-4 bg-dark-2/70 shadow-2xl">
          {isLoading ? (
            <div className="divide-y divide-dark-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-start gap-4 px-4 py-4 md:px-5">
                  <Skeleton className="h-12 w-12 flex-none rounded-full bg-dark-4" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 rounded-lg bg-dark-4" />
                    <Skeleton className="mt-2 h-4 w-1/2 rounded-lg bg-dark-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="grid min-h-[22rem] place-items-center px-6 text-center">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-dark-3 text-light-3">
                  <AtSign size={26} />
                </span>
                <p className="mt-4 base-semibold text-light-1">No notifications yet</p>
                <p className="mt-1 text-light-3 small-regular">When people interact with you, it will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-dark-4">
              {notifications.map((notification: any) => {
                const Icon = notificationIcon[notification.type as keyof typeof notificationIcon] || Bell;
                const isUnread = !notification.readAt;
                return (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => handleOpenNotification(notification)}
                    className={`flex w-full items-start gap-4 px-4 py-4 text-left transition hover:bg-dark-3 md:px-5 ${
                      isUnread ? "bg-primary-500/10" : "bg-transparent"
                    }`}
                  >
                    <div className="relative flex-none">
                      <img
                        src={notification.actor?.imageUrl || "/assets/images/default_user_image.png"}
                        alt={notification.actor?.name || "User"}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
                      />
                      <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-dark-2 bg-dark-1 text-primary-500">
                        <Icon size={15} className={notification.type.includes("like") ? "fill-red text-red" : ""} />
                      </span>
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block text-light-1 base-medium">
                        <span className="font-bold">{notification.actor?.name || "Someone"}</span>{" "}
                        <span className="text-light-2">{notification.text}</span>
                      </span>
                      {notification.post?.caption && (
                        <span className="mt-1 block line-clamp-1 text-light-3 small-regular">"{notification.post.caption}"</span>
                      )}
                      <span className="mt-2 block text-light-4 tiny-medium">{formatRelativeTime(notification.createdAt)}</span>
                    </span>
                    {isUnread && <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-primary-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
