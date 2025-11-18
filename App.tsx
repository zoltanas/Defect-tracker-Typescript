
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProject from './pages/AddProject';
import ProjectDetail from './pages/ProjectDetail';
import AddDefect from './pages/AddDefect';
import DefectDetail from './pages/DefectDetail';
import AddTemplate from './pages/AddTemplate';
import AddChecklist from './pages/AddChecklist';
import ChecklistDetail from './pages/ChecklistDetail';
import AddDrawing from './pages/AddDrawing';
import ViewDrawing from './pages/ViewDrawing';
import Annotation from './pages/Annotation';
import ManageAccess from './pages/ManageAccess';
import Profile from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/add-project" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />
                        <Route path="/project/:projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                        
                        <Route path="/project/:projectId/add-defect" element={<ProtectedRoute><AddDefect /></ProtectedRoute>} />
                        <Route path="/defect/:defectId" element={<ProtectedRoute><DefectDetail /></ProtectedRoute>} />
                        
                        <Route path="/project/:projectId/add-template" element={<ProtectedRoute><AddTemplate /></ProtectedRoute>} />
                        <Route path="/project/:projectId/add-checklist" element={<ProtectedRoute><AddChecklist /></ProtectedRoute>} />
                        <Route path="/checklist/:checklistId" element={<ProtectedRoute><ChecklistDetail /></ProtectedRoute>} />
                        
                        <Route path="/project/:projectId/add-drawing" element={<ProtectedRoute><AddDrawing /></ProtectedRoute>} />
                        <Route path="/project/:projectId/drawing/:drawingId" element={<ProtectedRoute><ViewDrawing /></ProtectedRoute>} />
                        
                        <Route path="/annotate/:attachmentId" element={<ProtectedRoute><Annotation /></ProtectedRoute>} />
                        
                        <Route path="/manage-access" element={<ProtectedRoute><ManageAccess /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
};

export default App;
