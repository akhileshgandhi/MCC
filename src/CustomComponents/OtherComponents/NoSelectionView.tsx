// components/NoSelectionView.tsx
import React from 'react';
import DOMPurify from 'dompurify';
import { NoSelectionViewProps } from '../../types/NoSelectionViewProps';

/**
 * Default view when no scorecard/department/IEP is selected
 * Shows stats cards and list of all scorecards
 */
const NoSelectionView = ({ stats, organizationalScorecards }: NoSelectionViewProps) => {
  return (
    <div className="container-fluid">
      <h1 className="h2 mb-4 text-dark">Scorecards</h1>

      {/* Stats Cards */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 card-title text-dark mb-3">Strategic Performance Management</h2>
          <p className="card-text text-muted mb-0">
            Select an organizational scorecard to view and manage operational goals and performance metrics.
          </p>
        </div>
      </div>

      <div className="row g-3">
        {[
          { label: 'Scorecards', value: stats.totalScorecards, color: 'teal' },
          { label: 'Operational Goals', value: stats.totalIEPs, color: 'primary' },
          { label: 'Active Goals', value: stats.activeIEPs, color: 'success' },
          { label: 'High Priority', value: stats.highPriorityIEPs, color: 'warning' },
        ].map((s, i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border">
              <div className="card-body">
                <div className={`h3 fw-bold text-${s.color} mb-2`}>{s.value}</div>
                <h3 className="h6 fw-semibold text-dark mb-1">{s.label}</h3>
                <p className="small text-muted mb-0">
                  {s.label === 'Scorecards' ? 'Strategic focus areas' : 
                   s.label.includes('Goals') ? 'Total Goals' : 
                   s.label.includes('Active') ? 'In progress' : 'Critical goals'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Scorecards List */}
      <div className="row mt-4">
        <div className="col-12">
          <h3 className="h5 mb-3">All Organizational Scorecards</h3>
          <div className="row g-3">
            {organizationalScorecards.map((sc: any) => (
              <div key={sc.Id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h5 className="card-title mb-0">{sc.ScorecardName}</h5>
                  </div>
                  <div className="card-body">
                    <p className="card-text text-muted small" dangerouslySetInnerHTML={{ __html: sc.Description || '' }} />
                    <p className="card-text"><small className="text-muted"><strong>Year:</strong> {sc.Year}</small></p>
                    <p className="card-text"><small className="text-muted"><strong>Mission:</strong> <span dangerouslySetInnerHTML={{ __html: sc.Mission || '' }} /></small></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoSelectionView;