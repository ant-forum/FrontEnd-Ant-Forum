import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";
import { resolveMediaUrl } from "@/utils/mediaUrl";

export const useReportStore = defineStore("report", () => {
  const reports = ref([]);
  const report = ref(null);
  const myReports = ref([]);
  const isLoading = ref(false);
  const deletedReportCount = ref(0);

  // Computeds for admin views compatibility
  const threadReports = computed(() => reports.value);
  const pendingReports = computed(() =>
    reports.value.filter((r) => r.status === "Open")
  );
  const resolvedReports = computed(() =>
    reports.value.filter((r) => r.status === "Deleted")
  );
  const highPriorityReports = computed(() =>
    reports.value.filter((r) => r.priority === "High")
  );
  const lockedThreads = computed(() =>
    reports.value.filter((r) => r.locked)
  );

  const extractList = (responseData) => {
    if (!responseData) return [];
    const d =
      responseData.data !== undefined ? responseData.data : responseData;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    if (d && Array.isArray(d.items)) return d.items;
    if (d && Array.isArray(d.rows)) return d.rows;
    if (d && Array.isArray(d.results)) return d.results;
    return [];
  };

  const ensureSuccess = (res) => {
    if (res.data && (res.data.result === false || res.data.success === false)) {
      const msg = String(res.data.message || res.data.msg || "").toLowerCase();
      if (msg.includes("no report") || msg.includes("not found") || msg.includes("no data")) {
        return; // Treat empty states as successful empty collections
      }
      throw new Error(res.data.message || res.data.msg || "API request failed");
    }
  };

  const normalizeReport = (item) => {
    if (!item) return null;
    
    // Support both new flat backend schema and old nested model schema
    const isForum = String(item.type).toUpperCase() === "FORUM" || Boolean(item.forum_id || item.forum);
    const isProject = String(item.type).toUpperCase() === "PROJECT" || Boolean(item.project_id || item.project);
    
    let title = item.reported_title || "Reported Content";
    let detail = isForum ? "Forum Post" : (isProject ? "Project Showcase" : "General Content");
    let authorName = "Member";
    
    if (item.forum) {
      title = item.forum.title || item.forum.name || title;
      authorName = item.forum.author?.name || item.forum.author?.username || item.forum.user?.username || `User ${item.forum.user_id || ""}`;
    } else if (item.project) {
      title = item.project.title || item.project.projectName || item.project.name || title;
      authorName = item.project.author?.name || item.project.author?.username || item.project.user?.username || `User ${item.project.user_id || ""}`;
    }
    
    let priority = "Medium";
    const reasonText = item.reason || item._reason || "";
    const reasonLower = String(reasonText).toLowerCase();
    if (reasonLower.includes("harassment") || reasonLower.includes("hate") || reasonLower.includes("abuse") || reasonLower.includes("security")) {
      priority = "High";
    } else if (reasonLower.includes("spam") || reasonLower.includes("promo")) {
      priority = "Low";
    }
    
    let status = "Open";
    const statusLower = String(item.status || "").toLowerCase();
    if (statusLower === "approved" || statusLower === "resolved") {
      status = "Deleted";
    } else if (statusLower === "rejected" || statusLower === "dismissed") {
      status = "Dismissed";
    } else if (statusLower === "pending" || statusLower === "open") {
      status = "Open";
    } else if (item.status) {
      status = item.status;
    }
    
    const reasonsList = reasonText ? [reasonText] : ["No reason specified"];
    const reportersList = item.reporter_name 
      ? [item.reporter_name] 
      : (item.user ? [item.user.name || item.user.username] : [`User #${item.reporter_id || item.user_id}`]);
    
    const resolvedImage = resolveMediaUrl(item.image || item._image || null);
    
    return {
      id: item.report_id || item.id,
      threadId: isForum ? (item.reference_id || item.forum_id || null) : null,
      projectId: isProject ? (item.reference_id || item.project_id || null) : null,
      title: title,
      detail: detail,
      excerpt: reasonText || item.reported_description || "",
      author: authorName,
      priority: priority,
      reports: 1,
      status: status,
      locked: Boolean(item.forum?.locked || item.project?.locked || item.locked || false),
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      reasons: reasonsList,
      reportedBy: reportersList,
      notes: item.notes || [],
      image: resolvedImage,
      rawItem: item
    };
  };

  const fetchAllReports = async () => {
    isLoading.value = true;
    try {
      const res = await api.get("/api/report/getAllReport");
      ensureSuccess(res);
      const list = extractList(res.data);
      reports.value = list.map(normalizeReport).filter(Boolean);
      return reports.value;
    } catch (err) {
      console.error("[ReportStore] fetchAllReports failed:", err);
      reports.value = [];
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchReportById = async (id) => {
    isLoading.value = true;
    try {
      const res = await api.get(`/api/report/getReportByReportID/${id}`);
      ensureSuccess(res);
      const raw =
        res.data?.data?.row || res.data?.row || res.data?.data || res.data;
      report.value = normalizeReport(raw) || null;
      return report.value;
    } catch (err) {
      console.error(`[ReportStore] fetchReportById ${id} failed:`, err);
      report.value = null;
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchReportsByUserId = async (userId) => {
    isLoading.value = true;
    try {
      const res = await api.get(`/api/report/getReportByUserID/${userId}`);
      ensureSuccess(res);
      const list = extractList(res.data);
      return list.map(normalizeReport).filter(Boolean);
    } catch (err) {
      console.error(
        `[ReportStore] fetchReportsByUserId ${userId} failed:`,
        err
      );
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMyReports = async () => {
    isLoading.value = true;
    try {
      const res = await api.get("/api/report/getMyReport");
      ensureSuccess(res);
      const list = extractList(res.data);
      myReports.value = list.map(normalizeReport).filter(Boolean);
      return myReports.value;
    } catch (err) {
      console.error("[ReportStore] fetchMyReports failed:", err);
      myReports.value = [];
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const updateReportStatus = async (id, status) => {
    isLoading.value = true;
    try {
      const res = await api.put(`/api/report/updateStatus/${id}`, { status });
      ensureSuccess(res);
      const updated = res.data?.data || res.data;
      const index = reports.value.findIndex((r) => r.id == id);
      if (index !== -1) {
        reports.value[index].status = status === "approved" ? "Deleted" : (status === "rejected" ? "Dismissed" : status);
      }
      return updated;
    } catch (err) {
      console.error(`[ReportStore] updateReportStatus ${id} failed:`, err);
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const resolveReport = async (id, note) => {
    await updateReportStatus(id, "approved");
    const item = reports.value.find((r) => r.id == id);
    if (item && note) {
      item.notes.push({ text: note.trim(), createdAt: new Date().toISOString() });
    }
  };

  const dismissReport = async (id, note) => {
    await updateReportStatus(id, "rejected");
    const item = reports.value.find((r) => r.id == id);
    if (item && note) {
      item.notes.push({ text: note.trim(), createdAt: new Date().toISOString() });
    }
  };

  const warnThreadAuthor = async (id, note) => {
    const item = reports.value.find((r) => r.id == id);
    if (item && note) {
      item.notes.push({ text: `Warned Author: ${note.trim()}`, createdAt: new Date().toISOString() });
    }
  };

  const toggleThreadLock = async (id, note) => {
    const item = reports.value.find((r) => r.id == id);
    if (item) {
      item.locked = !item.locked;
      if (note) {
        item.notes.push({ text: `Toggled Lock: ${note.trim()}`, createdAt: new Date().toISOString() });
      }
    }
  };

  const deleteReport = async (id) => {
    isLoading.value = true;
    try {
      const res = await api.delete(`/api/report/deleteReport/${id}`);
      ensureSuccess(res);
      reports.value = reports.value.filter((r) => r.id != id);
      myReports.value = myReports.value.filter((r) => r.id != id);
      deletedReportCount.value++;
      if (report.value && report.value.id == id) {
        report.value = null;
      }
    } catch (err) {
      console.error(`[ReportStore] deleteReport ${id} failed:`, err);
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const createForumReport = async (forumId, reason, image) => {
    isLoading.value = true;
    try {
      const formData = new FormData();
      formData.append("reason", reason);
      formData.append("_reason", reason);
      if (image) {
        formData.append("image", image);
      }
      formData.append("forum_id", forumId);
      formData.append("forumId", forumId);
      formData.append("_forum_id", forumId);

      const res = await api.post(`/api/report/createForumReport/${forumId}`, formData);
      ensureSuccess(res);
      return res.data;
    } catch (err) {
      console.error(`[ReportStore] createForumReport ${forumId} failed:`, err);
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const createProjectReport = async (projectId, reason, image) => {
    isLoading.value = true;
    try {
      const formData = new FormData();
      formData.append("reason", reason);
      formData.append("_reason", reason);
      if (image) {
        formData.append("image", image);
      }
      formData.append("project_id", projectId);
      formData.append("projectId", projectId);
      formData.append("_project_id", projectId);
      
      const res = await api.post(`/api/report/createProjectReport/${projectId}`, formData);
      ensureSuccess(res);
      return res.data;
    } catch (err) {
      console.error(`[ReportStore] createProjectReport ${projectId} failed:`, err);
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    reports,
    report,
    myReports,
    isLoading,
    deletedReportCount,
    threadReports,
    pendingReports,
    resolvedReports,
    highPriorityReports,
    lockedThreads,
    fetchAllReports,
    fetchReportById,
    fetchReportsByUserId,
    fetchMyReports,
    updateReportStatus,
    resolveReport,
    dismissReport,
    warnThreadAuthor,
    toggleThreadLock,
    deleteReport,
    createForumReport,
    createProjectReport,
  };
});
