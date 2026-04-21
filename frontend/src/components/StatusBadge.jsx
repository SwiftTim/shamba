const colors = {
    active: 'bg-green-100 text-green-800',
    at_risk: 'bg-amber-100 text-amber-800',
    completed: 'bg-gray-100 text-gray-700',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
            {(status || 'unknown').replace('_', ' ')}
        </span>
    );
}
