
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, Project, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';

interface AccessDisplay {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userCompany: string;
    projectName: string;
    role: string;
    isCurrentUser: boolean;
}

const ManageAccess: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [accessList, setAccessList] = useState<AccessDisplay[]>([]);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [revokeId, setRevokeId] = useState<string | null>(null);

    // Grant Access Form State
    const [grantUserId, setGrantUserId] = useState('');
    const [grantProjectIds, setGrantProjectIds] = useState<string[]>([]);

    // Invite User Form State
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteProjectIds, setInviteProjectIds] = useState<string[]>([]);
    const [inviteRole, setInviteRole] = useState<Role>(Role.EXPERT);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setUsers(db.users.getAll());
        setProjects(db.projects.getAll());
        
        const rawAccess = db.access.getAll();
        const displayAccess = rawAccess.map(acc => {
            const u = db.users.getById(acc.userId);
            const p = db.projects.getById(acc.projectId);
            return {
                id: acc.id,
                userId: acc.userId,
                userName: u ? u.name : 'Unknown',
                userEmail: u ? u.email : 'Unknown',
                userCompany: u ? u.company : '',
                projectName: p ? p.name : 'Unknown',
                role: acc.role,
                isCurrentUser: u?.id === user?.id
            };
        });
        setAccessList(displayAccess);
    };

    const handleGrantAccess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!grantUserId || grantProjectIds.length === 0) return;

        let addedCount = 0;
        const existingAccess = db.access.getAll();

        grantProjectIds.forEach(pid => {
            // Check if already exists
            const exists = existingAccess.some(a => a.userId === grantUserId && a.projectId === pid);
            if (!exists) {
                db.access.create({
                    userId: grantUserId,
                    projectId: pid,
                    role: Role.CONTRACTOR // Default or add role selector if needed
                });
                addedCount++;
            }
        });

        loadData();
        setGrantUserId('');
        setGrantProjectIds([]);
        setMsg({ text: `Access granted for ${addedCount} project(s).`, type: 'success' });
        setTimeout(() => setMsg(null), 3000);
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || inviteProjectIds.length === 0) return;

        // Check if user exists
        let targetUser = db.users.getByEmail(inviteEmail);
        
        if (!targetUser) {
            // Simulate sending invite or creating mock user placeholder
            // For this mock, we create the user with placeholder data
            targetUser = db.users.create({
                email: inviteEmail,
                name: inviteEmail.split('@')[0], // Placeholder name
                company: 'Invited User Company',
                password: 'password', // Default password for demo
                role: Role.CONTRACTOR
            });
            setInviteLink(`${window.location.origin}/#/login?email=${inviteEmail}`);
        } else {
             setInviteLink(null);
        }

        // Grant access
        let addedCount = 0;
        const existingAccess = db.access.getAll();
        const uid = targetUser.id;

        inviteProjectIds.forEach(pid => {
            const exists = existingAccess.some(a => a.userId === uid && a.projectId === pid);
            if (!exists) {
                db.access.create({
                    userId: uid,
                    projectId: pid,
                    role: inviteRole
                });
                addedCount++;
            }
        });

        loadData();
        setMsg({ text: `Invitation processed. Access granted to ${addedCount} project(s).`, type: 'success' });
    };

    const confirmRevoke = () => {
        if (revokeId) {
            db.access.delete(revokeId);
            loadData();
            setRevokeId(null);
            setMsg({ text: "Access revoked.", type: 'success' });
            setTimeout(() => setMsg(null), 3000);
        }
    };

    if (user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-600">Access Denied. Admin permissions required.</div>;
    }

    return (
        <div className="container mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-700">User Access Management</h1>
            
            {msg && (
                 <div className={`p-4 mb-4 rounded-md ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {msg.text}
                </div>
            )}

            {/* Section 1: Grant Access to Existing User */}
            <section className="mb-10 p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-6 text-gray-600">Grant Access to Existing User</h2>
                <form onSubmit={handleGrantAccess}>
                    <div className="mb-4">
                        <label htmlFor="grant_user" className="block text-sm font-medium text-gray-700 mb-1">Select User:</label>
                        <select 
                            id="grant_user"
                            value={grantUserId}
                            onChange={(e) => setGrantUserId(e.target.value)}
                            required 
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900"
                        >
                            <option value="" disabled>Select a user</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="grant_projects" className="block text-sm font-medium text-gray-700 mb-1">Select Projects (Ctrl/Cmd to select multiple):</label>
                        <select 
                            id="grant_projects"
                            multiple
                            value={grantProjectIds}
                            onChange={(e) => setGrantProjectIds(Array.from(e.target.selectedOptions, option => option.value))}
                            required 
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm h-32 text-gray-900"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Grant Access
                    </button>
                </form>
            </section>

            {/* Section 2: Invite New User */}
            <section className="mb-10 p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-6 text-gray-600">Invite New User</h2>
                <form onSubmit={handleInvite}>
                    <div className="mb-4">
                        <label htmlFor="invite_email" className="block text-sm font-medium text-gray-700 mb-1">User Email:</label>
                        <input 
                            type="email" 
                            id="invite_email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            required 
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-gray-900" 
                            placeholder="user@example.com" 
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="invite_projects" className="block text-sm font-medium text-gray-700 mb-1">Select Projects:</label>
                        <select 
                            id="invite_projects"
                            multiple
                            value={inviteProjectIds}
                            onChange={(e) => setInviteProjectIds(Array.from(e.target.selectedOptions, option => option.value))}
                            required 
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm h-32 text-gray-900"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple projects.</p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="invite_role" className="block text-sm font-medium text-gray-700 mb-1">Select Role:</label>
                        <select 
                            id="invite_role"
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as Role)}
                            required 
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900"
                        >
                            {Object.values(Role).map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Send Invitation
                    </button>
                </form>
                
                {inviteLink && (
                    <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-md">
                        <p className="text-sm mb-2 text-yellow-600">Invitation link generated (simulated):</p>
                        <input type="text" value={inviteLink} readOnly className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm text-sm text-gray-900" />
                        <button 
                            onClick={() => navigator.clipboard.writeText(inviteLink)} 
                            className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-2 rounded-md"
                        >
                            Copy Link
                        </button>
                    </div>
                )}
            </section>

            {/* Section 3: View/Manage Current Access */}
            <section className="p-6 border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
                <h2 className="text-2xl font-semibold mb-6 text-gray-600">Current User Access</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {accessList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No users have been granted specific access.</td>
                            </tr>
                        ) : (
                            accessList.map(acc => (
                                <tr key={acc.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{acc.userName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.userEmail}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.userCompany}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.projectName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{acc.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!acc.isCurrentUser && (
                                            <button 
                                                onClick={() => setRevokeId(acc.id)} 
                                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>

            <ConfirmationModal
                isOpen={!!revokeId}
                onClose={() => setRevokeId(null)}
                onConfirm={confirmRevoke}
                title="Revoke Access"
                message="Are you sure you want to revoke this user's access to the project?"
                confirmText="Revoke"
                isDangerous={true}
            />
        </div>
    );
};

export default ManageAccess;
