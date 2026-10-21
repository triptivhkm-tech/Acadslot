import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import FacultyLayout from "./layouts/FacultyLayout";
import AdminLayout from "./layouts/AdminLayout";

// Authentication
import Login from "./page/auth/Login";

// Student Pages
import StudentDashboard from "./page/student/StudentDashboard";
import StudentRequests from "./page/student/StudentRequests";
import StudentSessions from "./page/student/StudentSessions";
import StudentNotif from "./page/student/StudentNotif";
import StudentProfile from "./page/student/StudentProfile";

// Faculty Pages
import TeacherDashboard from "./page/teacher/TeacherDashboard";
import DoubtRequest from "./page/teacher/DoubtRequest";
import TeacherToDo from "./page/teacher/TeacherToDo";
import FacultyAvailability from "./page/teacher/FacultyAvailability";
import FacultySession from "./page/teacher/FacultySession";

// Admin Pages
import AdminDashboard from "./page/admin/AdminDashboard";
import ManageFaculty from "./page/admin/ManageFaculty";
import ManageVenues from "./page/admin/ManageVenues";
import ManageStudents from "./page/admin/ManageStudents";
import SystemActivity from "./page/admin/SystemActivity";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & Role Selection */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Student Section */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="requests" element={<StudentRequests />} />
            <Route path="sessions" element={<StudentSessions />} />
            <Route path="notifications" element={<StudentNotif />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Faculty / Professor Section */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["TEACHER", "PROFESSOR"]}>
                <FacultyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="requests" element={<DoubtRequest />} />
            <Route path="todo" element={<TeacherToDo />} />
            <Route path="availability" element={<FacultyAvailability />} />
            <Route path="sessions" element={<FacultySession />} />
          </Route>

          {/* Admin Section */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="venues" element={<ManageVenues />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="bookings" element={<SystemActivity />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
