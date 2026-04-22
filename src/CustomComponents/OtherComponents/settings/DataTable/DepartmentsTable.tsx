import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DOMPurify from 'dompurify'; // ✅ Import DOMPurify

interface Dept {
  Id: number;
  DepartmentName: string;
  HeadOfDepartment: string;
  HeadOfDepartmentId: number | null;
  DepartmentShortName: string;
  Vision: string;
  Mission: string;
}
interface Props {
  departments: Dept[];
  siteUsers: { id: number; title: string }[];
  onEdit: (item: Dept) => void;
  onDelete: (id: number) => void;
}

type SortField = 'DepartmentName' | 'HeadOfDepartment' | 'DepartmentShortName' | 'Vision' | 'Mission';
type SortDirection = 'asc' | 'desc' | null;

const DepartmentsTable = ({ departments, siteUsers, onEdit, onDelete }: Props) => {
  debugger
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    console.count('DepartmentsTable render');
  }, []);

  const getUserName = useCallback(
    (id: number | null) => {
      if (!id) return '—';
      const u = siteUsers.find(x => x.id === id);
      return u?.title ?? `ID:${id}`;
    },
    [siteUsers]
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

  const filteredDepartments = useMemo(() => {
    let result = [...departments];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => {
        const headOfDept = getUserName(d.HeadOfDepartmentId).toLowerCase();
        const vision = DOMPurify.sanitize(d.Vision || '').replace(/<[^>]*>/g, '').toLowerCase();
        const mission = DOMPurify.sanitize(d.Mission || '').replace(/<[^>]*>/g, '').toLowerCase();

        return (
          d.DepartmentName.toLowerCase().includes(query) ||
          headOfDept.includes(query) ||
          d.DepartmentShortName.toLowerCase().includes(query) ||
          vision.includes(query) ||
          mission.includes(query)
        );
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string = '';
        let bValue: string = '';

        switch (sortField) {
          case 'DepartmentName':
            aValue = a.DepartmentName || '';
            bValue = b.DepartmentName || '';
            break;
          case 'HeadOfDepartment':
            aValue = getUserName(a.HeadOfDepartmentId);
            bValue = getUserName(b.HeadOfDepartmentId);
            break;
          case 'DepartmentShortName':
            aValue = a.DepartmentShortName || '';
            bValue = b.DepartmentShortName || '';
            break;
          case 'Vision':
            aValue = DOMPurify.sanitize(a.Vision || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.Vision || '').replace(/<[^>]*>/g, '');
            break;
          case 'Mission':
            aValue = DOMPurify.sanitize(a.Mission || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.Mission || '').replace(/<[^>]*>/g, '');
            break;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [departments, searchQuery, getUserName, sortField, sortDirection]);

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
            placeholder="Search departments..."
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
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('DepartmentName')}>
                Department Name {getSortIcon('DepartmentName')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('HeadOfDepartment')}>
                Head of Department {getSortIcon('HeadOfDepartment')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('DepartmentShortName')}>
                Department Short Name {getSortIcon('DepartmentShortName')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Vision')}>
                Vision {getSortIcon('Vision')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Mission')}>
                Mission {getSortIcon('Mission')}
              </th>
              <th style={{ fontSize: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map(d => (
              <tr key={d.Id}>
                <td>{d.DepartmentName}</td>
                <td>{getUserName(d.HeadOfDepartmentId)}</td>
                <td style={{ whiteSpace: 'break-spaces' }}>
                  {d.DepartmentShortName}
                </td>
                {/* ✅ Vision rendered as HTML */}
                <td
                  style={{ whiteSpace: 'break-spaces', width: '170px' }}
                  dangerouslySetInnerHTML={{ __html: (d.Vision || '') }}
                />
                <td
                  style={{ whiteSpace: 'break-spaces', width: '170px' }}
                  dangerouslySetInnerHTML={{ __html: d.Mission || '' }}
                />
                <td>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-link text-primary p-0"
                      onClick={e => {
                        e.preventDefault();
                        onEdit(d);
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0"
                      onClick={e => {
                        e.preventDefault();
                        onDelete(d.Id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDepartments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-3">
                  {searchQuery ? 'No departments match your search' : 'No departments configured'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentsTable;
