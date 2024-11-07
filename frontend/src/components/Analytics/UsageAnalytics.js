import React, { useEffect, useState } from 'react';
import { getUsageAnalytics } from '../../api';

const UsageAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await getUsageAnalytics();
        setAnalytics(response.data); // Adjust based on your API response structure
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div>
      <h2>Usage Analytics</h2>
      {analytics ? (
        <div>
          <p>Total Storage Used: {analytics.totalStorageUsed}</p>
          <p>Total Files: {analytics.totalFiles}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UsageAnalytics;
