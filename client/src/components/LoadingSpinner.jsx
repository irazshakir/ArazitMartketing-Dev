import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-200px)]">
      <Spin 
        indicator={
          <LoadingOutlined 
            style={{ 
              fontSize: 48,
              color: '#aa2478'
            }} 
            spin 
          />
        }
        tip="Loading..." 
      />
    </div>
  );
};

export default LoadingSpinner; 