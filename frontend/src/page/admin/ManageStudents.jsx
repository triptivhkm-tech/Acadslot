import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      setError("");
      setStudents(await adminService.getStudents());
    } catch (err) {
      setError(err.response?.data?.message || "Could not load students.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(student) {
    try {
      await adminService.toggleUserStatus(student.id);
      await fetchStudents();
      setSuccessMsg(`${student.name} is now ${student.active ? "disabled" : "enabled"}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not change the account status.");
    }
  }

  return (
    <>
      <div className="sl-page-head">
        <h1>Manage Students</h1>
        <p>Verified college accounts with access to the student portal.</p>
      </div>

      {successMsg && <div className="sl-notice" role="status">{successMsg}</div>}
      {error && <ErrorMessage message={error} onRetry={fetchStudents} />}

      <section className="sl-panel">
        <div className="sl-panel-head">
          <h2>Registered students ({students.length})</h2>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading students..." />
        ) : students.length === 0 ? (
          <p className="sl-panel-empty">
            No students yet. Accounts are created when students first sign in with their @tcetmumbai.in Google account.
          </p>
        ) : (
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>College email</th>
                  <th>Roll number</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="sl-cell-person">
                        <div className="sl-avatar">{(student.name || "S").charAt(0).toUpperCase()}</div>
                        <strong>{student.name}</strong>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td><code>{student.identifier || `TCET-${student.id}`}</code></td>
                    <td>{student.department || "Engineering"}</td>
                    <td>
                      <span className={`sl-pill ${student.active ? "accepted" : "cancelled"}`}>
                        {student.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`sl-btn sm inline ${student.active ? "danger" : "ghost"}`}
                        onClick={() => handleToggle(student)}
                      >
                        {student.active ? "Disable" : "Enable"}
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
