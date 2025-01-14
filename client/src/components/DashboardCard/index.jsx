import { Card } from 'antd';
import './styles.css';

const DashboardCard = ({ icon, count, title }) => {
  return (
    <Card className="dashboard-card">
      <div className="card-content">
        <span className="card-icon">{icon}</span>
        <h2 className="card-count">{count}</h2>
        <p className="card-title">{title}</p>
      </div>
    </Card>
  );
};

export default DashboardCard; 