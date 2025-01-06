import { Table } from 'antd';

const UserTable = ({ columns, data }) => {
  return <Table columns={columns} dataSource={data} pagination={false} />;
};

export default UserTable; 