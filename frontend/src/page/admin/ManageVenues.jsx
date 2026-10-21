import { useState, useEffect } from "react";
import { Building2, Trash2 } from "lucide-react";
import adminService from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState("");
  const [building, setBuilding] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    try {
      setLoading(true);
      setError("");
      setVenues(await adminService.getVenues());
    } catch (err) {
      setError(err.response?.data?.message || "Could not load venues.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddVenue(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError("");
      await adminService.addVenue({
        name: name.trim(),
        building: building.trim(),
        description: description.trim(),
      });
      setSuccessMsg(`Venue "${name.trim()}" added.`);
      setName("");
      setBuilding("");
      setDescription("");
      await fetchVenues();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add the venue.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteVenue(id, venueName) {
    if (!window.confirm(`Delete "${venueName}"?`)) return;
    try {
      await adminService.deleteVenue(id);
      setSuccessMsg(`Venue "${venueName}" deleted.`);
      await fetchVenues();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the venue.");
    }
  }

  return (
    <>
     

      {successMsg && <div className="sl-notice" role="status">{successMsg}</div>}
      {error && <ErrorMessage message={error} onRetry={fetchVenues} />}

      <div className="sl-aside-layout">
        <section className="sl-panel">
          <div className="sl-panel-head">
            <h2>Add venue</h2>
          </div>
          <form className="sl-panel-body" onSubmit={handleAddVenue}>
            <div className="sl-field">
              <label className="sl-label" htmlFor="venue-name">Venue name</label>
              <input
                id="venue-name"
                className="sl-input"
                placeholder="e.g. Staff Room 402"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="sl-field">
              <label className="sl-label" htmlFor="venue-building">Building and floor</label>
              <input
                id="venue-building"
                className="sl-input"
                placeholder="e.g. Computer Engineering Block, 4th Floor"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              />
            </div>

            <div className="sl-field">
              <label className="sl-label" htmlFor="venue-desc">Description (optional)</label>
              <textarea
                id="venue-desc"
                className="sl-textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="sl-btn" disabled={submitting || !name.trim()}>
              {submitting ? "Adding..." : "Add venue"}
            </button>
          </form>
        </section>

        <section className="sl-panel">
          <div className="sl-panel-head">
            <h2>Configured venues ({venues.length})</h2>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading venues..." />
          ) : venues.length === 0 ? (
            <p className="sl-panel-empty">No venues yet. Add a staff room or lab using the form.</p>
          ) : (
            venues.map((v) => (
              <article className="sl-entry" key={v.id}>
                <div>
                  <h4>{v.name}</h4>
                  {v.building && (
                    <div className="sl-item-meta">
                      <div>
                        <Building2 size={15} />
                        {v.building}
                      </div>
                    </div>
                  )}
                  {v.description && <p className="note">{v.description}</p>}
                </div>
                <button
                  type="button"
                  className="sl-icon-action"
                  onClick={() => handleDeleteVenue(v.id, v.name)}
                  aria-label={`Delete ${v.name}`}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}
