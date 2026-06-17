import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { feeAPI } from "../utils/api";
import Sidebar from "../components/Sidebar";
import "../styles/FeeStructure.css";

const CLASSES = ["PreKG", "LKG", "UKG"];

const ALL_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function Fees() {
  const { students } = useAppContext();
  const allStudents = Object.values(students).flat();

  const [selectedClass, setSelectedClass] = useState("PreKG");
  const [searchQuery, setSearchQuery] = useState(""); // ← NEW: Search state
  const [feesData, setFeesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeMonths, setActiveMonths] = useState([]); // auto-populated from data

  // modal: null | { type:"add"|"edit", studentId, entry? }
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ month:"", date:"", amount:"" });
  const [formError, setFormError] = useState("");

  // add-month-column picker
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Load fees on mount ───────────────────────────────────
  useEffect(() => {
    loadAllFees();
  }, []);

  // ── Reload fees when class changes ───────────────────────
  useEffect(() => {
    filterFeesByClass();
  }, [selectedClass, feesData]);

  const loadAllFees = async () => {
    try {
      setLoading(true);
      const response = await feeAPI.getAll();
      if (response.success) {
        const grouped = {};
        response.data.forEach((entry) => {
          const key = entry.studentId?._id || entry.studentId;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            ...entry,
            id: entry._id,
            amount: Number(entry.amount) || 0,
            date: entry.date ? entry.date.split("T")[0] : "",
            month: entry.month
          });
        });
        setFeesData(grouped);
      }
    } catch (error) {
      console.error("Failed to load fee entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFeesByClass = () => {
    const classStudents = allStudents.filter((s) => s.classLevel === selectedClass);
    const months = new Set();

    // Collect all months for students in this class
    classStudents.forEach((student) => {
      const sid = student._id || student.id;
      const entries = feesData[sid] || [];
      entries.forEach((entry) => {
        if (entry.month) {
          months.add(entry.month);
        }
      });
    });

    // Set active months in calendar order
    const monthsInOrder = ALL_MONTHS.filter(m => months.has(m));
    setActiveMonths(monthsInOrder);
  };

  // ── Filter students by class and search query ────────────
  const classStudents = allStudents.filter((s) => {
    const isInClass = s.classLevel === selectedClass;
    const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return isInClass && matchesSearch;
  });

  const getEntries = (sid) => {
    const allEntries = feesData[sid] || [];
    // Only show entries for selected class
    return allEntries.filter(e => {
      const student = allStudents.find(s => (s._id || s.id) === sid);
      return student?.classLevel === selectedClass;
    });
  };

  const getTotal = (sid) =>
    getEntries(sid).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  // ── Add month column manually ───────────────────────────
  const addMonthColumn = (month) => {
    if (!activeMonths.includes(month)) {
      setActiveMonths(ALL_MONTHS.filter((m) => [...activeMonths, month].includes(m)));
    }
    setShowMonthPicker(false);
  };

  const removeMonthColumn = (month) => {
    setActiveMonths((prev) => prev.filter((m) => m !== month));
  };

  const availableToAdd = ALL_MONTHS.filter((m) => !activeMonths.includes(m));

  // ── Modal helpers ───────────────────────────────────────
  const openAdd = (sid, preselectedMonth = null) => {
    setForm({ 
      month: preselectedMonth || activeMonths[0] || "", 
      date: "", 
      amount: "" 
    });
    setFormError("");
    setModal({ type: "add", studentId: sid });
  };

  const openEdit = (sid, entry) => {
    setForm({ month: entry.month, date: entry.date, amount: entry.amount });
    setFormError("");
    setModal({ type: "edit", studentId: sid, entry });
  };

  const handleModalSave = async () => {
    if (!form.month) return setFormError("Please select a month.");
    if (!form.date) return setFormError("Please enter a date.");
    if (!form.amount || parseFloat(form.amount) <= 0) return setFormError("Please enter a valid amount.");

    const sid = modal.studentId;
    const student = allStudents.find((item) => (item._id || item.id) === sid);

    try {
      // Auto-add month column if not visible
      if (!activeMonths.includes(form.month)) {
        setActiveMonths((prev) => ALL_MONTHS.filter((m) => [...prev, form.month].includes(m)));
      }

      if (modal.type === "add") {
        const response = await feeAPI.create({
          studentId: sid,
          studentName: student?.name || "",
          classLevel: student?.classLevel || selectedClass,
          month: form.month,
          date: form.date,
          amount: form.amount
        });

        if (response.success) {
          const entry = {
            ...response.data,
            id: response.data._id,
            amount: Number(response.data.amount) || 0,
            date: response.data.date ? response.data.date.split("T")[0] : "",
            month: response.data.month
          };
          setFeesData((prev) => ({ 
            ...prev, 
            [sid]: [...(prev[sid] || []), entry] 
          }));
        }
      } else {
        const response = await feeAPI.update(modal.entry.id, {
          studentId: sid,
          studentName: student?.name || "",
          classLevel: student?.classLevel || selectedClass,
          month: form.month,
          date: form.date,
          amount: form.amount
        });

        if (response.success) {
          const entry = {
            ...response.data,
            id: response.data._id,
            amount: Number(response.data.amount) || 0,
            date: response.data.date ? response.data.date.split("T")[0] : "",
            month: response.data.month
          };
          setFeesData((prev) => ({
            ...prev,
            [sid]: (prev[sid] || []).map((item) => (item.id === modal.entry.id ? entry : item))
          }));
        }
      }

      setModal(null);
      setForm({ month: "", date: "", amount: "" });
    } catch (error) {
      console.error("Failed to save fee entry:", error);
      setFormError(error.message || "Failed to save fee entry");
    }
  };

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const { studentId, entryId } = deleteTarget;
      const response = await feeAPI.delete(entryId);
      if (response.success) {
        setFeesData((prev) => ({
          ...prev,
          [studentId]: (prev[studentId] || []).filter((entry) => entry.id !== entryId),
        }));
      }
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete fee entry:", error);
      alert("Failed to delete fee entry: " + (error.message || error));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main-content">
          <div style={{ padding: "20px", textAlign: "center" }}>Loading fees...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main-content">
        <header className="dashboard-header">
          <div>
            <h1>Fee Details</h1>
            <p className="header-subtitle">
              Manage fee records, totals, and payment dates for each class.
            </p>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="fees-page">

            {/* Class Tabs */}
            <div className="class-tabs">
              {CLASSES.map((cls) => (
                <button
                  key={cls}
                  className={`class-tab ${selectedClass === cls ? "active" : ""}`}
                  onClick={() => setSelectedClass(cls)}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Toolbar: summary + search + Add Month Column */}
            <div className="fees-toolbar">
              <div className="class-summary">
                <span className="summary-label">Class</span>
                <span className="summary-value">{selectedClass}</span>
                <span className="summary-divider" />
                <span className="summary-label">Students</span>
                <span className="summary-value">{classStudents.length}</span>
              </div>

              {/* Search Input */}
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="search-clear-btn"
                    onClick={() => setSearchQuery("")}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="month-col-control">
                <button
                  className="add-month-col-btn"
                  onClick={() => setShowMonthPicker((v) => !v)}
                  disabled={availableToAdd.length === 0}
                >
                  + Add Month Column
                </button>

                {showMonthPicker && (
                  <div className="month-picker-dropdown">
                    {availableToAdd.map((m) => (
                      <button
                        key={m}
                        className="month-pick-item"
                        onClick={() => addMonthColumn(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="fees-table-wrapper">
              <table className="fees-table">
                <thead>
                  <tr>
                    <th className="col-sno">S.No</th>
                    <th className="col-name">Student Name</th>

                    {activeMonths.map((m) => (
                      <th key={m} className="col-month">
                        <div className="month-header">
                          <span>{m.slice(0, 3)}</span>
                          <button
                            className="remove-month-btn"
                            title={`Remove ${m} column`}
                            onClick={() => removeMonthColumn(m)}
                          >✕</button>
                        </div>
                      </th>
                    ))}

                    {activeMonths.length === 0 && (
                      <th className="col-hint">— No month —</th>
                    )}

                    <th className="col-total">Total Paid</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={activeMonths.length + 4} className="empty-row">
                        <div className="empty-state">
                          <span className="empty-icon">👥</span>
                          <p>
                            {searchQuery 
                              ? `No students found matching "${searchQuery}" in ${selectedClass}`
                              : `No students found in ${selectedClass}`
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((student, index) => {
                      const sid     = student._id || student.id;
                      const entries = getEntries(sid);

                      return (
                        <tr key={sid}>
                          <td className="col-sno">{index + 1}</td>

                          <td className="col-name">
                            <div className="student-name-cell">
                              <div className="avatar">
                                {student.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="student-name-text">{student.name}</span>
                            </div>
                          </td>

                          {activeMonths.map((month) => {
                            const monthEntries = entries.filter((e) => e.month === month);
                            const isEmpty = monthEntries.length === 0;

                            return (
                              <td 
                                key={month} 
                                className="col-month"
                                onClick={() => {
                                  // Only open modal if cell is empty
                                  if (isEmpty) {
                                    openAdd(sid, month);
                                  }
                                }}
                              >
                                {isEmpty ? (
                                  <span className="no-entry">—</span>
                                ) : (
                                  monthEntries.map((entry) => (
                                    <div key={entry.id} className="entry-pill">
                                      <div className="entry-info">
                                        <span className="entry-amount">
                                          ₹{parseFloat(entry.amount).toLocaleString("en-IN")}
                                        </span>
                                        <span className="entry-date">{entry.date}</span>
                                      </div>
                                      <div className="entry-btns">
                                        <button
                                          className="pill-btn edit-btn"
                                          onClick={() => openEdit(sid, entry)}
                                        >Edit</button>
                                        <button
                                          className="pill-btn del-btn"
                                          onClick={() => setDeleteTarget({ studentId: sid, entryId: entry.id })}
                                        >Del</button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </td>
                            );
                          })}

                          {activeMonths.length === 0 && (
                            <td className="col-hint">
                              <span className="no-entry">—</span>
                            </td>
                          )}

                          <td className="col-total">
                            <span className="total-amount">
                              ₹{getTotal(sid).toLocaleString("en-IN")}
                            </span>
                          </td>

                          <td className="col-actions">
                            <button className="add-fee-btn" onClick={() => openAdd(sid)}>
                              + Add Fee
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>

      {/* ── Add / Edit Modal ──────────────────────────────── */}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.type === "add" ? "Add Fee Entry" : "Edit Fee Entry"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              <label className="field-label">Month</label>
              <select
                className="field-input"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              >
                <option value="">Select month</option>
                {ALL_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <label className="field-label">Date Paid</label>
              <input
                type="date"
                className="field-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <label className="field-label">Amount (₹)</label>
              <input
                type="number"
                className="field-input"
                placeholder="Enter amount"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />

              {formError && <p className="form-error">{formError}</p>}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-save" onClick={handleModalSave}>
                {modal.type === "add" ? "Add Entry" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────────── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Entry</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Delete this fee entry? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-delete" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}