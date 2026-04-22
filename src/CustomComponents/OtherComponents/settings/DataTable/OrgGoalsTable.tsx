// src/components/settings/DataTable/OrgGoalsTable.jsx
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DOMPurify from 'dompurify'; // ✅ Import DOMPurify
import { OrgGoalsTableProps, OrgGoal, SortField, SortDirection } from '../../../../types/OrgGoalsTableProps';

const OrgGoalsTable: React.FC<OrgGoalsTableProps> = ({ orgGoals, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  console.log(orgGoals, 'orgGoals>>');

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

  const filteredOrgGoals = useMemo(() => {
    let result = [...orgGoals];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(goal => {
        const alignment = DOMPurify.sanitize(goal.OrganizationalGoalAlignment || '').replace(/<[^>]*>/g, '').toLowerCase();
        const value = DOMPurify.sanitize(goal.Value || '').replace(/<[^>]*>/g, '').toLowerCase();
        const tag = (goal.Tag || '').toLowerCase();

        return (
          alignment.includes(query) ||
          value.includes(query) ||
          tag.includes(query)
        );
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortField) {
          case 'OrganizationalGoalAlignment':
            aValue = DOMPurify.sanitize(a.OrganizationalGoalAlignment || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.OrganizationalGoalAlignment || '').replace(/<[^>]*>/g, '');
            break;
          case 'Value':
            aValue = DOMPurify.sanitize(a.Value || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.Value || '').replace(/<[^>]*>/g, '');
            break;
          case 'Tag':
            aValue = a.Tag || '';
            bValue = b.Tag || '';
            break;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [orgGoals, searchQuery, sortField, sortDirection]);

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
            placeholder="Search organizational goals..."
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
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('OrganizationalGoalAlignment')}>
                Goal Alignment {getSortIcon('OrganizationalGoalAlignment')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Value')}>
                Value {getSortIcon('Value')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Tag')}>
                Tag {getSortIcon('Tag')}
              </th>
              <th style={{ fontSize: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgGoals.map(goal => (
              <tr key={goal.Id}>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: goal.OrganizationalGoalAlignment }}></td>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: goal.Value }}
                ></td>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}>{goal.Tag || ''}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-link text-primary p-0" onClick={(e) => { e.preventDefault(); onEdit(goal) }}>
                      <Edit2 size={16} />
                    </button>
                    <button type="button" className="btn btn-link text-danger p-0" onClick={(e) => { e.preventDefault(); onDelete(goal.Id) }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrgGoals.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  {searchQuery ? 'No organizational goals match your search' : 'No organizational goals configured'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>)
};

export default OrgGoalsTable;