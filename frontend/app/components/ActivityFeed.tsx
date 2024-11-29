// components/ActivityFeed.tsx
'use client';

import React from 'react';

interface Activity {
  id: number;
  message: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="p-4 bg-gray-100 rounded-lg shadow">
            <p className="font-bold">{activity.message}</p>
            <p className="text-sm text-gray-500">{activity.timestamp}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">Нет активности для отображения</p>
      )}
    </div>
  );
};

export default ActivityFeed;
