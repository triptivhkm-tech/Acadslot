
import { useState } from "react";
import {
  ClipboardList,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  FolderOpen,
  FileText,
  UserRound,
} from "lucide-react";

const initialRequests = [
  {
    id: 1,
    studentName: "Aarav Sharma",
    studentId: "STU101",
    subject: "DBMS",
    serviceType: "Project Guidance",
    description:
      "I need guidance for designing an ER diagram and database schema for my college project.",
    date: "2026-10-15",
    status: "Pending",
  },
  {
    id: 2,
    studentName: "Priya Patil",
    studentId: "STU102",
    subject: "Java",
    serviceType: "Assignment Review",
    description:
      "I would like my Java assignment reviewed, especially the object-oriented programming concepts.",
    date: "2026-10-14",
    status: "Accepted",
  },
  {
    id: 3,
    studentName: "Rohan Verma",
    studentId: "STU103",
    subject: "Data Structures",
    serviceType: "Extra Academic Guidance",
    description:
      "I need additional guidance on AVL trees and tree rotations before my practical examination.",
    date: "2026-10-12",
    status: "Completed",
  },
  {
    id: 4,
    studentName: "Sneha Joshi",
    studentId: "STU104",
    subject: "DBMS",
    serviceType: "Project Guidance",
    description:
      "I need help planning the tables and relationships for a college management system.",
    date: "2026-10-16",
    status: "Pending",
  },
];

const statusStyles = {
  Pending: "service-status-pending",
  Accepted: "service-status-accepted",
  Rejected: "service-status-rejected",
  Completed: "service-status-completed",
};

export default function TeacherServiceRequest() {
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const updateStatus = (id, newStatus) => {
    setRequests((previousRequests) =>
      previousRequests.map((request) =>
        request.id === id
          ? { ...request, status: newStatus }
          : request
      )
    );
  };

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const acceptedCount = requests.filter(
    (request) => request.status === "Accepted"
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "Completed"
  ).length;

  const filteredRequests = requests.filter((request) => {
    const matchesFilter =
      activeFilter === "All" || request.status === activeFilter;

    const searchText = [
      request.studentName,
      request.studentId,
      request.subject,
      request.serviceType,
    ]
      .join(" ")
      .toLowerCase();

    return (
      matchesFilter &&
      searchText.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="service-requests-page">
      <div className="service-page-header">
        <div>
          <p className="service-eyebrow">TEACHER PORTAL</p>
          <h1>Service Requests</h1>
          <p className="service-subtitle">
            Review and manage students' requests for additional
            academic support.
          </p>
        </div>

        <div className="service-header-icon">
          <ClipboardList size={30} />
        </div>
      </div>

      <div className="service-summary-grid">
        <div className="service-summary-card">
          <div className="service-summary-icon pending">
            <Clock size={22} />
          </div>
          <div>
            <p>Pending Requests</p>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="service-summary-card">
          <div className="service-summary-icon accepted">
            <CheckCircle size={22} />
          </div>
          <div>
            <p>Accepted Requests</p>
            <h2>{acceptedCount}</h2>
          </div>
        </div>

        <div className="service-summary-card">
          <div className="service-summary-icon completed">
            <FolderOpen size={22} />
          </div>
          <div>
            <p>Completed Requests</p>
            <h2>{completedCount}</h2>
          </div>
        </div>
      </div>

      <div className="service-toolbar">
        <div className="service-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search student, subject or service..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="service-filters">
          {["All", "Pending", "Accepted", "Rejected", "Completed"].map(
            (filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter === filter
                    ? "service-filter active"
                    : "service-filter"
                }
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            )
          )}
        </div>
      </div>

      <div className="service-request-list">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <article className="service-request-card" key={request.id}>
              <div className="service-request-top">
                <div className="service-request-type">
                  <div className="service-request-icon">
                    {request.serviceType === "Project Guidance" ? (
                      <FolderOpen size={22} />
                    ) : request.serviceType === "Assignment Review" ? (
                      <FileText size={22} />
                    ) : (
                      <BookOpen size={22} />
                    )}
                  </div>

                  <div>
                    <h3>{request.serviceType}</h3>
                    <p className="service-request-date">
                      Submitted on {request.date}
                    </p>
                  </div>
                </div>

                <span
                  className={`service-status ${
                    statusStyles[request.status]
                  }`}
                >
                  {request.status}
                </span>
              </div>

              <div className="service-student-info">
                <div>
                  <UserRound size={17} />
                  <span>{request.studentName}</span>
                </div>
                <div>
                  <span className="service-info-label">Student ID:</span>
                  <span>{request.studentId}</span>
                </div>
                <div>
                  <BookOpen size={17} />
                  <span>{request.subject}</span>
                </div>
              </div>

              <div className="service-description">
                <h4>Request Details</h4>
                <p>{request.description}</p>
              </div>

              <div className="service-card-footer">
                <span className="service-request-id">
                  Request #{String(request.id).padStart(3, "0")}
                </span>

                <div className="service-action-buttons">
                  {request.status === "Pending" && (
                    <>
                      <button
                        type="button"
                        className="service-action accept"
                        onClick={() =>
                          updateStatus(request.id, "Accepted")
                        }
                      >
                        <CheckCircle size={16} />
                        Accept
                      </button>

                      <button
                        type="button"
                        className="service-action reject"
                        onClick={() =>
                          updateStatus(request.id, "Rejected")
                        }
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}

                  {request.status === "Accepted" && (
                    <button
                      type="button"
                      className="service-action complete"
                      onClick={() =>
                        updateStatus(request.id, "Completed")
                      }
                    >
                      <CheckCircle size={16} />
                      Mark Completed
                    </button>
                  )}

                  {request.status === "Completed" && (
                    <span className="service-final-label">
                      <CheckCircle size={16} />
                      Service completed
                    </span>
                  )}

                  {request.status === "Rejected" && (
                    <span className="service-final-label rejected-label">
                      <XCircle size={16} />
                      Request rejected
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="service-empty-state">
            <ClipboardList size={38} />
            <h3>No service requests found</h3>
            <p>
              Try another search term or select a different status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
