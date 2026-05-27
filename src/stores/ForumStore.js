import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";

export const useForumStore = defineStore("forum", () => {
  const discussions = ref([]);
  const discussion = ref(null);

  const allDiscussions = computed(() => discussions.value);

  const getStatusClass = (status) => {
    const classes = {
      'ACTIVE': 'status-active',
      'PINNED': 'status-pinned',
      'FLAGGED': 'status-flagged',
      'LOCKED': 'status-locked'
    };
    return classes[status] || 'status-active';
  };

  const fetchDiscussions = async () => {
    if (discussions.value && discussions.value.length > 0) {
      return;
    }
    
    const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
    if (useApi) {
      try {
        const response = await api.get("/discussions");
        discussions.value = response.data;
        return;
      } catch (error) {
        console.error("Failed to fetch discussions from API, falling back to mock data:", error);
      }
    }
    
    // rich fallback mock data
    discussions.value = [
      {
        id: 1,
        title: 'How to optimize Docker images for Node.js?',
        category: 'discussion',
        excerpt: "I've been working on a project where Docker image sizes are getting out of control. Does anyone have specific tips for Node.js multi-stage builds?",
        body: "I've been working on a project where Docker image sizes are getting out of control. Does anyone have specific tips for Node.js multi-stage builds? Currently our images are around 900MB which makes deployment extremely slow.",
        author: { name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=david', username: '@david' },
        replies: [
          {
            author: '@sarahc',
            timestamp: '2 hours ago',
            body: "Make sure you use **multi-stage builds** and choose a lightweight base image like `node:18-alpine` or `gcr.io/distroless/nodejs`. This usually drops the image size from 900MB to under 150MB!",
            likes: 12,
            likedByUser: false
          },
          {
            author: '@elena',
            timestamp: '1 hour ago',
            body: "Additionally, make sure you have a `.dockerignore` file! Excluding `node_modules`, `.git`, and build logs from the build context speeds up the transfer time and keeps the layers clean.",
            likes: 5,
            likedByUser: false
          }
        ],
        views: 1200,
        votes: 15,
        status: 'ACTIVE',
        statusClass: 'status-active',
        reports: 0,
        timestamp: '2 hours ago',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        tags: [
          { label: 'Docker', color: 'blue' },
          { label: 'Node.js', color: 'yellow' },
          { label: 'DevOps', color: 'purple' }
        ],
        hasCode: true,
        code: `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]`
      },
      {
        id: 2,
        title: 'Best practices for Vue 3 Composition API in large scale apps',
        category: 'question',
        excerpt: "When building large enterprise applications with Vue 3, should I stick to standard setup scripts or are there better ways to organize composables?",
        body: "When building large enterprise applications with Vue 3, should I stick to standard setup scripts or are there better ways to organize composables? I want to avoid massive reactive stores and keep the folder layouts maintainable.",
        author: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarahc', username: '@sarahc' },
        replies: [
          {
            author: '@james',
            timestamp: '4 hours ago',
            body: "Always split your business logic out of files into clear, dedicated **composables** (e.g. `useUserData.js`). Keep stores in Pinia minimal, and use scoped composables for page-specific states.",
            likes: 8,
            likedByUser: false
          }
        ],
        views: 3500,
        votes: 42,
        status: 'PINNED',
        statusClass: 'status-pinned',
        reports: 2,
        timestamp: '5 hours ago',
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        tags: [
          { label: 'Vue 3', color: 'green' },
          { label: 'Composition API', color: 'blue' },
          { label: 'Architecture', color: 'purple' }
        ],
        hasCode: false,
        code: ''
      },
      {
        id: 3,
        title: 'Is it worth moving from REST to GraphQL in 2026?',
        category: 'idea',
        excerpt: "I'm considering migrating our legacy REST API to GraphQL. Is the overhead of schema definition and tooling worth the performance benefits?",
        body: "I'm considering migrating our legacy REST API to GraphQL. Is the overhead of schema definition and tooling worth the performance benefits? We have complex nested structures that cause multiple network requests.",
        author: { name: 'Marcus Wright', avatar: 'https://i.pravatar.cc/150?u=marcus', username: '@marcus' },
        replies: [],
        views: 840,
        votes: 9,
        status: 'FLAGGED',
        statusClass: 'status-flagged',
        reports: 5,
        timestamp: '1 day ago',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        tags: [
          { label: 'GraphQL', color: 'pink' },
          { label: 'API', color: 'teal' },
          { label: 'Architecture', color: 'purple' }
        ],
        hasCode: false,
        code: ''
      },
      {
        id: 4,
        title: 'New security vulnerability found in popular npm package',
        category: 'tutorial',
        excerpt: "Critical security alert: A remote code execution vulnerability was discovered in the 'fast-utils' package. Everyone should update to v2.4.1 immediately.",
        body: "Critical security alert: A remote code execution vulnerability was discovered in the 'fast-utils' package. Everyone should update to v2.4.1 immediately. The exploit targets string prototype pollution.",
        author: { name: 'Elena Vance', avatar: 'https://i.pravatar.cc/150?u=elena', username: '@elena' },
        replies: [
          {
            author: '@david',
            timestamp: '10 hours ago',
            body: "Thanks for the heads up! Just verified our dependency trees and ran a quick audit. Highly recommend setting up `npm audit` inside CI scripts to catch these early.",
            likes: 14,
            likedByUser: true
          }
        ],
        views: 2100,
        votes: 28,
        status: 'LOCKED',
        statusClass: 'status-locked',
        reports: 0,
        timestamp: '12 hours ago',
        created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
        tags: [
          { label: 'Security', color: 'red' },
          { label: 'npm', color: 'orange' }
        ],
        hasCode: true,
        code: `npm audit fix --force`
      },
      {
        id: 5,
        title: 'Microservices vs Monolith: A practical guide',
        category: 'showcase',
        excerpt: "When should a startup consider moving to microservices? We discuss the trade-offs in complexity vs scalability.",
        body: "When should a startup consider moving to microservices? We discuss the trade-offs in complexity vs scalability. In 90% of cases, a well-structured monolith is faster to build and maintain.",
        author: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=james', username: '@james' },
        replies: [],
        views: 950,
        votes: 11,
        status: 'ACTIVE',
        statusClass: 'status-active',
        reports: 0,
        timestamp: '2 days ago',
        created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
        tags: [
          { label: 'Microservices', color: 'teal' },
          { label: 'Monolith', color: 'gray' },
          { label: 'System Design', color: 'purple' }
        ],
        hasCode: false,
        code: ''
      }
    ];
  };

  const fetchDiscussion = async (id) => {
    const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
    if (useApi) {
      try {
        const response = await api.get(`/discussions/${id}`);
        discussion.value = response.data;
        return;
      } catch (error) {
        console.error(`Failed to fetch discussion ${id} from API, falling back to mock data:`, error);
      }
    }

    if (discussions.value.length === 0) {
      await fetchDiscussions();
    }
    discussion.value = discussions.value.find(d => d.id == id) || null;
  };

  const createDiscussion = async (data) => {
    const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
    let newD;
    if (useApi) {
      try {
        const response = await api.post("/discussions", data);
        newD = response.data;
      } catch (error) {
        console.error("Failed to create discussion on API, falling back to local creation:", error);
      }
    }
    
    if (!newD) {
      newD = {
        id: Date.now(),
        ...data,
        author: data.author || { name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?u=alex', username: '@alex' },
        replies: [],
        views: 0,
        status: 'ACTIVE',
        statusClass: 'status-active',
        reports: 0,
        created_at: new Date().toISOString()
      };
    }
    discussions.value.unshift(newD);
  };

  const deleteDiscussion = async (id) => {
    const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
    if (useApi) {
      try {
        await api.delete(`/discussions/${id}`);
      } catch (error) {
        console.error(`Failed to delete discussion ${id} on API:`, error);
      }
    }
    discussions.value = discussions.value.filter((d) => d.id != id);
    if (discussion.value && discussion.value.id == id) {
      discussion.value = null;
    }
  };

  const togglePin = async (id) => {
    const d = discussions.value.find(x => x.id == id);
    if (d) {
      const newStatus = d.status === 'PINNED' ? 'ACTIVE' : 'PINNED';
      const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
      if (useApi) {
        try {
          await api.patch(`/discussions/${id}`, { status: newStatus });
        } catch (error) {
          console.error(`Failed to toggle pin for discussion ${id} on API:`, error);
        }
      }
      d.status = newStatus;
      d.statusClass = getStatusClass(newStatus);
      if (discussion.value && discussion.value.id == id) {
        discussion.value.status = newStatus;
        discussion.value.statusClass = getStatusClass(newStatus);
      }
    }
  };

  const toggleLock = async (id) => {
    const d = discussions.value.find(x => x.id == id);
    if (d) {
      const newStatus = d.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
      const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
      if (useApi) {
        try {
          await api.patch(`/discussions/${id}`, { status: newStatus });
        } catch (error) {
          console.error(`Failed to toggle lock for discussion ${id} on API:`, error);
        }
      }
      d.status = newStatus;
      d.statusClass = getStatusClass(newStatus);
      if (discussion.value && discussion.value.id == id) {
        discussion.value.status = newStatus;
        discussion.value.statusClass = getStatusClass(newStatus);
      }
    }
  };

  const postReply = async (discussionId, replyData) => {
    const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
    let finalReply = replyData;
    if (useApi) {
      try {
        const response = await api.post(`/discussions/${discussionId}/replies`, replyData);
        finalReply = response.data;
      } catch (error) {
        console.error(`Failed to post reply to discussion ${discussionId} on API:`, error);
      }
    }

    const found = discussions.value.find((d) => d.id == discussionId);
    if (found) {
      if (!found.replies || typeof found.replies === 'number') found.replies = [];
      found.replies.push(finalReply);
    }
    if (discussion.value && discussion.value.id == discussionId) {
      if (!discussion.value.replies || typeof discussion.value.replies === 'number') discussion.value.replies = [];
      discussion.value.replies = [...(found ? found.replies : [finalReply])];
    }
  };

  const toggleVoteDiscussion = async (id, direction) => {
    const found = discussions.value.find((d) => d.id == id);
    if (found) {
      let newVotes = found.votes || 0;
      let newVoted = direction;
      
      if (direction === "up") {
        if (found.voted === "up") {
          newVotes--;
          newVoted = null;
        } else {
          if (found.voted === "down") newVotes += 2;
          else newVotes++;
          newVoted = "up";
        }
      } else if (direction === "down") {
        if (found.voted === "down") {
          newVotes++;
          newVoted = null;
        } else {
          if (found.voted === "up") newVotes -= 2;
          else newVotes--;
          newVoted = "down";
        }
      }

      const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
      if (useApi) {
        try {
          await api.post(`/discussions/${id}/vote`, { direction });
        } catch (error) {
          console.error(`Failed to toggle vote on discussion ${id} on API:`, error);
        }
      }

      found.votes = newVotes;
      found.voted = newVoted;

      if (discussion.value && discussion.value.id == id) {
        discussion.value.votes = newVotes;
        discussion.value.voted = newVoted;
      }
    }
  };

  const toggleLikeReply = async (discussionId, replyIndex) => {
    const found = discussions.value.find((d) => d.id == discussionId);
    if (found && found.replies && found.replies[replyIndex]) {
      const reply = found.replies[replyIndex];
      const newLiked = !reply.likedByUser;
      const newLikes = newLiked ? (reply.likes || 0) + 1 : Math.max(0, (reply.likes || 1) - 1);

      const useApi = import.meta.env.VITE_USE_API === "true" || import.meta.env.VITE_USE_API === true;
      if (useApi) {
        try {
          await api.post(`/discussions/${discussionId}/replies/${replyIndex}/like`);
        } catch (error) {
          console.error(`Failed to like reply ${replyIndex} on discussion ${discussionId} on API:`, error);
        }
      }

      reply.likes = newLikes;
      reply.likedByUser = newLiked;

      if (discussion.value && discussion.value.id == discussionId && discussion.value.replies && discussion.value.replies[replyIndex]) {
        discussion.value.replies[replyIndex].likes = newLikes;
        discussion.value.replies[replyIndex].likedByUser = newLiked;
      }
    }
  };

  return {
    discussions,
    discussion,
    allDiscussions,
    getStatusClass,
    fetchDiscussions,
    fetchDiscussion,
    createDiscussion,
    deleteDiscussion,
    togglePin,
    toggleLock,
    postReply,
    toggleVoteDiscussion,
    toggleLikeReply
  };
});
