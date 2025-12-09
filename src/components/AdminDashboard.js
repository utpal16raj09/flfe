import { useEffect, useState } from "react";
import { getAdminStats } from "../services/UserService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUsers, FaUserCheck, FaChartLine } from "react-icons/fa";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, monthlyGrowth: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await getAdminStats();
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Prepare chart data format
  const chartData = stats.monthlyGrowth.map((val, index) => ({
    name: `Month ${index + 1}`,
    users: val
  }));

  if (loading) return <p style={{textAlign:"center", color:"white", marginTop:"50px"}}>Loading Admin Dashboard...</p>;

  return (
    <div className="container">
      <h2 style={{ color: "white", marginBottom: "30px" }}>📊 Admin Overview</h2>

      {/* STAT CARDS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "40px", flexWrap: "wrap" }}>
        {/* Card 1 */}
        <div className="card" style={{ flex: 1, textAlign: "center", minWidth: "200px" }}>
            <FaUsers size={40} color="var(--primary)" />
            <h3 style={{ margin: "10px 0 0" }}>{stats.totalUsers}</h3>
            <p style={{ color: "#666" }}>Total Registered</p>
        </div>

        {/* Card 2 */}
        <div className="card" style={{ flex: 1, textAlign: "center", minWidth: "200px" }}>
            <FaUserCheck size={40} color="var(--success)" />
            <h3 style={{ margin: "10px 0 0" }}>{stats.activeUsers}</h3>
            <p style={{ color: "#666" }}>Active Users</p>
        </div>

        {/* Card 3 (Dummy Metric) */}
        <div className="card" style={{ flex: 1, textAlign: "center", minWidth: "200px" }}>
            <FaChartLine size={40} color="var(--warning)" />
            <h3 style={{ margin: "10px 0 0" }}>+120%</h3>
            <p style={{ color: "#666" }}>Growth Rate</p>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="card" style={{ height: "400px", paddingBottom: "40px" }}>
        <h3>User Growth (Last 7 Months)</h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminDashboard;