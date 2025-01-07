import { Skeleton, Space } from 'antd';

const TableSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton.Input 
          active 
          size="large" 
          style={{ width: '300px' }} 
        />
      </div>

      {/* Table Header Skeleton */}
      <div className="flex gap-4 mb-4 pb-4 border-b">
        {[...Array(4)].map((_, i) => (
          <Skeleton.Input 
            key={i} 
            active 
            size="small" 
            style={{ width: '120px' }} 
          />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 py-4 border-b">
          {/* Avatar */}
          <Skeleton.Avatar active size="large" />
          
          {/* Content */}
          <div className="flex-1 flex gap-4">
            <Skeleton.Input active style={{ width: '150px' }} />
            <Skeleton.Input active style={{ width: '200px' }} />
            <Skeleton.Input active style={{ width: '100px' }} />
            <Skeleton.Input active style={{ width: '80px' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton; 