import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import adminService from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "AI & Data Science",
  "Electronics & Telecommunication",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  department: DEPARTMENTS[0],
  subject: "",
  defaultVenue: "",
};

export default function ManageFaculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [fac, ven] = await Promise.all([adminService.getFaculty(), adminService.getVenues()]);
      setFacultyList(fac);
      setVenues(ven);
      if (ven.length > 0 && !formData.defaultVenue) {
        setFormData((prev) => ({ ...prev, defaultVenue: ven[0].name }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load the faculty list.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(user) {
    try {
      await adminService.toggleUserStatus(user.id);
      await loadData();
      setSuccessMsg(`${user.name} is now ${user.active ? "disabled" : "enabled"}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not change the account status.");
    }
  }

  async function handleAddFaculty(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.name || !formData.email || !formData.password || !formData.subject) {
      setError("Fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await adminService.addFaculty({
        ...formData,
        identifier: "FAC-TCET-" + Math.floor(100 + Math.random() * 900),
      });

      setSuccessMsg(`Account created for ${formData.name}. Share the login details with the faculty member.`);
      setFormData({ ...EMPTY_FORM, defaultVenue: venues[0]?.name || "Staff Room 402" });
      setShowAddForm(false);
      await loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not create the faculty account.");
    } finally {
      setSubmitting(false);
    }
  }

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <>
      <div className="sl-page-head split">
        <div>
          <h1>Manage Faculty</h1>
          <p>Create faculty accounts and set their department, subject and default venue.</p>
        </div>
        <div className="sl-head-actions">
          <button className="sl-btn inline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Close form" : (<><Plus size={16} /> Add faculty</>)}
          </button>
        </div>
      </div>

      {successMsg && <div className="sl-notice" role="status">{successMsg}</div>}
      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {showAddForm && (
        <section className="sl-panel">
          <div className="sl-panel-head">
            <h2>New faculty account</h2>
          </div>
          <form className="sl-panel-body" onSubmit={handleAddFaculty}>
            <div className="sl-form-grid">
              <div className="sl-field">
                <label className="sl-label" htmlFor="f-name">Full name</label>
                <input id="f-name" className="sl-input" placeholder="e.g. Prof. Sharma" value={formData.name} onChange={set("name")} required />
              </div>

              <div className="sl-field">
                <label className="sl-label" htmlFor="f-email">College email</label>
                <input id="f-email" className="sl-input" type="email" placeholder="e.g. sharma@tcetmumbai.in" value={formData.email} onChange={set("email")} required />
              </div>

              <div className="sl-field">
                <label className="sl-label" htmlFor="f-pass">Initial password</label>
                <input id="f-pass" className="sl-input" type="password" value={formData.password} onChange={set("password")} required />
              </div>

              <div className="sl-field">
                <label className="sl-label" htmlFor="f-dept">Department</label>
                <select id="f-dept" className="sl-select" style={{ width: "100%" }} value={formData.department} onChange={set("department")}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="sl-field">
                <label className="sl-label" htmlFor="f-subject">Primary subject</label>
                <input id="f-subject" className="sl-input" placeholder="e.g. DBMS" value={formData.subject} onChange={set("subject")} required />
              </div>

              <div className="sl-field">
                <label className="sl-label" htmlFor="f-venue">Default venue</label>
                <input id="f-venue" className="sl-input" placeholder="e.g. Staff Room 402, 4th Floor" value={formData.defaultVenue} onChange={set("defaultVenue")} required />
              </div>
            </div>

            <div className="sl-form-actions">
              <button type="button" className="sl-btn ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="sl-btn" disabled={submitting}>
                {submitting ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="sl-panel">
        <div className="sl-panel-head">
          <h2>Registered faculty ({facultyList.length})</h2>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading faculty..." />
        ) : facultyList.length === 0 ? (
          <p className="sl-panel-empty">No faculty registered yet. Use Add faculty to create the first account.</p>
        ) : (
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Subject</th>
                  <th>Venue</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {facultyList.map((fac) => (
                  <tr key={fac.id}>
                    <td>
                      <div className="sl-cell-person">
                        <div className="sl-avatar">
                          {(fac.name || "F").replace(/^(prof|dr)\.?\s+/i, "").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{fac.name}</strong>
                          <span className="sub">{fac.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{fac.department || "General"}</td>
                    <td>{fac.subject || "Not assigned"}</td>
                    <td>{fac.defaultVenue || "Staff Room"}</td>
                    <td><code>{fac.identifier || `FAC-${fac.id}`}</code></td>
                    <td>
                      <span className={`sl-pill ${fac.active ? "accepted" : "cancelled"}`}>
                        {fac.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`sl-btn sm inline ${fac.active ? "danger" : "ghost"}`}
                        onClick={() => handleToggleStatus(fac)}
                      >
                        {fac.active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
