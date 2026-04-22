import React, { useState } from 'react';

const IEPContent = ({
  selectedDepartment,
  selectedIEP,
  ieps,
  stats,
  loading,
  departments,
  allIEPs
}) => {
  const [selectedIEPDetail, setSelectedIEPDetail] = useState(null);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading IEPs...</span>
        </div>
      </div>
    );
  }

  const selectedDept = selectedDepartment
    ? departments.find(d => `dept-${d.ID}` === selectedDepartment)
    : null;

  const selectedIEPData = selectedIEP
    ? allIEPs.find(i => `iep-${i.ID}` === selectedIEP)
    : null;

  const showFilteredData = selectedDepartment || selectedIEP;

  if (!showFilteredData) {
    return (
      <div className="container-fluid">
        <h1 className="h2 mb-4 text-dark">Operational Goals (IEPs)</h1>

        <div className="card mb-4">
          <div className="card-body">
            <h2 className="h5 card-title text-dark mb-3">Operational Goals Management</h2>
            <p className="card-text text-muted mb-0">
              Select a department from the navigation tree to view and manage Operational Goals (Institutional Effectiveness Plans).
            </p>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border">
              <div className="card-body">
                <div className="h3 fw-bold text-teal mb-2">{stats.totalIEPs}</div>
                <h3 className="h6 fw-semibold text-dark mb-1">Total Operational Goals</h3>
                <p className="small text-muted mb-0">All IEPs</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border">
              <div className="card-body">
                <div className="h3 fw-bold text-primary mb-2">{stats.activeIEPs}</div>
                <h3 className="h6 fw-semibold text-dark mb-1">Active Goals</h3>
                <p className="small text-muted mb-0">Currently in progress</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border">
              <div className="card-body">
                <div className="h3 fw-bold text-success mb-2">{stats.completedIEPs}</div>
                <h3 className="h6 fw-semibold text-dark mb-1">Completed</h3>
                <p className="small text-muted mb-0">Finished goals</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border">
              <div className="card-body">
                <div className="h3 fw-bold text-warning mb-2">{stats.highPriorityIEPs}</div>
                <h3 className="h6 fw-semibold text-dark mb-1">High Priority</h3>
                <p className="small text-muted mb-0">Critical goals</p>
              </div>
            </div>
          </div>
        </div>

        {/* All IEPs Overview */}
        <div className="row mt-4">
          <div className="col-12">
            <h3 className="h5 mb-3">All Operational Goals</h3>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Operational Goal</th>
                    <th>Department</th>
                    <th>Organizational Goal</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {allIEPs.map(iep => (
                    <tr key={iep.ID} onClick={() => setSelectedIEPDetail(iep)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="fw-semibold">{iep.Title}</div>
                        <small className="text-muted">{iep.OperationalGoal?.substring(0, 100)}...</small>
                      </td>
                      <td>{iep.Department?.DepartmentName || iep.Department?.Title}</td>
                      <td>{iep.OrganizationGoal?.Title}</td>
                      <td>
                        <span className={`badge ${iep.Priority === 'High' ? 'bg-danger' :
                            iep.Priority === 'Medium' ? 'bg-warning' : 'bg-secondary'
                          }`}>
                          {iep.Priority || 'Not Set'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${new Date(iep.EndDate) < new Date() ? 'bg-success' :
                            new Date(iep.StartDate) > new Date() ? 'bg-info' : 'bg-primary'
                          }`}>
                          {new Date(iep.EndDate) < new Date() ? 'Completed' :
                            new Date(iep.StartDate) > new Date() ? 'Upcoming' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <small>
                          {new Date(iep.StartDate).toLocaleDateString()} - {new Date(iep.EndDate).toLocaleDateString()}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 text-dark mb-0">
          Operational Goals
          {selectedDept && (
            <small className="text-muted ms-2">
              - {selectedDept.DepartmentName}
            </small>
          )}
          {selectedIEPData && (
            <small className="text-muted ms-2">
              - {selectedIEPData.Title}
            </small>
          )}
        </h1>
        <button type='button' className="btn btn-primary btn-sm" onClick={(e) => e.preventDefault()}>
          + New Operational Goal
        </button>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 border">
            <div className="card-body">
              <div className="h3 fw-bold text-teal mb-2">{stats.totalIEPs}</div>
              <h3 className="h6 fw-semibold text-dark mb-1">Total Goals</h3>
              <p className="small text-muted mb-0">In selected view</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 border">
            <div className="card-body">
              <div className="h3 fw-bold text-primary mb-2">{stats.activeIEPs}</div>
              <h3 className="h6 fw-semibold text-dark mb-1">Active Goals</h3>
              <p className="small text-muted mb-0">Currently in progress</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 border">
            <div className="card-body">
              <div className="h3 fw-bold text-success mb-2">{stats.completedIEPs}</div>
              <h3 className="h6 fw-semibold text-dark mb-1">Completed</h3>
              <p className="small text-muted mb-0">Finished goals</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card h-100 border">
            <div className="card-body">
              <div className="h3 fw-bold text-warning mb-2">{stats.highPriorityIEPs}</div>
              <h3 className="h6 fw-semibold text-dark mb-1">High Priority</h3>
              <p className="small text-muted mb-0">Critical goals</p>
            </div>
          </div>
        </div>
      </div>

      {/* IEPs List */}
      {selectedIEPData ? (
        /* Single IEP Detail View */
        <div className="card">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Operational Goal Details</h5>
            <span className={`badge ${selectedIEPData.Priority === 'High' ? 'bg-danger' :
                selectedIEPData.Priority === 'Medium' ? 'bg-warning' : 'bg-secondary'
              }`}>
              {selectedIEPData.Priority} Priority
            </span>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Basic Information</h6>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td><strong>Title:</strong></td>
                      <td>{selectedIEPData.Title}</td>
                    </tr>
                    <tr>
                      <td><strong>Department:</strong></td>
                      <td>{selectedIEPData.Department?.DepartmentName}</td>
                    </tr>
                    <tr>
                      <td><strong>Organizational Goal:</strong></td>
                      <td>{selectedIEPData.OrganizationGoal?.Title}</td>
                    </tr>
                    <tr>
                      <td><strong>Timeline:</strong></td>
                      <td>
                        {new Date(selectedIEPData.StartDate).toLocaleDateString()} - {new Date(selectedIEPData.EndDate).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <span className={`badge ${new Date(selectedIEPData.EndDate) < new Date() ? 'bg-success' :
                            new Date(selectedIEPData.StartDate) > new Date() ? 'bg-info' : 'bg-primary'
                          }`}>
                          {new Date(selectedIEPData.EndDate) < new Date() ? 'Completed' :
                            new Date(selectedIEPData.StartDate) > new Date() ? 'Upcoming' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h6 className="mt-4">Operational Details</h6>
                <p><strong>Operational Goal:</strong></p>
                <p className="text-muted">{selectedIEPData.OperationalGoal}</p>

                <p><strong>Operational Tactic:</strong></p>
                <p className="text-muted">{selectedIEPData.OperationalTactic}</p>

                <p><strong>Performance Measure:</strong></p>
                <p className="text-muted">{selectedIEPData.PerformanceMeasure}</p>

                <p><strong>Target:</strong></p>
                <p className="text-muted">{selectedIEPData.Target}</p>
              </div>

              <div className="col-md-6">
                <h6>Alignment & Compliance</h6>
                <p><strong>Organizational Goal Alignment:</strong></p>
                <p className="text-muted">{selectedIEPData.OrganizationalGoalAlignment}</p>

                <p><strong>3-Year Plan Alignment:</strong></p>
                <p className="text-muted">{selectedIEPData.Plan3yrGoalAlignment}</p>

                <p><strong>HLC Criteria Alignment:</strong></p>
                <p className="text-muted">{selectedIEPData.HLCCriteriaAlignment}</p>

                <h6 className="mt-4">Results & Improvement</h6>
                <p><strong>Performance Measure Results:</strong></p>
                <p className="text-muted">{selectedIEPData.PerformanceMeasureResults}</p>

                <p><strong>Results Met Expectations:</strong></p>
                <p className="text-muted">{selectedIEPData.ResultsMet}</p>

                <p><strong>Continuous Improvement:</strong></p>
                <p className="text-muted">{selectedIEPData.ContinuousImprovement}</p>

                <h6 className="mt-4">Budget Impact</h6>
                {/* <p><strong>Future Budget Impact:</strong></p>
                <p className="text-muted">{selectedIEPData.FutureBudgetImpact}</p> */}

                {/* <p><strong>Budget Impact Description:</strong></p>
                <p className="text-muted">{selectedIEPData.BudgetImpactDescription}</p> */}
              </div>
            </div>

            <div className="mt-4 pt-3 border-top">
              <div className="d-flex gap-2">
                <button type='button' className="btn btn-primary" onClick={(e) => e.preventDefault()}>Edit Goal</button>
                <button type='button' className="btn btn-outline-secondary" onClick={(e) => e.preventDefault()}>Add Comment</button>
                <button type='button' className="btn btn-outline-secondary" onClick={(e) => e.preventDefault()}>View History</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Department IEPs List */
        <div className="card">
          <div className="card-header bg-light">
            <h5 className="card-title mb-0">
              Operational Goals for {selectedDept?.DepartmentName}
            </h5>
          </div>
          <div className="card-body">
            {ieps.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Operational Goal</th>
                      <th>Organizational Goal</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Timeline</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ieps.map(iep => (
                      <tr key={iep.ID} onClick={() => setSelectedIEPDetail(iep)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div className="fw-semibold">{iep.Title}</div>
                          <small className="text-muted">{iep.OperationalGoal?.substring(0, 100)}...</small>
                        </td>
                        <td>{iep.OrganizationGoal?.Title}</td>
                        <td>
                          <span className={`badge ${iep.Priority === 'High' ? 'bg-danger' :
                              iep.Priority === 'Medium' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                            {iep.Priority || 'Not Set'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${new Date(iep.EndDate) < new Date() ? 'bg-success' :
                              new Date(iep.StartDate) > new Date() ? 'bg-info' : 'bg-primary'
                            }`}>
                            {new Date(iep.EndDate) < new Date() ? 'Completed' :
                              new Date(iep.StartDate) > new Date() ? 'Upcoming' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <small>
                            {new Date(iep.StartDate).toLocaleDateString()} - {new Date(iep.EndDate).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <button type='button' className="btn btn-outline-primary btn-sm" onClick={(e) => e.preventDefault()}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No operational goals found for this department.</p>
                <button type='button' className="btn btn-primary" onClick={(e) => e.preventDefault()}>Create New Operational Goal</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IEP Detail Modal */}
      {selectedIEPDetail && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Operational Goal Details: {selectedIEPDetail.Title}</h5>
                <button type="button" className="btn-close" onClick={(e) => { e.preventDefault(); setSelectedIEPDetail(null) }}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Operational Details</h6>
                    <p><strong>Operational Goal:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.OperationalGoal}</p>

                    <p><strong>Operational Tactic:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.OperationalTactic}</p>

                    <p><strong>Performance Measure:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.PerformanceMeasure}</p>

                    <p><strong>Target:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.Target}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Alignment & Results</h6>
                    <p><strong>Organizational Goal Alignment:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.OrganizationalGoalAlignment}</p>

                    <p><strong>3-Year Plan Alignment:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.Plan3yrGoalAlignment}</p>

                    <p><strong>HLC Criteria Alignment:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.HLCCriteriaAlignment}</p>

                    <p><strong>Performance Results:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.PerformanceMeasureResults}</p>

                    <p><strong>Results Met:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.ResultsMet}</p>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-12">
                    <h6>Continuous Improvement & Budget</h6>
                    <p><strong>Continuous Improvement:</strong></p>
                    <p className="text-muted">{selectedIEPDetail.ContinuousImprovement}</p>

                    <p><strong>Budget Impact:</strong> {selectedIEPDetail.FutureBudgetImpact}</p>
                    <p className="text-muted">{selectedIEPDetail.BudgetImpactDescription}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); setSelectedIEPDetail(null) }}>Close</button>
                <button type="button" className="btn btn-primary" onClick={(e) => e.preventDefault()}>Edit Goal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IEPContent;