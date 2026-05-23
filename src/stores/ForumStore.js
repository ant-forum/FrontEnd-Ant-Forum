import { defineStore } from "pinia";
import api from "../api/api.js";

export const useForumStore = defineStore("forum", {
  state: () => ({
    discussions: [],
    discussion: null,
  }),

  getters: {
    allDiscussions: (state) => state.discussions,
  },

  actions: {
    async fetchDiscussions() {
      if (this.discussions && this.discussions.length > 0) {
        return;
      }
      
      // Using static mock data for admin moderation UI
      this.discussions = [
        {
          id: 1,
          title: 'How to optimize Docker images for Node.js?',
          category: 'Development / DevOps',
          author: { name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=david' },
          replies: 24,
          views: 1200,
          status: 'ACTIVE',
          statusClass: 'status-active',
          reports: 0,
          created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
          description: "I've been working on a project where Docker image sizes are getting out of control. Does anyone have specific tips for Node.js multi-stage builds?"
        },
        {
          id: 2,
          title: 'Best practices for Vue 3 Composition API in large scale apps',
          category: 'Frontend / Vue',
          author: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarahc' },
          replies: 45,
          views: 3500,
          status: 'PINNED',
          statusClass: 'status-pinned',
          reports: 2,
          created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
          description: "When building large enterprise applications with Vue 3, should I stick to standard setup scripts or are there better ways to organize composables?"
        },
        {
          id: 3,
          title: 'Is it worth moving from REST to GraphQL in 2024?',
          category: 'Backend / API',
          author: { name: 'Marcus Wright', avatar: 'https://i.pravatar.cc/150?u=marcus' },
          replies: 12,
          views: 840,
          status: 'FLAGGED',
          statusClass: 'status-flagged',
          reports: 5,
          created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
          description: "I'm considering migrating our legacy REST API to GraphQL. Is the overhead of schema definition and tooling worth the performance benefits?"
        },
        {
          id: 4,
          title: 'New security vulnerability found in popular npm package',
          category: 'Security / Announcements',
          author: { name: 'Elena Vance', avatar: 'https://i.pravatar.cc/150?u=elena' },
          replies: 8,
          views: 2100,
          status: 'LOCKED',
          statusClass: 'status-locked',
          reports: 0,
          created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
          description: "Critical security alert: A remote code execution vulnerability was discovered in the 'fast-utils' package. Everyone should update to v2.4.1 immediately."
        },
        {
          id: 5,
          title: 'Microservices vs Monolith: A practical guide',
          category: 'Architecture',
          author: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=james' },
          replies: 15,
          views: 950,
          status: 'ACTIVE',
          statusClass: 'status-active',
          reports: 0,
          created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
          description: "When should a startup consider moving to microservices? We discuss the trade-offs in complexity vs scalability."
        }
      ];
    },

    getStatusClass(status) {
      const classes = {
        'ACTIVE': 'status-active',
        'PINNED': 'status-pinned',
        'FLAGGED': 'status-flagged',
        'LOCKED': 'status-locked'
      };
      return classes[status] || 'status-active';
    },

    async fetchDiscussion(id) {
      if (this.discussions.length === 0) {
        await this.fetchDiscussions();
      }
      this.discussion = this.discussions.find(d => d.id == id) || null;
    },

    async togglePin(id) {
      const discussion = this.discussions.find(d => d.id === id);
      if (discussion) {
        const newStatus = discussion.status === 'PINNED' ? 'ACTIVE' : 'PINNED';
        discussion.status = newStatus;
        discussion.statusClass = this.getStatusClass(newStatus);
      }
    },

    async toggleLock(id) {
      const discussion = this.discussions.find(d => d.id === id);
      if (discussion) {
        const newStatus = discussion.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
        discussion.status = newStatus;
        discussion.statusClass = this.getStatusClass(newStatus);
      }
    },

    async createDiscussion(data) {
      const newD = {
        id: Date.now(),
        ...data,
        author: { name: 'Current User', avatar: 'https://i.pravatar.cc/150' },
        replies: 0,
        views: 0,
        status: 'ACTIVE',
        statusClass: 'status-active',
        reports: 0,
        created_at: new Date().toISOString()
      };
      this.discussions.unshift(newD);
    },

    async deleteDiscussion(id) {
      this.discussions = this.discussions.filter((d) => d.id !== id);
    },

    // Reactive reply posting
    postReply(discussionId, replyData) {
      const found = this.discussions.find((d) => d.id == discussionId);
      if (found) {
        if (!found.replies) found.replies = [];
        found.replies.push(replyData);
      }
      if (this.discussion && this.discussion.id == discussionId) {
        if (!this.discussion.replies) this.discussion.replies = [];
        this.discussion.replies = [...found.replies];
      }
    },

    // Reactive upvoting/downvoting
    toggleVoteDiscussion(id, direction) {
      const found = this.discussions.find((d) => d.id == id);
      if (found) {
        if (direction === "up") {
          if (found.voted === "up") {
            found.votes--;
            found.voted = null;
          } else {
            if (found.voted === "down") found.votes += 2;
            else found.votes++;
            found.voted = "up";
          }
        } else if (direction === "down") {
          if (found.voted === "down") {
            found.votes++;
            found.voted = null;
          } else {
            if (found.voted === "up") found.votes -= 2;
            else found.votes--;
            found.voted = "down";
          }
        }
      }
      if (this.discussion && this.discussion.id == id) {
        this.discussion.votes = found.votes;
        this.discussion.voted = found.voted;
      }
    },

    // Reactive comment/reply liking
    toggleLikeReply(discussionId, replyIndex) {
      const found = this.discussions.find((d) => d.id == discussionId);
      if (found && found.replies && found.replies[replyIndex]) {
        const reply = found.replies[replyIndex];
        if (reply.likedByUser) {
          reply.likes = Math.max(0, reply.likes - 1);
          reply.likedByUser = false;
        } else {
          reply.likes++;
          reply.likedByUser = true;
        }
      }
      if (this.discussion && this.discussion.id == discussionId && this.discussion.replies && this.discussion.replies[replyIndex]) {
        this.discussion.replies[replyIndex].likes = found.replies[replyIndex].likes;
        this.discussion.replies[replyIndex].likedByUser = found.replies[replyIndex].likedByUser;
      }
    },
  },
});
