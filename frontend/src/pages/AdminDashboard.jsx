import { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Trees, Users, AlertTriangle, CheckCircle, Plus, LogOut, X, UserCheck, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [fields, setFields] = useState([]);
    const [agents, setAgents] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, risk: 0, completed: 0 });
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [showAgentModal, setShowAgentModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(null); // stores field object
    const { logout, user } = useAuth();

    // Form States
    const [newField, setNewField] = useState({ name: '', crop_type: '', planting_date: '', assigned_agent_id: '' });
    const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        loadFields();
        loadAgents();
    }, []);

    const loadFields = async () => {
        try {
            const { data } = await api.get('/fields');
            setFields(data);
            const s = data.reduce((acc, f) => {
                acc.total++;
                if (f.status === 'active') acc.active++;
                if (f.status === 'at_risk') acc.risk++;
                if (f.status === 'completed') acc.completed++;
                return acc;
            }, { total: 0, active: 0, risk: 0, completed: 0 });
            setStats(s);
        } catch (err) { console.error(err); }
    };

    const loadAgents = async () => {
        try {
            const { data } = await api.get('/users/agents');
            setAgents(data);
        } catch (err) { console.error(err); }
    };

    const handleCreateField = async (e) => {
        e.preventDefault();
        try {
            await api.post('/fields', newField);
            setShowFieldModal(false);
            setNewField({ name: '', crop_type: '', planting_date: '', assigned_agent_id: '' });
            loadFields();
        } catch (err) { console.error(err); }
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/users/agents', newAgent);
            setShowAgentModal(false);
            setNewAgent({ name: '', email: '', password: '' });
            loadAgents();
            alert('Agent added successfully!');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to add agent. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignAgent = async (agentId) => {
        try {
            await api.patch(`/fields/${showAssignModal.id}/assign`, { agent_id: agentId });
            setShowAssignModal(null);
            loadFields();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full">
                <div className="flex items-center gap-2 mb-10">
                    <Trees className="w-8 h-8 text-green-600" />
                    <span className="text-xl font-bold text-slate-800">SmartSeason</span>
                </div>

                <nav className="flex-1 space-y-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'agents' ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Users className="w-5 h-5" />
                        Agents
                    </button>
                </nav>

                <div className="mt-auto border-t pt-6">
                    <div className="flex items-center gap-3 mb-6 px-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold uppercase">
                            {user?.name?.[0]}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 overflow-y-auto">
                {activeTab === 'dashboard' ? (
                    <>
                        <header className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Field Monitoring</h1>
                                <p className="text-slate-500">Real-time overview of all farm activities</p>
                            </div>
                            <button
                                onClick={() => setShowFieldModal(true)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-green-200 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                New Field
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            <StatsCard label="Total Fields" value={stats.total} icon={<Trees />} color="blue" />
                            <StatsCard label="Active Crops" value={stats.active} icon={<CheckCircle />} color="green" />
                            <StatsCard label="At Risk" value={stats.risk} icon={<AlertTriangle />} color="amber" />
                            <StatsCard label="Harvested" value={stats.completed} icon={<LayoutDashboard />} color="slate" />
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Field Name</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Crop Type</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Growth Stage</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Latest Notes</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {fields.map(f => (
                                        <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800">{f.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{f.crop_type}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    {f.current_stage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={f.status} /></td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-500 italic max-w-xs truncate" title={f.notes}>
                                                    {f.notes || 'No notes yet'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setShowAssignModal(f)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-bold flex items-center gap-1 justify-end w-full"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                    Reassign
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {fields.length === 0 && <div className="p-20 text-center text-slate-400">No fields found.</div>}
                        </div>
                    </>
                ) : (
                    <>
                        <header className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Field Agents</h1>
                                <p className="text-slate-500">Manage your monitoring team</p>
                            </div>
                            <button
                                onClick={() => setShowAgentModal(true)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-green-200 transition-all"
                            >
                                <UserPlus className="w-5 h-5" />
                                New Agent
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agents.map(a => (
                                <div key={a.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-lg uppercase">
                                        {a.name[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-slate-800 truncate">{a.name}</h3>
                                        <p className="text-sm text-slate-500 truncate">{a.email}</p>
                                        <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-tighter font-bold">Member since {new Date(a.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Field Modal */}
            {showFieldModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <form onSubmit={handleCreateField} className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">New Field</h2>
                            <button type="button" onClick={() => setShowFieldModal(false)}><X /></button>
                        </div>
                        <input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-green-500" placeholder="Field Name" required value={newField.name} onChange={e => setNewField({ ...newField, name: e.target.value })} />
                        <input className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-green-500" placeholder="Crop Type" required value={newField.crop_type} onChange={e => setNewField({ ...newField, crop_type: e.target.value })} />
                        <input type="date" className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-green-500" required value={newField.planting_date} onChange={e => setNewField({ ...newField, planting_date: e.target.value })} />
                        <select className="w-full border-2 border-slate-100 rounded-xl p-3 outline-none focus:border-green-500" value={newField.assigned_agent_id} onChange={e => setNewField({ ...newField, assigned_agent_id: e.target.value })}>
                            <option value="">Assign Agent (Optional)</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all">Create Field</button>
                    </form>
                </div>
            )}

            {/* Agent Modal */}
            {showAgentModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <form onSubmit={handleCreateAgent} className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">New Agent</h2>
                            <button type="button" onClick={() => setShowAgentModal(false)}><X /></button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 mb-2">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                            <input className="w-full border-2 border-slate-100 rounded-xl p-3 mt-1 outline-none focus:border-green-500" placeholder="John Doe" required value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                            <input type="email" className="w-full border-2 border-slate-100 rounded-xl p-3 mt-1 outline-none focus:border-green-500" placeholder="john@example.com" required value={newAgent.email} onChange={e => setNewAgent({ ...newAgent, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Temporary Password</label>
                            <input type="password" className="w-full border-2 border-slate-100 rounded-xl p-3 mt-1 outline-none focus:border-green-500" placeholder="••••••••" required value={newAgent.password} onChange={e => setNewAgent({ ...newAgent, password: e.target.value })} />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all mt-4 disabled:slate-300 disabled:opacity-50"
                        >
                            {loading ? 'Adding Agent...' : 'Add Agent'}
                        </button>
                    </form>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 text-center w-full">Assign Agent</h2>
                            <button onClick={() => setShowAssignModal(null)}><X /></button>
                        </div>
                        <div className="space-y-2">
                            {agents.map(a => (
                                <button key={a.id} onClick={() => handleAssignAgent(a.id)} className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 flex items-center gap-3 transition-all text-left">
                                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold uppercase">{a.name[0]}</div>
                                    <div>
                                        <p className="font-bold text-slate-800">{a.name}</p>
                                        <p className="text-xs text-slate-500">{a.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ label, value, icon, color }) {
    const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600', slate: 'bg-slate-50 text-slate-600' };
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
