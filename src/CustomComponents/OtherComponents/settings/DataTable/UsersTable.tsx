// src/components/settings/DataTable/UsersTable.jsx
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortField = 'UserName' | 'UserEmail' | 'Role' | 'DepartmentName';
type SortDirection = 'asc' | 'desc' | null;

const UsersTable = ({ users, onEdit, onDelete }) => {
  console.log(users, 'users');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ms-1" />;
    if (sortDirection === 'asc') return <ArrowUp size={14} className="ms-1" />;
    return <ArrowDown size={14} className="ms-1" />;
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => (
        (user.UserName || '').toLowerCase().includes(query) ||
        (user.UserEmail || '').toLowerCase().includes(query) ||
        (user.Role || '').toLowerCase().includes(query) ||
        (user.DepartmentName || '').toLowerCase().includes(query)
      ));
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortField) {
          case 'UserName':
            aValue = a.UserName || '';
            bValue = b.UserName || '';
            break;
          case 'UserEmail':
            aValue = a.UserEmail || '';
            bValue = b.UserEmail || '';
            break;
          case 'Role':
            aValue = a.Role || '';
            bValue = b.Role || '';
            break;
          case 'DepartmentName':
            aValue = a.DepartmentName || '';
            bValue = b.DepartmentName || '';
            break;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [users, searchQuery, sortField, sortDirection]);

  return (
    <div>
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchQuery}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('UserName')}>
                Name {getSortIcon('UserName')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('UserEmail')}>
                Email {getSortIcon('UserEmail')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Role')}>
                Role {getSortIcon('Role')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('DepartmentName')}>
                Department {getSortIcon('DepartmentName')}
              </th>
              <th style={{ fontSize: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.Id}>
                <td style={{ fontSize: '12px' }}>{user.UserName}</td>
                <td style={{ fontSize: '12px' }}>{user.UserEmail}</td>
                <td style={{ fontSize: '12px' }}><span className="badge text-bg-primary">{user.Role}</span></td>
                <td style={{ fontSize: '12px' }}>{user.DepartmentName || '—'}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-link text-primary p-0" onClick={(e) => { e.preventDefault(); onEdit(user) }}>
                      <Edit2 size={16} />
                    </button>
                    <button type="button" className="btn btn-link text-danger p-0" onClick={(e) => { e.preventDefault(); onDelete(user.Id) }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-3">
                  {searchQuery ? 'No users match your search' : 'No users configured'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
};

export default UsersTable;
