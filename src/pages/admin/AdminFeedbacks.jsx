import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash, FaEye } from "react-icons/fa";

function truncate(str, n = 70) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[,"\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("pending"); // pending | approved | rejected

  const [showView, setShowView] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [newStatus, setNewStatus] = useState("pending");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const backendBase = useMemo(() => {
    const base = import.meta.env.VITE_BACKEND_URL || "";
    return base.endsWith("/") ? base.slice(0, -1) : base;
  }, []);

console.log("TOKEN:", localStorage.getItem("token"));


  const filtered = useMemo(() => {
    return feedbacks.filter((f) => (f.status || "pending") === activeTab);
  }, [feedbacks, activeTab]);

  function formatDateTime(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const statusBadge = (status) => {
    const s = status || "pending";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize
          ${
            s === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : s === "approved"
                ? "bg-green-100 text-green-800"
                : s === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
          }`}
      >
        {s}
      </span>
    );
  };

  const fetchAll = async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      toast.error("Please login first");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.get(`${backendBase}/api/feedbacks/`, {
        headers: { Authorization: "Bearer " + t },
      });

      // Your API returns: { message, data: [...] }
      setFeedbacks(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Error fetching feedbacks");
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openViewModal(item) {
    setViewItem(item);
    setShowView(true);
  }

  function closeViewModal() {
    setShowView(false);
    setViewItem(null);
  }

  function openUpdateModal(id) {
    const item = feedbacks.find((x) => x._id === id);
    setUpdateId(id);
    setNewStatus(item?.status || "pending");
    setShowUpdateConfirm(true);
  }

  function closeUpdateModal() {
    setShowUpdateConfirm(false);
    setUpdateId(null);
  }

  function openDeleteModal(id) {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }

  function closeDeleteModal() {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }

  async function updateStatus(id, status) {
    const t = localStorage.getItem("token");
    if (!t) {
      toast.error("Please login first");
      return;
    }

    try {
      await axios.put(
        `${backendBase}/api/feedbacks/${id}`,
        { status },
        { headers: { Authorization: "Bearer " + t } },
      );

      toast.success("Status updated");
      closeUpdateModal();

      // local update (no need to refetch, but you can)
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status } : f)),
      );
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Something went wrong");
    }
  }

  async function deleteFeedback(id) {
    const t = localStorage.getItem("token");
    if (!t) {
      toast.error("Please login first");
      return;
    }

    try {
      await axios.delete(`${backendBase}/api/feedbacks/${id}`, {
        headers: { Authorization: "Bearer " + t },
      });

      toast.success("Deleted successfully");
      closeDeleteModal();

      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Something went wrong");
    }
  }

  function downloadFeedbacksCSV() {
    const rows = feedbacks;
    if (!Array.isArray(rows) || rows.length === 0) {
      toast.error("No feedbacks to export");
      return;
    }

    const headers = ["Name", "Rating", "Message", "Status", "Created At", "ID"];

    const body = rows.map((f) => [
      f.name,
      f.rating,
      f.message,
      f.status,
      formatDateTime(f.createdAt),
      f._id,
    ]);

    const csv =
      "\uFEFF" +
      [headers, ...body].map((r) => r.map(escapeCsv).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8).replace(/:/g, "-");
    a.download = `feedbacks-${date}_${time}.csv`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast.success("CSV downloaded");
  }

  const tabCount = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    for (const f of feedbacks) {
      const s = f.status || "pending";
      if (c[s] !== undefined) c[s] += 1;
    }
    return c;
  }, [feedbacks]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-100 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 bg-white rounded-t-xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedbacks</h1>
          <p className="text-sm text-gray-600 mt-1">
            Approve or reject reviews before showing them on the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={downloadFeedbacksCSV}
            className="hidden sm:inline-flex items-center gap-2 bg-white text-gray-900 font-semibold py-2.5 px-5 rounded-full border border-gray-300 shadow-sm hover:bg-gray-50 transition"
          >
            Download CSV
          </button>

          <button
            type="button"
            onClick={fetchAll}
            className="hidden sm:inline-flex items-center gap-2 bg-gray-900 text-white font-semibold py-2.5 px-5 rounded-full shadow hover:bg-gray-800 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "pending", label: "Pending", count: tabCount.pending },
            { key: "approved", label: "Approved", count: tabCount.approved },
            { key: "rejected", label: "Rejected", count: tabCount.rejected },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full border text-sm font-semibold transition
                ${
                  activeTab === t.key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                }`}
            >
              {t.label}{" "}
              <span
                className={`ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs
                  ${
                    activeTab === t.key
                      ? "bg-white/15 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {isLoading ? (
          <div className="w-full h-[40vh] flex justify-center items-center">
            <div className="w-[70px] h-[70px] border-[5px] border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-[1050px] w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="py-3 px-4 text-left font-semibold w-[200px]">
                        Name
                      </th>
                      <th className="py-3 px-4 text-left font-semibold w-[120px]">
                        Rating
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Message
                      </th>
                      <th className="py-3 px-4 text-left font-semibold w-[170px] whitespace-nowrap">
                        Created
                      </th>
                      <th className="py-3 px-4 text-left font-semibold w-[140px]">
                        Status
                      </th>
                      <th className="py-3 px-4 text-center font-semibold w-[220px]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {item.name}
                        </td>

                        <td className="py-3 px-4 text-gray-900 font-semibold">
                          {item.rating}/5
                        </td>

                        <td className="py-3 px-4 text-gray-700">
                          <div className="flex items-center gap-3">
                            <span className="block max-w-[520px] truncate">
                              {item.message}
                            </span>
                            <button
                              type="button"
                              onClick={() => openViewModal(item)}
                              className="inline-flex items-center gap-2 text-gray-900 hover:underline"
                              title="View full message"
                            >
                              <FaEye />
                              <span className="text-xs">View</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          {formatDateTime(item.createdAt)}
                        </td>

                        <td className="py-3 px-4">{statusBadge(item.status)}</td>

                        <td className="py-3 px-4">
                          <div className="flex justify-center items-center gap-3">
                            {/* Approve/Reject only for pending */}
                            {activeTab === "pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUpdateId(item._id);
                                    setNewStatus("approved");
                                    setShowUpdateConfirm(true);
                                  }}
                                  className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition text-sm font-semibold"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUpdateId(item._id);
                                    setNewStatus("rejected");
                                    setShowUpdateConfirm(true);
                                  }}
                                  className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition text-sm font-semibold"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openUpdateModal(item._id)}
                                className="px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition text-sm font-semibold"
                              >
                                Change status
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => openDeleteModal(item._id)}
                              className="p-2 rounded-full bg-red-50 hover:bg-red-100 transition"
                              title="Delete"
                            >
                              <FaTrash className="text-red-600 text-[18px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-gray-600"
                        >
                          No {activeTab} feedbacks found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filtered.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDeleteModal(item._id)}
                        className="p-2 rounded-full bg-red-50 hover:bg-red-100 transition"
                        title="Delete"
                      >
                        <FaTrash className="text-red-600 text-[18px]" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-900 font-semibold">
                      {item.rating}/5
                    </p>
                    {statusBadge(item.status)}
                  </div>

                  <p className="mt-3 text-sm text-gray-700">
                    {truncate(item.message, 140)}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openViewModal(item)}
                      className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:underline"
                    >
                      <FaEye />
                      View full
                    </button>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {activeTab === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateStatus(item._id, "approved")}
                          className="flex-1 px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition text-sm font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(item._id, "rejected")}
                          className="flex-1 px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition text-sm font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openUpdateModal(item._id)}
                        className="flex-1 px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition text-sm font-semibold"
                      >
                        Change status
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
                  No {activeTab} feedbacks found.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      {showView && viewItem && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={closeViewModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-[92vw] max-w-[650px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Feedback Message
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {viewItem.name} • {viewItem.rating}/5 •{" "}
                  {statusBadge(viewItem.status)}
                </p>
              </div>
              <button
                onClick={closeViewModal}
                className="px-3 py-1.5 rounded-md border text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {viewItem.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-[320px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this feedback?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100 transition"
              >
                No
              </button>

              <button
                onClick={() => deleteFeedback(deleteId)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateConfirm && updateId && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={closeUpdateModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-[360px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Update Status
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Choose a new status for this feedback.
            </p>

            <label className="text-sm font-semibold text-gray-700">Status</label>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="mt-4">{statusBadge(newStatus)}</div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeUpdateModal}
                className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => updateStatus(updateId, newStatus)}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
