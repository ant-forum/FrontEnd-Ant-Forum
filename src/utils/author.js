import { resolveMediaUrl } from "./mediaUrl";
import { useAuthStore } from "@/stores/AuthStore";
import { useUsersStore } from "@/stores/UsersStore";
import { useForumStore } from "@/stores/ForumStore";

export const resolveAuthor = (userId, defaultAuthor, rawItem, cachedUser) => {
  // First, check if we have a cached user
  if (cachedUser) {
    return {
      name: cachedUser.name || cachedUser.username || "Unknown",
      avatar: resolveMediaUrl(
        cachedUser.profile_pic || cachedUser.avatar,
        "https://i.pravatar.cc/150?u=default"
      ),
      username: cachedUser.username ? `@${cachedUser.username}` : "@unknown"
    };
  }

  // First, check if rawItem has direct author fields (like the forum API returns)
  if (rawItem) {
    if (rawItem.author || rawItem.author_avatar || rawItem.username) {
      return {
        name: rawItem.author || rawItem.username || rawItem.name || "Unknown",
        avatar: resolveMediaUrl(
          rawItem.author_avatar || rawItem.avatar || rawItem.profile_pic,
          "https://i.pravatar.cc/150?u=default"
        ),
        username: rawItem.username 
          ? `@${rawItem.username}` 
          : (rawItem.author ? `@${rawItem.author}` : "@unknown")
      };
    }
  }

  if (!userId) {
    if (defaultAuthor) {
      return {
        name: defaultAuthor.name || defaultAuthor.username || "Unknown",
        avatar: resolveMediaUrl(
          defaultAuthor.profile_pic || defaultAuthor.avatar,
          "https://i.pravatar.cc/150?u=default"
        ),
        username: defaultAuthor.username ? `@${defaultAuthor.username}` : "@unknown",
      };
    }
    return {
      name: "Unknown",
      avatar: "https://i.pravatar.cc/150?u=default",
      username: "@unknown",
    };
  }

  // 1. Check AuthStore (current user)
  const authStore = useAuthStore();
  if (authStore.user && (Number(authStore.user.id) === Number(userId) || Number(authStore.user.user_id) === Number(userId))) {
    return {
      name: authStore.user.name || authStore.user.username || "Unknown",
      avatar: resolveMediaUrl(
        authStore.user.profile_pic || authStore.user.avatar,
        "https://i.pravatar.cc/150?u=default"
      ),
      username: authStore.user.username ? `@${authStore.user.username}` : "@unknown",
    };
  }

  // 2. Check UsersStore (admin users list)
  const usersStore = useUsersStore();
  if (usersStore.users && usersStore.users.length > 0) {
    const u = usersStore.users.find(u => Number(u.id) === Number(userId) || Number(u.user_id) === Number(userId));
    if (u) {
      return {
        name: u.name || u.username || "Unknown",
        avatar: resolveMediaUrl(
          u.profile_pic || u.avatar,
          "https://i.pravatar.cc/150?u=default"
        ),
        username: u.username ? `@${u.username}` : "@unknown",
      };
    }
  }

  // 3. Check ForumStore discussions
  const forumStore = useForumStore();
  if (forumStore.discussions && forumStore.discussions.length > 0) {
    const d = forumStore.discussions.find(d => {
      const dUserId = d.user_id || d.userId;
      return dUserId && Number(dUserId) === Number(userId);
    });
    if (d) {
      const u = d.user || d.author;
      if (u && typeof u === 'object') {
        return {
          name: u.name || u.username || "Unknown",
          avatar: resolveMediaUrl(
            u.profile_pic || u.avatar || d.author_avatar,
            "https://i.pravatar.cc/150?u=default"
          ),
          username: u.username ? `@${u.username}` : "@unknown",
        };
      }
    }
  }

  // 4. Check ForumStore comments
  if (forumStore.comments && forumStore.comments.length > 0) {
    const c = forumStore.comments.find(c => {
      const cUserId = c.user_id || c.userId;
      return cUserId && Number(cUserId) === Number(userId);
    });
    if (c) {
      const u = c.author || c.user;
      if (u && typeof u === 'object') {
        return {
          name: u.name || u.username || "Unknown",
          avatar: resolveMediaUrl(
            u.profile_pic || u.avatar,
            "https://i.pravatar.cc/150?u=default"
          ),
          username: u.username ? `@${u.username}` : "@unknown",
        };
      }
    }
  }

  // Fallback to defaultAuthor or Unknown
  if (defaultAuthor) {
    return {
      name: defaultAuthor.name || defaultAuthor.username || "Unknown",
      avatar: resolveMediaUrl(
        defaultAuthor.profile_pic || defaultAuthor.avatar,
        "https://i.pravatar.cc/150?u=default"
      ),
      username: defaultAuthor.username ? `@${defaultAuthor.username}` : "@unknown",
    };
  }

  return {
    name: "Unknown",
    avatar: "https://i.pravatar.cc/150?u=default",
    username: "@unknown",
  };
};
