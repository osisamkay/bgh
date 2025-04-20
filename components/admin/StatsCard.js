import React from 'react';

const StatsCard = ({ title, stats, color = 'blue' }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-4">
                {stats.map((stat, index) => (
                    <div key={index}>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${color}-600`}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsCard;