
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { ProjectAccess, Project } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [projectAccesses, setProjectAccesses] = useState<(ProjectAccess & { projectName: string })[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setCompany(user.company);
            
            // Fetch project access
            const accessList = db.access.getByUserId(user.id);
            const enrichedAccess = accessList.map(access => {
                const project = db.projects.getById(access.projectId);
                return {
                    ...access,
                    projectName: project ? project.name : 'Unknown Project'
                };
            });
            setProjectAccesses(enrichedAccess);
        }
    }, [user]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (password && password !== confirmPassword) {
            setMessage({ text: "Passwords do not match", type: 'error' });
            return;
        }

        const updatedUser = {
            ...user,
            name,
            company,
            password: password || user.password
        };

        db.users.update(updatedUser);
        login(updatedUser); // Update context
        setMessage({ text: "Profile updated successfully", type: 'success' });
        
        // Clear password fields
        setPassword('');
        setConfirmPassword('');
        
        setTimeout(() => setMessage(null), 3000);
    };

    const handleDeleteAccount = () => {
        if (user) {
            db.users.delete(user.id);
            logout();
            navigate('/login');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-10 shadow-xl rounded-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Edit Your Profile
                    </h2>
                </div>

                {message && (
                    <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 pt-2 pb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 pt-2 pb-1">Company</label>
                            <input
                                type="text"
                                id="company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                            />
                        </div>
                        <div className="pt-4">
                            <label htmlFor="new_password" class="block text-sm font-medium text-gray-700 pb-1">New Password (optional)</label>
                            <input
                                type="password"
                                id="new_password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current password"
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm_new_password" class="block text-sm font-medium text-gray-700 pt-2 pb-1">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirm_new_password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>

                <div className="mt-10 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Your Project Access
                    </h3>
                    {projectAccesses.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Project Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Your Role
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {projectAccesses.map(pa => (
                                        <tr key={pa.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {pa.projectName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {pa.role}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">You do not have access to any projects yet.</p>
                    )}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-red-600 mb-4">
                        Danger Zone
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Removing your account will anonymize your personal data and revoke all project access. Your contributions (defects, comments, etc.) will remain attributed to an anonymized user. This action is irreversible.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Remove My Account
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message="Are you sure you want to remove your account? This action cannot be undone."
                confirmText="Remove My Account"
                isDangerous={true}
            />
        </div>
    );
};

export default Profile;
