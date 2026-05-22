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
      console.log("Using mock data for UI testing");
      this.discussions = [
        {
          id: 1,
          votes: 128,
          voted: null,
          category: "question",
          tags: [
            { label: "React", color: "blue" },
            { label: "Performance", color: "orange" },
          ],
          title:
            "Memory Leak when using custom hooks with IntersectionObserver",
          excerpt:
            "I've been noticing a steady increase in memory usage when implementing an infinite scroll feature. I suspect my custom useIntersection hook isn't cleaning up properly on component unmount...",
          author: "@dev_marco",
          timestamp: "Posted 2h ago",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          saved: false,
          hasCode: false,
          replies: [
            {
              author: "@senior_dev",
              timestamp: "45 mins ago",
              body: "I highly recommend extracting the logic into a custom hook or composable. It keeps the component clean and makes testing much easier.",
              likes: 12,
              likedByUser: false,
            },
            {
              author: "@frontend_wizard",
              timestamp: "15 mins ago",
              body: "This is a great question! Make sure you are also checking the dependency array in your watchers to avoid infinite loops.",
              likes: 8,
              likedByUser: false,
            },
          ],
        },
        {
          id: 2,
          votes: 85,
          voted: null,
          category: "discussion",
          tags: [
            { label: "System Design", color: "green" },
            { label: "Architecture", color: "purple" },
          ],
          title:
            "Architecting a real-time notification system for scale (1M+ concurrent users)",
          excerpt:
            "Looking for feedback on a proposed architecture using Redis Pub/Sub, WebSockets, and a set of Go microservices to handle high-throughput...",
          author: "@sys_admin_sarah",
          timestamp: "Posted 5h ago",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          saved: false,
          hasCode: true,
          code: `// Go snippet example\nfunc (s *Sub) Subscribe(ctx context.Context, channel string) error {\n  pubsub := s.rdb.Subscribe(ctx, channel)\n  defer pubsub.Close()\n  // handle messages...\n}`,
          replies: [
            {
              author: "@gopher_guru",
              timestamp: "2 hours ago",
              body: "Using WebSockets with Go microservices is a solid choice. Have you considered using gRPC for high-throughput communication between internal services?",
              likes: 15,
              likedByUser: false,
            },
            {
              author: "@scaling_expert",
              timestamp: "1 hour ago",
              body: "Redis Pub/Sub might become a bottleneck at 1M+ concurrent users. You might want to evaluate Apache Kafka or NATS for long-term scalability.",
              likes: 9,
              likedByUser: false,
            },
          ],
        },
        {
          id: 3,
          votes: 42,
          voted: null,
          category: "tutorial",
          tags: [
            { label: "CSS", color: "pink" },
            { label: "Tailwind", color: "teal" },
          ],
          title:
            "Best practices for organizing large Tailwind configuration files",
          excerpt:
            "As our design system grows, our tailwind.config.js is becoming a monolithic nightmare. How are larger teams structuring and splitting their configs for...",
          author: "@ui_josh",
          timestamp: "Posted 1d ago",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          saved: false,
          hasCode: false,
          replies: [
            {
              author: "@css_ninja",
              timestamp: "18 hours ago",
              body: "We split our Tailwind config into multiple smaller helper files (colors.js, typography.js) and import them into the main config. It works wonderfully!",
              likes: 6,
              likedByUser: false,
            },
          ],
        },
        {
          id: 4,
          votes: 310,
          voted: null,
          category: "showcase",
          tags: [
            { label: "Vue.js", color: "green" },
            { label: "Pinia", color: "yellow" },
          ],
          title:
            "How to structure Pinia stores in a large modular Vue application?",
          excerpt:
            "I am migrating from Vuex to Pinia. The documentation is great, but I am wondering if there are best practices for splitting stores by domain versus keeping them feature-based.",
          author: "@vue_master",
          timestamp: "Posted 10m ago",
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          saved: true,
          hasCode: false,
          replies: [],
        },
        {
          id: 5,
          votes: 5,
          voted: null,
          category: "idea",
          tags: [{ label: "JavaScript", color: "yellow" }],
          title: "Uncaught TypeError: Cannot read properties of undefined",
          excerpt:
            "I keep getting this error when trying to access a deeply nested property in an API response. What is the most elegant way to handle this without optional chaining?",
          author: "@js_newbie",
          timestamp: "Posted 1m ago",
          createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          saved: false,
          hasCode: true,
          code: `const user = response.data.user;\nconsole.log(user.profile.settings.theme);`,
          replies: [],
        },
      ];
    },

    async fetchDiscussion(id) {
      if (this.discussions.length === 0) {
        await this.fetchDiscussions();
      }

      const found = this.discussions.find((d) => d.id == id);

      if (found) {
        // Ensure replies array exists
        if (!found.replies) {
          found.replies = [];
        }
        this.discussion = found;
      } else {
        this.discussion = null;
      }
    },

    async createDiscussion(data) {
      try {
        const res = await api.post("/discussions", data);
        const newD = {
          ...res.data,
          replies: res.data.replies || [],
          voted: null,
        };
        this.discussions.unshift(newD);
      } catch (error) {
        console.error("Error creating discussion:", error);
      }
    },

    async deleteDiscussion(id) {
      try {
        await api.delete(`/discussions/${id}`);
        this.discussions = this.discussions.filter((d) => d.id !== id);
      } catch (error) {
        console.error("Error deleting discussion:", error);
      }
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
