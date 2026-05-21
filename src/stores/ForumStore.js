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
      console.log("Using mock data for UI testing");
      this.discussions = [
        {
          id: 1,
          votes: 128,
          tags: [{ label: 'React', color: 'blue' }, { label: 'Performance', color: 'orange' }],
          title: 'Memory Leak when using custom hooks with IntersectionObserver',
          excerpt: "I've been noticing a steady increase in memory usage when implementing an infinite scroll feature. I suspect my custom useIntersection hook isn't cleaning up properly on component unmount...",
          replies: 24,
          author: '@dev_marco',
          timestamp: 'Posted 2h ago',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          saved: false,
          hasCode: false
        },
        {
          id: 2,
          votes: 85,
          tags: [{ label: 'System Design', color: 'green' }, { label: 'Architecture', color: 'purple' }],
          title: 'Architecting a real-time notification system for scale (1M+ concurrent users)',
          excerpt: 'Looking for feedback on a proposed architecture using Redis Pub/Sub, WebSockets, and a set of Go microservices to handle high-throughput...',
          replies: 56,
          author: '@sys_admin_sarah',
          timestamp: 'Posted 5h ago',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          saved: false,
          hasCode: true,
          code: `// Go snippet example\nfunc (s *Sub) Subscribe(ctx context.Context, channel string) error {\n  pubsub := s.rdb.Subscribe(ctx, channel)\n  defer pubsub.Close()\n  // handle messages...\n}`
        },
        {
          id: 3,
          votes: 42,
          tags: [{ label: 'CSS', color: 'pink' }, { label: 'Tailwind', color: 'teal' }],
          title: 'Best practices for organizing large Tailwind configuration files',
          excerpt: 'As our design system grows, our tailwind.config.js is becoming a monolithic nightmare. How are larger teams structuring and splitting their configs for...',
          replies: 12,
          author: '@ui_josh',
          timestamp: 'Posted 1d ago',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          saved: false,
          hasCode: false
        },
        {
          id: 4,
          votes: 310,
          tags: [{ label: 'Vue.js', color: 'green' }, { label: 'Pinia', color: 'yellow' }],
          title: 'How to structure Pinia stores in a large modular Vue application?',
          excerpt: 'I am migrating from Vuex to Pinia. The documentation is great, but I am wondering if there are best practices for splitting stores by domain versus keeping them feature-based.',
          replies: 0,
          author: '@vue_master',
          timestamp: 'Posted 10m ago',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          saved: true,
          hasCode: false
        },
        {
          id: 5,
          votes: 5,
          tags: [{ label: 'JavaScript', color: 'yellow' }],
          title: 'Uncaught TypeError: Cannot read properties of undefined',
          excerpt: 'I keep getting this error when trying to access a deeply nested property in an API response. What is the most elegant way to handle this without optional chaining?',
          replies: 0,
          author: '@js_newbie',
          timestamp: 'Posted 1m ago',
          createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          saved: false,
          hasCode: true,
          code: `const user = response.data.user;\nconsole.log(user.profile.settings.theme);`
        }
      ];
    },

    async fetchDiscussion(id) {
      // Mock data for UI testing
      if (this.discussions.length === 0) {
        await this.fetchDiscussions();
      }
      
      const found = this.discussions.find((d) => d.id == id);
      
      if (found) {
        this.discussion = {
          ...found,
          replies: [
            {
              author: '@senior_dev',
              timestamp: '45 mins ago',
              body: 'I highly recommend extracting the logic into a custom hook or composable. It keeps the component clean and makes testing much easier.',
              likes: 12
            },
            {
              author: '@frontend_wizard',
              timestamp: '15 mins ago',
              body: 'This is a great question! Make sure you are also checking the dependency array in your watchers to avoid infinite loops.',
              likes: 8
            }
          ]
        };
      } else {
        this.discussion = null;
      }
    },

    async createDiscussion(data) {
      try {
        const res = await api.post("/discussions", data);
        this.discussions.unshift(res.data);
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
  },
});
