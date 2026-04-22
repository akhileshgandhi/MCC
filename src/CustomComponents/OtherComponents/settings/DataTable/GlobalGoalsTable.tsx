import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import DOMPurify from 'dompurify';
import { GlobalGoalsTableProps } from '../../../../types/GlobalGoalsTableProps';

const GlobalGoalsTable: React.FC<GlobalGoalsTableProps> = ({ data, onEdit, onDelete, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((goal: any) => {
        const scorecardName = (goal.ScorecardName || '').toLowerCase();
        const year = (goal.Year || '').toString().toLowerCase();
        const globalGoal = DOMPurify.sanitize(goal.GlobalGoal || '').replace(/<[^>]*>/g, '').toLowerCase();

        return (
          scorecardName.includes(query) ||
          year.includes(query) ||
          globalGoal.includes(query)
        );
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortField) {
          case 'ScorecardName':
            aValue = a.ScorecardName || '';
            bValue = b.ScorecardName || '';
            break;
          case 'Year':
            aValue = a.Year || '';
            bValue = b.Year || '';
            break;
          case 'GlobalGoal':
            aValue = DOMPurify.sanitize(a.GlobalGoal || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.GlobalGoal || '').replace(/<[^>]*>/g, '');
            break;
          default:
            aValue = a[sortField] || '';
            bValue = b[sortField] || '';
        }

        if (sortDirection === 'asc') {
          return aValue.toString().localeCompare(bValue.toString());
        } else {
          return bValue.toString().localeCompare(aValue.toString());
        }
      });
    }

    return result;
  }, [data, searchQuery, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <strong style={{ fontSize: '12px' }}>{filteredAndSortedData.length}</strong>
          <span style={{ fontSize: '12px' }}> Global Goal(s)</span>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search global goals..."
            value={searchQuery}
            style={{ width: '250px', fontSize: '12px' }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th
                style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('ScorecardName')}
              >
                Scorecard Name {getSortIcon('ScorecardName')}
              </th>
              <th
                style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('Year')}
              >
                Year {getSortIcon('Year')}
              </th>
              <th
                style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('GlobalGoal')}
              >
                Global Goal {getSortIcon('GlobalGoal')}
              </th>
              <th style={{ fontSize: '12px', width: '120px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px', fontSize: '12px' }}>
                  {searchQuery ? 'No global goals match your search.' : 'No global goals found.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((goal: any) => {
                const cleanGlobalGoal = DOMPurify.sanitize(goal.GlobalGoal || '').replace(/<[^>]*>/g, '').trim();
                const isEditDisabled = Boolean(cleanGlobalGoal);

                return (
                <tr key={goal.Id}>
                  <td style={{ fontSize: '12px' }}>{goal.ScorecardName}</td>
                  <td style={{ fontSize: '12px' }}>{goal.Year}</td>
                  <td
                    style={{ fontSize: '12px' }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(goal.GlobalGoal || '')
                    }}
                  />
                  <td style={{ textAlign: 'center' }}>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${isEditDisabled ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                        onClick={() => {
                          if (!isEditDisabled) onEdit(goal);
                        }}
                        title={isEditDisabled ? 'Edit disabled: Global Goal already exists' : 'Edit Global Goal'}
                        disabled={isEditDisabled}
                        aria-disabled={isEditDisabled}
                      >
                        <Edit2 size={14} />
                      </button>
                      {/* <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(goal.Id)}
                        title="Delete Global Goal"
                      >
                        <Trash2 size={14} />
                      </button> */}
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default GlobalGoalsTable;
