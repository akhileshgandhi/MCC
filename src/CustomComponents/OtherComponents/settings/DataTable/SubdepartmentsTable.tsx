// src/components/settings/DataTable/SubdepartmentsTable.tsx
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DOMPurify from 'dompurify';
import { SubdepartmentsTableProps, Subdept, SortField, SortDirection } from '../../../../types/SubdepartmentsTableProps';

const SubdepartmentsTable = ({ subdepartments, departments, onEdit, onDelete }: SubdepartmentsTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    console.count('SubdepartmentsTable render');
  }, []);
  console.log(subdepartments, 'subdepartments');

  const getDeptName = useCallback(
    (deptId: number | null) => {
      if (!deptId) return '—';
      const d = departments.find(x => x.Id === deptId);
      return d?.DepartmentShortName || `ID:${deptId}`;
    },
    [departments]
  );

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

  const filteredSubdepartments = useMemo(() => {
    let result = [...subdepartments];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => {
        const deptName = getDeptName(s.DepartmentId).toLowerCase();
        const remark = DOMPurify.sanitize(s.Remark || '').replace(/<[^>]*>/g, '').toLowerCase();

        return (
          s.SubDepartmentName.toLowerCase().includes(query) ||
          deptName.includes(query) ||
          remark.includes(query)
        );
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortField) {
          case 'SubDepartmentName':
            aValue = a.SubDepartmentName || '';
            bValue = b.SubDepartmentName || '';
            break;
          case 'Department':
            aValue = getDeptName(a.DepartmentId);
            bValue = getDeptName(b.DepartmentId);
            break;
          case 'Remark':
            aValue = DOMPurify.sanitize(a.Remark || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.Remark || '').replace(/<[^>]*>/g, '');
            break;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [subdepartments, searchQuery, getDeptName, sortField, sortDirection]);

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
            placeholder="Search subdepartments..."
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
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('SubDepartmentName')}>
                Subdepartment Name {getSortIcon('SubDepartmentName')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Department')}>
                Department {getSortIcon('Department')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Remark')}>
                Remark {getSortIcon('Remark')}
              </th>
              <th style={{ fontSize: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubdepartments.map(s => (
              <tr key={s.Id}>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}>{s.SubDepartmentName}</td>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}>{getDeptName(s.DepartmentId)}</td>
                <td
                  style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}
                  dangerouslySetInnerHTML={{ __html: s.Remark || '' }}
                />
                <td>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-link text-primary p-0"
                      onClick={e => {
                        e.preventDefault();
                        onEdit(s);
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0"
                      onClick={e => {
                        e.preventDefault();
                        onDelete(s.Id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSubdepartments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  {searchQuery ? 'No subdepartments match your search' : 'No subdepartments configured'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubdepartmentsTable;