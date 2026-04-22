// src/components/settings/DataTable/SubSubdepartmentsTable.tsx
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DOMPurify from 'dompurify';
import { SubSubdepartmentsTableProps, SubSubdept, SortField, SortDirection } from '../../../../types/SubSubdepartmentsTableProps';

const SubSubdepartmentsTable = ({ subsubdepartments, subdepartments, onEdit, onDelete }: SubSubdepartmentsTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    console.count('SubSubdepartmentsTable render');
  }, []);
  console.log(subsubdepartments, 'subsubdepartments');

  const getSubDeptName = useCallback(
    (subdeptId: number | null) => {
      if (!subdeptId) return '—';
      const d = subdepartments.find(x => x.Id === subdeptId);
      return d?.SubDepartmentName || `ID:${subdeptId}`;
    },
    [subdepartments]
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

  const filteredSubSubdepartments = useMemo(() => {
    let result = [...subsubdepartments];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => {
        const subdeptName = getSubDeptName(s.SubDepartmentId).toLowerCase();
        const remark = DOMPurify.sanitize(s.Remark || '').replace(/<[^>]*>/g, '').toLowerCase();

        return (
          s.SubSubDepartmentName.toLowerCase().includes(query) ||
          subdeptName.includes(query) ||
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
          case 'SubSubDepartmentName':
            aValue = a.SubSubDepartmentName || '';
            bValue = b.SubSubDepartmentName || '';
            break;
          case 'SubDepartment':
            aValue = getSubDeptName(a.SubDepartmentId);
            bValue = getSubDeptName(b.SubDepartmentId);
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
  }, [subsubdepartments, searchQuery, getSubDeptName, sortField, sortDirection]);

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
            placeholder="Search sub-subdepartments..."
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
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('SubSubDepartmentName')}>
                Sub-Subdepartment Name {getSortIcon('SubSubDepartmentName')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('SubDepartment')}>
                SubDepartment {getSortIcon('SubDepartment')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Remark')}>
                Remark {getSortIcon('Remark')}
              </th>
              <th style={{ fontSize: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubSubdepartments.map(s => (
              <tr key={s.Id}>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}>{s.SubSubDepartmentName}</td>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}>{getSubDeptName(s.SubDepartmentId)}</td>
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
            {filteredSubSubdepartments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  {searchQuery ? 'No sub-subdepartments match your search' : 'No sub-subdepartments configured'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubSubdepartmentsTable;