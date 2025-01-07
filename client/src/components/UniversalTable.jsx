import { Table, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useCallback, useEffect } from 'react';
import TableSkeleton from './TableSkeleton';
import debounce from 'lodash/debounce';

const UniversalTable = ({ 
  columns, 
  dataSource, 
  loading,
  totalItems,
  onSearch,
  searchPlaceholder = "Search...",
}) => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');

  // Debounce the search function to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const paginationConfig = {
    total: totalItems,
    pageSize: pageSize,
    current: currentPage,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: ['10', '25', '50'],
    onChange: (page, size) => {
      setCurrentPage(page);
      setPageSize(size);
    },
  };

  const tableTitle = () => (
    <div className="py-4">
      <Input
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined className="text-gray-400" />}
        onChange={handleSearch}
        value={searchText}
        className="max-w-md"
        allowClear
        onClear={() => {
          setSearchText('');
          onSearch('');
        }}
      />
    </div>
  );

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <Table 
        columns={columns}
        dataSource={dataSource}
        pagination={paginationConfig}
        className="universal-table"
        title={tableTitle}
        loading={{
          spinning: loading,
          indicator: <TableSkeleton />
        }}
      />
    </div>
  );
};

export default UniversalTable; 