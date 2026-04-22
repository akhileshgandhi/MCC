// src/components/settings/DataTable/TableHeadingsTable.jsx
import React from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';

const TableHeadingsTable = ({
  items,
  expandedRows,
  toggleRow,
  onEdit,
  onDelete
}) => (
  <div className="table-responsive">
    <table className="table table-bordered">
      <thead className="table-light">
        <tr>
          <th>Expand</th>
          <th>Organizational Goal(s)</th>
          <th>3-YR Shared Service</th>
          <th>HLC Criteria</th>
          <th>Operational Tactic</th>
          <th>Performance Measure</th>
          <th>Target</th>
          <th>Results</th>
          <th>Continuous Improvement</th>
          <th>Results Met</th>
          <th>Budget Impact?</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <React.Fragment key={item.id}>
            <tr>
              <td>
                <button  type="button"
                  className="btn btn-link p-0"
                  onClick={() => toggleRow(item.id)}
                >
                  {expandedRows[item.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              </td>
              <td>{item.organizationalGoal}</td>
              <td>{item.threeYRSharedService}</td>
              <td>{item.hlcCriteria}</td>
              <td>{item.operationalTactic}</td>
              <td>{item.performanceMeasure}</td>
              <td>{item.target}</td>
              <td>{item.performanceMeasureResults}</td>
              <td>{item.continuousImprovement}</td>
              <td>
                <span
                  className={`badge ${
                    item.resultsMet === 'Yes'
                      ? 'text-bg-success'
                      : item.resultsMet === 'No'
                      ? 'text-bg-danger'
                      : 'text-bg-warning'
                  }`}
                >
                  {item.resultsMet}
                </span>
              </td>
              {/* <td>{item.futureBudgetImpact}</td> */}
              <td>
                <div className="d-flex gap-2">
                  <button  type="button"
                    className="btn btn-link text-primary p-0"
                    onClick={e => { e.preventDefault(); onEdit(item); }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button  type="button"
                    className="btn btn-link text-danger p-0"
                    onClick={e => { e.preventDefault(); onDelete(item.id); }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
            {expandedRows[item.id] && (
              <tr>
                <td colSpan={12} className="bg-light">
                  <div className="p-2">
                    <div>
                      <strong>Budget Description:</strong> {item.budgetDescription}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
);

export default TableHeadingsTable;