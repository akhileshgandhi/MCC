// src/components/settings/DataTable/TableBody/SharedServicesTable.jsx
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DOMPurify from 'dompurify'; // ✅ Import DOMPurify
interface Service {
  Id: number;
  ThreeYRSharedService: string;
  DepartmentId: number | null;
  DepartmentName: string;
}
interface Props {
  sharedServices: Service[];
  departments: { id: number; departmentName: string }[];
  onEdit: (item: Service) => void;
  onDelete: (id: number) => void;
}

type SortField = 'ThreeYRSharedService' | 'DepartmentName';
type SortDirection = 'asc' | 'desc' | null;

const getDeptName = (deptId: number | null, depts: any) => {
  if (!deptId) return '—';
  const d = depts.find(x => x.Id === deptId);
  return d?.DepartmentName ?? `ID:${deptId}`;
};

const SharedServicesTable = ({ sharedServices, departments, onEdit, onDelete }: Props) => {
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

  const filteredSharedServices = useMemo(() => {
    let result = [...sharedServices];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => {
        const service = DOMPurify.sanitize(s.ThreeYRSharedService || '').replace(/<[^>]*>/g, '').toLowerCase();
        const deptName = DOMPurify.sanitize(s.DepartmentName || '').replace(/<[^>]*>/g, '').toLowerCase();

        return (
          service.includes(query) ||
          deptName.includes(query)
        );
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortField) {
          case 'ThreeYRSharedService':
            aValue = DOMPurify.sanitize(a.ThreeYRSharedService || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.ThreeYRSharedService || '').replace(/<[^>]*>/g, '');
            break;
          case 'DepartmentName':
            aValue = DOMPurify.sanitize(a.DepartmentName || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.DepartmentName || '').replace(/<[^>]*>/g, '');
            break;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [sharedServices, searchQuery, sortField, sortDirection]);

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
            placeholder="Search shared services..."
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
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('ThreeYRSharedService')}>
                3-YR Shared Service/Unit Goal {getSortIcon('ThreeYRSharedService')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('DepartmentName')}>
                Department {getSortIcon('DepartmentName')}
              </th>
              <th style={{ fontSize: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSharedServices.map(s => (
              <tr key={s.Id}>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: s.ThreeYRSharedService || '' }}></td>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: s.DepartmentName || '' }}></td>
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
            {filteredSharedServices.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted py-3">
                  {searchQuery ? 'No shared services match your search' : 'No shared services configured'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SharedServicesTable;