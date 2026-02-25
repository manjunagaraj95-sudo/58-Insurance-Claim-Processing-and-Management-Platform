
import React, { useState, useEffect } from 'react';

// --- ROLES Configuration for RBAC ---
const ROLES = {
  ADMIN: {
    permissions: ['view_dashboard', 'manage_users', 'view_all_claims', 'edit_all_claims', 'approve_claim', 'reject_claim', 'settle_claim', 'view_audit_logs', 'export_data'],
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'CLAIM_DETAIL', 'USER_MANAGEMENT', 'AUDIT_LOGS']
  },
  CLAIMS_OFFICER: {
    permissions: ['view_dashboard', 'view_assigned_claims', 'edit_assigned_claims', 'approve_claim', 'reject_claim', 'add_claim_note', 'upload_documents', 'view_audit_logs'],
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'CLAIM_DETAIL']
  },
  VERIFICATION_OFFICER: {
    permissions: ['view_dashboard', 'view_assigned_claims', 'verify_claim_documents', 'request_additional_info', 'add_claim_note', 'upload_documents', 'view_audit_logs'],
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'CLAIM_DETAIL']
  },
  FINANCE_TEAM: {
    permissions: ['view_dashboard', 'view_approved_claims', 'settle_claim', 'view_audit_logs', 'export_data'],
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'CLAIM_DETAIL']
  },
  POLICYHOLDER: {
    permissions: ['view_my_claims', 'submit_claim', 'upload_documents', 'view_claim_status', 'add_claim_note'],
    screens: ['DASHBOARD', 'CLAIMS_LIST', 'CLAIM_DETAIL', 'SUBMIT_CLAIM']
  }
};

// --- Standardized Status Keys and UI Mapping ---
const STATUS_MAPPING = {
  SUBMITTED: { label: 'Submitted', className: 'status-submitted', colorVar: '--color-submitted' },
  IN_REVIEW: { label: 'In Review', className: 'status-in-review', colorVar: '--color-in-review' },
  PENDING_VERIFICATION: { label: 'Pending Verification', className: 'status-pending', colorVar: '--color-pending' },
  PENDING_APPROVAL: { label: 'Pending Approval', className: 'status-pending', colorVar: '--color-pending' },
  APPROVED: { label: 'Approved', className: 'status-approved', colorVar: '--color-approved' },
  REJECTED: { label: 'Rejected', className: 'status-rejected', colorVar: '--color-rejected' },
  SETTLED: { label: 'Settled', className: 'status-settled', colorVar: '--color-settled' },
  CLOSED: { label: 'Closed', className: 'status-settled', colorVar: '--color-settled' } // Using settled color for closed
};

// --- Dummy Data ---
const generateRandomId = () => Math.random().toString(36).substr(2, 9).toUpperCase();
const getRandomStatus = () => {
  const statuses = Object.keys(STATUS_MAPPING);
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const DUMMY_CLAIMS = [
  {
    id: generateRandomId(),
    policyholder: { id: 'PH001', name: 'Alice Johnson' },
    type: 'Auto Accident',
    amount: 15000.00,
    dateSubmitted: '2023-10-26',
    status: 'SUBMITTED',
    assignedTo: 'Claims Officer 1',
    documents: [{ name: 'Police Report.pdf', url: '#', type: 'pdf' }, { name: 'Damage Photos.zip', url: '#', type: 'zip' }],
    history: [
      { timestamp: '2023-10-26T10:00:00Z', action: 'Claim Submitted by Alice Johnson' },
      { timestamp: '2023-10-26T11:30:00Z', action: 'Assigned to Claims Officer 1' },
    ],
    notes: [{ author: 'System', text: 'Initial claim submission received.', timestamp: '2023-10-26T10:00:00Z' }],
    sla: { targetDate: '2023-11-15', breached: false },
    milestones: [
      { name: 'Submitted', date: '2023-10-26', completed: true },
      { name: 'Review', date: null, completed: false },
      { name: 'Verification', date: null, completed: false },
      { name: 'Approval', date: null, completed: false },
      { name: 'Settlement', date: null, completed: false },
    ]
  },
  {
    id: generateRandomId(),
    policyholder: { id: 'PH002', name: 'Bob Smith' },
    type: 'Home Burglary',
    amount: 5000.00,
    dateSubmitted: '2023-10-20',
    status: 'IN_REVIEW',
    assignedTo: 'Claims Officer 2',
    documents: [{ name: 'Inventory List.xlsx', url: '#', type: 'xlsx' }, { name: 'Police Report.pdf', url: '#', type: 'pdf' }],
    history: [
      { timestamp: '2023-10-20T09:00:00Z', action: 'Claim Submitted by Bob Smith' },
      { timestamp: '2023-10-20T10:00:00Z', action: 'Assigned to Claims Officer 2' },
      { timestamp: '2023-10-21T14:00:00Z', action: 'Documents reviewed, pending further verification' },
    ],
    notes: [{ author: 'Claims Officer 2', text: 'Initial document review complete. Forwarding to verification.', timestamp: '2023-10-21T14:00:00Z' }],
    sla: { targetDate: '2023-11-10', breached: false },
    milestones: [
      { name: 'Submitted', date: '2023-10-20', completed: true },
      { name: 'Review', date: '2023-10-21', completed: true },
      { name: 'Verification', date: null, completed: false },
      { name: 'Approval', date: null, completed: false },
      { name: 'Settlement', date: null, completed: false },
    ]
  },
  {
    id: generateRandomId(),
    policyholder: { id: 'PH003', name: 'Carol White' },
    type: 'Medical Expense',
    amount: 2500.00,
    dateSubmitted: '2023-10-15',
    status: 'PENDING_VERIFICATION',
    assignedTo: 'Verification Officer 1',
    documents: [{ name: 'Medical Bills.pdf', url: '#', type: 'pdf' }, { name: 'Doctor Note.pdf', url: '#', type: 'pdf' }],
    history: [
      { timestamp: '2023-10-15T11:00:00Z', action: 'Claim Submitted by Carol White' },
      { timestamp: '2023-10-16T09:00:00Z', action: 'Assigned to Verification Officer 1' },
      { timestamp: '2023-10-17T10:00:00Z', action: 'Requested additional medical records' },
    ],
    notes: [{ author: 'Verification Officer 1', text: 'Additional records requested from provider.', timestamp: '2023-10-17T10:00:00Z' }],
    sla: { targetDate: '2023-11-05', breached: true },
    milestones: [
      { name: 'Submitted', date: '2023-10-15', completed: true },
      { name: 'Review', date: '2023-10-16', completed: true },
      { name: 'Verification', date: null, completed: false },
      { name: 'Approval', date: null, completed: false },
      { name: 'Settlement', date: null, completed: false },
    ]
  },
  {
    id: generateRandomId(),
    policyholder: { id: 'PH004', name: 'David Green' },
    type: 'Property Damage',
    amount: 8000.00,
    dateSubmitted: '2023-10-01',
    status: 'APPROVED',
    assignedTo: 'Finance Team',
    documents: [{ name: 'Damage Assessment.pdf', url: '#', type: 'pdf' }, { name: 'Invoice.pdf', url: '#', type: 'pdf' }],
    history: [
      { timestamp: '2023-10-01T13:00:00Z', action: 'Claim Submitted by David Green' },
      { timestamp: '2023-10-02T10:00:00Z', action: 'Assigned to Claims Officer 3' },
      { timestamp: '2023-10-05T15:00:00Z', action: 'Verification Complete' },
      { timestamp: '2023-10-08T11:00:00Z', action: 'Claim Approved' },
      { timestamp: '2023-10-08T11:30:00Z', action: 'Forwarded to Finance Team for settlement' },
    ],
    notes: [{ author: 'Claims Officer 3', text: 'All documents verified. Approved for full amount.', timestamp: '2023-10-08T11:00:00Z' }],
    sla: { targetDate: '2023-10-10', breached: false },
    milestones: [
      { name: 'Submitted', date: '2023-10-01', completed: true },
      { name: 'Review', date: '2023-10-02', completed: true },
      { name: 'Verification', date: '2023-10-05', completed: true },
      { name: 'Approval', date: '2023-10-08', completed: true },
      { name: 'Settlement', date: null, completed: false },
    ]
  },
  {
    id: generateRandomId(),
    policyholder: { id: 'PH005', name: 'Eva Brown' },
    type: 'Travel Cancellation',
    amount: 1200.00,
    dateSubmitted: '2023-09-28',
    status: 'REJECTED',
    assignedTo: 'Claims Officer 4',
    documents: [{ name: 'Booking Confirmation.pdf', url: '#', type: 'pdf' }],
    history: [
      { timestamp: '2023-09-28T10:00:00Z', action: 'Claim Submitted by Eva Brown' },
      { timestamp: '2023-09-29T10:00:00Z', action: 'Assigned to Claims Officer 4' },
      { timestamp: '2023-10-01T14:00:00Z', action: 'Claim Rejected due to policy exclusion' },
    ],
    notes: [{ author: 'Claims Officer 4', text: 'Claim rejected as per policy terms (clause 3.5 - non-covered event).', timestamp: '2023-10-01T14:00:00Z' }],
    sla: { targetDate: '2023-10-05', breached: false },
    milestones: [
      { name: 'Submitted', date: '2023-09-28', completed: true },
      { name: 'Review', date: '2023-09-29', completed: true },
      { name: 'Verification', date: '2023-09-30', completed: true },
      { name: 'Approval', date: '2023-10-01', completed: true },
      { name: 'Settlement', date: '2023-10-01', completed: true },
    ]
  },
  {
    id: generateRandomId(),
    policyholder: { id: 'PH006', name: 'Frank Miller' },
    type: 'Life Insurance',
    amount: 100000.00,
    dateSubmitted: '2023-09-10',
    status: 'SETTLED',
    assignedTo: 'Finance Team',
    documents: [{ name: 'Death Certificate.pdf', url: '#', type: 'pdf' }, { name: 'Beneficiary Form.pdf', url: '#', type: 'pdf' }],
    history: [
      { timestamp: '2023-09-10T16:00:00Z', action: 'Claim Submitted by Frank Miller' },
      { timestamp: '2023-09-11T09:00:00Z', action: 'Assigned to Claims Officer 5' },
      { timestamp: '2023-09-15T10:00:00Z', action: 'Verification Complete' },
      { timestamp: '2023-09-18T11:00:00Z', action: 'Claim Approved' },
      { timestamp: '2023-09-19T14:00:00Z', action: 'Payment Processed and Settled' },
    ],
    notes: [{ author: 'Finance Team', text: 'Payment disbursed to beneficiary.', timestamp: '2023-09-19T14:00:00Z' }],
    sla: { targetDate: '2023-09-20', breached: false },
    milestones: [
      { name: 'Submitted', date: '2023-09-10', completed: true },
      { name: 'Review', date: '2023-09-11', completed: true },
      { name: 'Verification', date: '2023-09-15', completed: true },
      { name: 'Approval', date: '2023-09-18', completed: true },
      { name: 'Settlement', date: '2023-09-19', completed: true },
    ]
  }
];

const DUMMY_USERS = [
  { id: '1', username: 'admin@example.com', role: 'ADMIN', name: 'Admin User' },
  { id: '2', username: 'claims.officer@example.com', role: 'CLAIMS_OFFICER', name: 'Claims Officer' },
  { id: '3', username: 'verification.officer@example.com', role: 'VERIFICATION_OFFICER', name: 'Verification Officer' },
  { id: '4', username: 'finance.team@example.com', role: 'FINANCE_TEAM', name: 'Finance User' },
  { id: '5', username: 'policyholder@example.com', role: 'POLICYHOLDER', name: 'Alice Johnson' },
];

const App = () => {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {}, path: [{ name: 'Dashboard', screen: 'DASHBOARD' }] });
  const [user, setUser] = useState(DUMMY_USERS[0]); // Default to Admin for demonstration
  const [claims, setClaims] = useState(DUMMY_CLAIMS);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const navigate = (screenName, params = {}) => {
    setView((prevView) => {
      const newPath = prevView.path.slice();
      const newBreadcrumb = { name: screenName.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), screen: screenName, params };

      // Prevent duplicate breadcrumbs if navigating to current screen
      if (newPath.length > 0 && newPath[newPath.length - 1].screen === screenName && JSON.stringify(newPath[newPath.length - 1].params) === JSON.stringify(params)) {
        return { screen: screenName, params, path: newPath };
      }

      // If navigating to a parent screen, truncate path
      const existingIndex = newPath.findIndex(item => item.screen === screenName && JSON.stringify(item.params) === JSON.stringify(params));
      if (existingIndex !== -1) {
        return { screen: screenName, params, path: newPath.slice(0, existingIndex + 1) };
      }

      // Add to path
      return { screen: screenName, params, path: [...newPath, newBreadcrumb] };
    });
    setShowGlobalSearch(false); // Close search when navigating
    setShowFiltersPanel(false); // Close filters when navigating
  };

  const goBack = () => {
    setView((prevView) => {
      const newPath = prevView.path.slice(0, prevView.path.length - 1);
      if (newPath.length === 0) {
        return { screen: 'DASHBOARD', params: {}, path: [{ name: 'Dashboard', screen: 'DASHBOARD' }] };
      }
      const lastScreen = newPath[newPath.length - 1];
      return { screen: lastScreen.screen, params: lastScreen.params, path: newPath };
    });
  };

  const hasPermission = (permission) => {
    return user?.role && ROLES[user.role]?.permissions.includes(permission);
  };

  const isAllowedScreen = (screen) => {
    return user?.role && ROLES[user.role]?.screens.includes(screen);
  };

  const handleLogin = (selectedRole) => {
    const selectedUser = DUMMY_USERS.find(u => u.role === selectedRole);
    if (selectedUser) {
      setUser(selectedUser);
      setView({ screen: 'DASHBOARD', params: {}, path: [{ name: 'Dashboard', screen: 'DASHBOARD' }] });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView({ screen: 'LOGIN', params: {}, path: [] });
  };

  const getClaimDetails = (claimId) => claims.find(c => c.id === claimId);

  const updateClaimStatus = (claimId, newStatus, newAssignedTo = null, noteText = '') => {
    setClaims(prevClaims => {
      const updatedClaims = prevClaims.map(claim => {
        if (claim.id === claimId) {
          const newHistory = [...(claim.history || []), {
            timestamp: new Date().toISOString(),
            action: `${newStatus.replace(/_/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} by ${user?.name || user?.role}`
          }];
          const newNotes = noteText ? [...(claim.notes || []), { author: user?.name || user?.role, text: noteText, timestamp: new Date().toISOString() }] : claim.notes;

          const updatedMilestones = claim.milestones?.map(m =>
            m.name.toUpperCase().includes(newStatus.split('_')[0]) && !m.completed
              ? { ...m, date: new Date().toISOString().split('T')[0], completed: true }
              : m
          );

          // Mark previous milestones as complete if status jumps
          const statusOrder = ['SUBMITTED', 'IN_REVIEW', 'PENDING_VERIFICATION', 'PENDING_APPROVAL', 'APPROVED', 'SETTLED', 'REJECTED', 'CLOSED'];
          const newStatusIndex = statusOrder.indexOf(newStatus);
          const currentStatusIndex = statusOrder.indexOf(claim.status);

          if (newStatusIndex > currentStatusIndex) {
            updatedMilestones.forEach(m => {
              const milestoneStatusMap = {
                'Submitted': 'SUBMITTED', 'Review': 'IN_REVIEW', 'Verification': 'PENDING_VERIFICATION',
                'Approval': 'PENDING_APPROVAL', 'Settlement': 'SETTLED'
              };
              const milestoneActualStatus = milestoneStatusMap[m.name];
              if (statusOrder.indexOf(milestoneActualStatus) < newStatusIndex && !m.completed) {
                m.date = new Date().toISOString().split('T')[0];
                m.completed = true;
              }
            });
          }


          return {
            ...claim,
            status: newStatus,
            assignedTo: newAssignedTo || claim.assignedTo,
            history: newHistory,
            notes: newNotes,
            milestones: updatedMilestones
          };
        }
        return claim;
      });
      return updatedClaims;
    });
  };

  const addClaimNote = (claimId, noteText) => {
    setClaims(prevClaims => prevClaims.map(claim =>
      claim.id === claimId
        ? {
          ...claim,
          notes: [...(claim.notes || []), { author: user?.name || user?.role, text: noteText, timestamp: new Date().toISOString() }],
          history: [...(claim.history || []), { timestamp: new Date().toISOString(), action: `Note added by ${user?.name || user?.role}` }]
        }
        : claim
    ));
  };

  const toggleGlobalSearch = () => setShowGlobalSearch(prev => !prev);
  const toggleFiltersPanel = () => setShowFiltersPanel(prev => !prev);

  // --- Components ---

  const Breadcrumbs = ({ path }) => (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      {path.map((crumb, index) => (
        <span key={crumb.screen + index} className="breadcrumb-item">
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          {index < path.length - 1 ? (
            <a href="#" onClick={() => navigate(crumb.screen, crumb.params)}>{crumb.name}</a>
          ) : (
            <span className="active">{crumb.name}</span>
          )}
        </span>
      ))}
    </nav>
  );

  const StatusBadge = ({ status }) => {
    const statusInfo = STATUS_MAPPING[status] || { label: status, className: 'status-default', colorVar: '--color-accent' };
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const ClaimCard = ({ claim }) => {
    const statusClass = STATUS_MAPPING[claim?.status]?.className || 'status-default';
    return (
      <div
        className={`card ${statusClass}`}
        onClick={() => navigate('CLAIM_DETAIL', { claimId: claim?.id })}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-header">
          <h4 className="card-title">{claim?.type || 'N/A'} - {claim?.id}</h4>
          <StatusBadge status={claim?.status} />
        </div>
        <div className="card-body">
          <p><strong>Policyholder:</strong> {claim?.policyholder?.name || 'N/A'}</p>
          <p><strong>Amount:</strong> ${claim?.amount?.toLocaleString() || 'N/A'}</p>
          <p><strong>Submitted:</strong> {claim?.dateSubmitted || 'N/A'}</p>
        </div>
        {/* Quick actions on hover (web) / swipe (mobile) - conceptual */}
        <div className="card-footer">
          {/* Example of a quick action, only visible if user has permission */}
          {(hasPermission('approve_claim') && (claim?.status === 'PENDING_APPROVAL' || claim?.status === 'IN_REVIEW')) && (
            <button
              className="button button-primary"
              onClick={(e) => { e.stopPropagation(); updateClaimStatus(claim.id, 'APPROVED', null, 'Approved via quick action.'); }}
            >
              Approve
            </button>
          )}
        </div>
      </div>
    );
  };

  const WorkflowTracker = ({ milestones, currentStatus, sla }) => {
    const currentStatusStageName = currentStatus.split('_')[0].charAt(0).toUpperCase() + currentStatus.split('_')[0].slice(1);
    const sortedMilestones = [...(milestones || [])].sort((a, b) => {
        const order = ['Submitted', 'Review', 'Verification', 'Approval', 'Settlement'];
        return order.indexOf(a.name) - order.indexOf(b.name);
    });

    return (
      <div className="workflow-tracker">
        {sortedMilestones.map((milestone, index) => {
          const isCurrent = milestone.name.includes(currentStatusStageName) && !milestone.completed;
          const isCompleted = milestone.completed;
          const stageClass = isCurrent ? 'current' : (isCompleted ? 'completed' : '');
          return (
            <div key={milestone.name} className={`workflow-stage ${stageClass}`}>
              <div className="workflow-circle">{index + 1}</div>
              <span>{milestone.name}</span>
              {milestone.date && <span style={{ fontSize: 'var(--font-size-xsmall)', color: 'var(--color-accent)' }}>{milestone.date}</span>}
              {(isCurrent && sla?.breached) && <span style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xsmall)' }}>SLA Breached!</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const DashboardScreen = () => {
    const claimsCount = claims.length;
    const approvedClaims = claims.filter(c => c.status === 'APPROVED').length;
    const pendingClaims = claims.filter(c => c.status.startsWith('PENDING') || c.status === 'IN_REVIEW').length;
    const totalAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0);
    const recentActivities = claims
      .flatMap(claim => claim.history?.map(h => ({ ...h, claimId: claim.id, claimType: claim.type })) || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5); // Show 5 most recent activities

    return (
      <div>
        <h2>Dashboard Overview</h2>
        <div className="dashboard-grid">
          <div className="card pulse-animation" style={{ borderLeftColor: 'var(--color-primary)' }}>
            <h5 className="card-title">Total Claims</h5>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)' }}>{claimsCount}</p>
            <p className="card-meta">All claims processed</p>
          </div>
          <div className="card" style={{ borderLeftColor: 'var(--color-approved)' }}>
            <h5 className="card-title">Approved Claims</h5>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)' }}>{approvedClaims}</p>
            <p className="card-meta">Ready for settlement</p>
          </div>
          <div className="card" style={{ borderLeftColor: 'var(--color-pending)' }}>
            <h5 className="card-title">Pending Claims</h5>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)' }}>{pendingClaims}</p>
            <p className="card-meta">Awaiting review/verification</p>
          </div>
          <div className="card" style={{ borderLeftColor: 'var(--color-settled)' }}>
            <h5 className="card-title">Total Claim Value</h5>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)' }}>${totalAmount.toLocaleString()}</p>
            <p className="card-meta">Overall financial exposure</p>
          </div>
        </div>

        <h3 className="dashboard-section-title">Claim Status Distribution</h3>
        <div className="dashboard-grid">
          <div className="chart-container">Donut Chart Placeholder (e.g., Claims by Status)</div>
          <div className="chart-container">Bar Chart Placeholder (e.g., Claims by Type)</div>
        </div>

        <h3 className="dashboard-section-title">Claims Processing Timeline</h3>
        <div className="chart-container" style={{ gridColumn: 'span 2' }}>Line Chart Placeholder (e.g., Claims Submitted/Settled over time)</div>

        <h3 className="dashboard-section-title">Recent Activities</h3>
        <div className="activity-list">
          {recentActivities.map((activity, index) => (
            <div key={activity.timestamp + index} className="activity-item">
              <span>{new Date(activity.timestamp).toLocaleString()}</span>: {activity.action} for Claim ID <a href="#" onClick={() => navigate('CLAIM_DETAIL', { claimId: activity.claimId })}>{activity.claimId}</a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ClaimsListScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortKey, setSortKey] = useState('dateSubmitted');
    const [sortDirection, setSortDirection] = useState('desc');

    const filteredAndSortedClaims = claims
      .filter(claim => (
        hasPermission('view_all_claims') ||
        (hasPermission('view_assigned_claims') && claim?.assignedTo === user?.name) ||
        (hasPermission('view_my_claims') && claim?.policyholder?.id === user?.id) ||
        (hasPermission('view_approved_claims') && claim?.status === 'APPROVED')
      ))
      .filter(claim =>
        filterStatus === 'ALL' || claim?.status === filterStatus
      )
      .filter(claim =>
        (claim?.type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (claim?.policyholder?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (claim?.id?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (typeof valA === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });


    return (
      <div>
        <h2>All Claims</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <input
            type="text"
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flexGrow: 1, padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)' }}
          />
          <button className="button button-ghost" onClick={toggleFiltersPanel}>Filters</button>
          {hasPermission('export_data') && <button className="button button-ghost">Export to Excel</button>}
          {hasPermission('submit_claim') && (user?.role === 'POLICYHOLDER') &&
            <button className="button button-primary" onClick={() => navigate('SUBMIT_CLAIM')}>Submit New Claim</button>
          }
        </div>

        {/* Filters Side Panel (Web) */}
        {showFiltersPanel && (
          <>
            <div className="side-panel-overlay active" onClick={toggleFiltersPanel}></div>
            <div className="side-panel active">
              <div className="side-panel-header">
                <h4>Filters</h4>
                <button className="close-button" onClick={toggleFiltersPanel}>&times;</button>
              </div>
              <div className="form-group">
                <label htmlFor="filterStatus">Status</label>
                <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  {Object.keys(STATUS_MAPPING).map(statusKey => (
                    <option key={statusKey} value={statusKey}>{STATUS_MAPPING[statusKey].label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sortKey">Sort By</label>
                <select id="sortKey" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                  <option value="dateSubmitted">Date Submitted</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                  <option value="type">Claim Type</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sortDirection">Sort Direction</label>
                <select id="sortDirection" value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <div className="form-actions">
                <button className="button button-secondary" onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                  setSortKey('dateSubmitted');
                  setSortDirection('desc');
                  toggleFiltersPanel();
                }}>Reset</button>
                <button className="button button-primary" onClick={toggleFiltersPanel}>Apply Filters</button>
              </div>
            </div>
          </>
        )}

        <div className="card-grid">
          {filteredAndSortedClaims.length > 0 ? (
            filteredAndSortedClaims.map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))
          ) : (
            // As per UI/UX Law: Dummy data must always be present, no empty states allowed.
            // In a real scenario, this would be an "illustrated empty state with call-to-action".
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-xxl)', color: 'var(--color-accent)' }}>
              <p style={{ fontSize: 'var(--font-size-h3)' }}>No claims match your current filters.</p>
              <button className="button button-primary" onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ClaimDetailScreen = ({ claimId }) => {
    const claim = getClaimDetails(claimId);
    const [showEditForm, setShowEditForm] = useState(false);
    const [noteContent, setNoteContent] = useState('');

    if (!claim) {
      return (
        <div className="main-content">
          <Breadcrumbs path={view.path} />
          <h2>Claim Not Found</h2>
          <p>The claim you are looking for does not exist.</p>
          <button className="button button-primary" onClick={() => navigate('CLAIMS_LIST')}>Back to Claims List</button>
        </div>
      );
    }

    const handleUpdateClaim = (updatedFields) => {
      setClaims(prevClaims => prevClaims.map(c => c.id === claimId ? { ...c, ...updatedFields } : c));
      setShowEditForm(false);
    };

    const handleAddNote = () => {
      if (noteContent.trim()) {
        addClaimNote(claimId, noteContent.trim());
        setNoteContent('');
      }
    };

    const isOfficer = (user?.role === 'CLAIMS_OFFICER' || user?.role === 'VERIFICATION_OFFICER');
    const isFinance = (user?.role === 'FINANCE_TEAM');
    const isAdmin = (user?.role === 'ADMIN');
    const isPolicyholder = (user?.role === 'POLICYHOLDER');

    const canEdit = hasPermission('edit_all_claims') || (hasPermission('edit_assigned_claims') && claim?.assignedTo === user?.name) || (isPolicyholder && claim?.status === 'SUBMITTED');
    const canApprove = (hasPermission('approve_claim') && (claim?.status === 'IN_REVIEW' || claim?.status === 'PENDING_APPROVAL'));
    const canReject = (hasPermission('reject_claim') && (claim?.status !== 'REJECTED' && claim?.status !== 'SETTLED'));
    const canSettle = (hasPermission('settle_claim') && claim?.status === 'APPROVED');
    const canVerify = (hasPermission('verify_claim_documents') && claim?.status === 'PENDING_VERIFICATION');

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ margin: 0 }}>Claim Details: {claim?.id}</h2>
          <button className="button button-secondary" onClick={goBack}>Back to List</button>
        </div>

        <WorkflowTracker milestones={claim?.milestones} currentStatus={claim?.status} sla={claim?.sla} />

        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-item"><strong>Policyholder:</strong> {claim?.policyholder?.name} ({claim?.policyholder?.id})</div>
          <div className="detail-item"><strong>Claim Type:</strong> {claim?.type}</div>
          <div className="detail-item"><strong>Amount:</strong> ${claim?.amount?.toLocaleString()}</div>
          <div className="detail-item"><strong>Status:</strong> <StatusBadge status={claim?.status} /></div>
          <div className="detail-item"><strong>Date Submitted:</strong> {claim?.dateSubmitted}</div>
          <div className="detail-item"><strong>Assigned To:</strong> {claim?.assignedTo || 'N/A'}</div>
          {claim?.sla && (
            <div className="detail-item">
              <strong>SLA Target:</strong> {claim?.sla?.targetDate}
              {claim?.sla?.breached ? <span style={{ color: 'var(--color-danger)', marginLeft: 'var(--spacing-sm)' }}> (Breached)</span> : null}
            </div>
          )}
          <div className="detail-actions">
            {canEdit && <button className="button button-ghost" onClick={() => setShowEditForm(true)}>Edit Claim</button>}
            {canVerify && <button className="button button-primary" onClick={() => updateClaimStatus(claim.id, 'PENDING_APPROVAL', claim.assignedTo, 'Claim documents verified.')}>Mark Verified</button>}
            {canApprove && <button className="button button-primary" onClick={() => updateClaimStatus(claim.id, 'APPROVED', 'Finance Team', 'Claim approved for settlement.')}>Approve</button>}
            {canReject && <button className="button button-danger" onClick={() => updateClaimStatus(claim.id, 'REJECTED', null, 'Claim rejected.')}>Reject</button>}
            {canSettle && <button className="button button-primary" onClick={() => updateClaimStatus(claim.id, 'SETTLED', null, 'Claim settled.')}>Settle</button>}
          </div>
        </div>

        {showEditForm && (
          <div className="detail-section" style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3>Edit Claim</h3>
            <EditClaimForm claim={claim} onSave={handleUpdateClaim} onCancel={() => setShowEditForm(false)} />
          </div>
        )}

        <div className="detail-section">
          <h3>Supporting Documents</h3>
          {(claim?.documents && claim.documents.length > 0) ? (
            <ul>
              {claim.documents.map((doc, index) => (
                <li key={doc.name + index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    {doc.name}
                  </a> (Type: {doc.type})
                  {/* Document preview would typically be a modal or embedded viewer */}
                  <span style={{ marginLeft: 'var(--spacing-md)', color: 'var(--color-accent)' }}>[Preview]</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No documents uploaded yet.</p>
          )}
          {(hasPermission('upload_documents') && (isPolicyholder || isOfficer || isAdmin)) && (
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="file-upload-area">
                <input type="file" multiple style={{ display: 'none' }} id="file-upload" />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>Drag & drop files here or click to upload</label>
              </div>
              <button className="button button-primary" style={{ marginTop: 'var(--spacing-md)' }}>Upload Documents</button>
            </div>
          )}
        </div>

        <div className="detail-section">
          <h3>Claim Notes</h3>
          {(claim?.notes && claim.notes.length > 0) ? (
            <ul>
              {claim.notes.map((note, index) => (
                <li key={note.timestamp + index} style={{ marginBottom: 'var(--spacing-md)', borderBottom: '1px dashed var(--color-border)', paddingBottom: 'var(--spacing-md)' }}>
                  <strong>{note.author}</strong> on {new Date(note.timestamp).toLocaleString()}:
                  <p style={{ margin: 'var(--spacing-xs) 0 0 0' }}>{note.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notes for this claim yet.</p>
          )}
          {(hasPermission('add_claim_note') && (isPolicyholder || isOfficer || isAdmin)) && (
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a new note..."
                rows="4"
                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius)', border: '1px solid var(--color-border)' }}
              ></textarea>
              <button className="button button-primary" onClick={handleAddNote} style={{ marginTop: 'var(--spacing-sm)' }}>Add Note</button>
            </div>
          )}
        </div>

        {(hasPermission('view_audit_logs')) && (
          <div className="detail-section">
            <h3>Audit Log</h3>
            {(claim?.history && claim.history.length > 0) ? (
              <ul>
                {claim.history.map((entry, index) => (
                  <li key={entry.timestamp + index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                    {new Date(entry.timestamp).toLocaleString()}: {entry.action}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No audit log entries.</p>
            )}
          </div>
        )}

        {/* Related Records Placeholder */}
        <div className="detail-section">
          <h3>Related Records (Policy Holder, Policies, etc.)</h3>
          <p>Display other policies or claims related to {claim?.policyholder?.name}.</p>
        </div>
      </div>
    );
  };

  const EditClaimForm = ({ claim, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ ...claim });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.type) newErrors.type = 'Claim Type is mandatory.';
      if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be a positive number.';
      if (!formData.dateSubmitted) newErrors.dateSubmitted = 'Date Submitted is mandatory.';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        onSave(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Claim Type *</label>
          <input type="text" id="type" name="type" value={formData.type || ''} onChange={handleChange} required />
          {errors.type && <p className="error-message">{errors.type}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount *</label>
          <input type="number" id="amount" name="amount" value={formData.amount || ''} onChange={handleChange} required />
          {errors.amount && <p className="error-message">{errors.amount}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="dateSubmitted">Date Submitted *</label>
          <input type="date" id="dateSubmitted" name="dateSubmitted" value={formData.dateSubmitted || ''} onChange={handleChange} required />
          {errors.dateSubmitted && <p className="error-message">{errors.dateSubmitted}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="assignedTo">Assigned To</label>
          <input type="text" id="assignedTo" name="assignedTo" value={formData.assignedTo || ''} onChange={handleChange} />
        </div>
        {/* File upload example - would integrate with handleFileUpload if fully implemented */}
        <div className="form-group">
          <label>Documents</label>
          <div className="file-upload-area">
            <input type="file" multiple style={{ display: 'none' }} id="edit-file-upload" />
            <label htmlFor="edit-file-upload" style={{ cursor: 'pointer', display: 'block' }}>Drag & drop or click to upload</label>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="button button-primary">Save Changes</button>
        </div>
      </form>
    );
  };

  const UserManagementScreen = () => {
    if (!hasPermission('manage_users')) {
      return (
        <div className="main-content">
          <h2>Access Denied</h2>
          <p>You do not have permission to view User Management.</p>
        </div>
      );
    }
    return (
      <div>
        <h2>User Management</h2>
        <div className="card-grid">
          {DUMMY_USERS.map(u => (
            <div key={u.id} className="card" style={{ borderLeftColor: 'var(--color-accent)' }}>
              <div className="card-header">
                <h4 className="card-title">{u.name}</h4>
                <StatusBadge status={u.role.replace('_', ' ').toUpperCase()} /> {/* Using status badge for roles */}
              </div>
              <div className="card-body">
                <p><strong>Username:</strong> {u.username}</p>
                <p><strong>Role:</strong> {u.role}</p>
              </div>
              <div className="card-footer">
                <button className="button button-ghost">Edit Role</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AuditLogScreen = () => {
    if (!hasPermission('view_audit_logs')) {
      return (
        <div className="main-content">
          <h2>Access Denied</h2>
          <p>You do not have permission to view Audit Logs.</p>
        </div>
      );
    }
    const allAuditLogs = claims
      .flatMap(claim => claim.history?.map(h => ({ ...h, claimId: claim.id, claimType: claim.type })) || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return (
      <div>
        <h2>Audit Logs</h2>
        <div className="activity-list">
          {allAuditLogs.map((entry, index) => (
            <div key={entry.timestamp + index + entry.claimId} className="activity-item">
              <span>{new Date(entry.timestamp).toLocaleString()}</span>: {entry.action} (Claim ID: <a href="#" onClick={() => navigate('CLAIM_DETAIL', { claimId: entry.claimId })}>{entry.claimId}</a>)
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SubmitClaimScreen = () => {
    const [formData, setFormData] = useState({
      policyholderId: user?.id || '',
      policyholderName: user?.name || '',
      type: '',
      amount: '',
      dateOfIncident: '',
      description: '',
      documents: []
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Auto-populate policyholder info if user is Policyholder
        if (user?.role === 'POLICYHOLDER') {
            setFormData(prev => ({
                ...prev,
                policyholderId: user.id,
                policyholderName: user.name
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, ...Array.from(e.target.files)]
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.type) newErrors.type = 'Claim Type is mandatory.';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be a positive number.';
        if (!formData.dateOfIncident) newErrors.dateOfIncident = 'Date of Incident is mandatory.';
        if (!formData.description) newErrors.description = 'Description is mandatory.';
        if (!formData.policyholderId) newErrors.policyholderId = 'Policyholder ID is mandatory.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const newClaim = {
                id: generateRandomId(),
                policyholder: { id: formData.policyholderId, name: formData.policyholderName },
                type: formData.type,
                amount: parseFloat(formData.amount),
                dateSubmitted: new Date().toISOString().split('T')[0],
                status: 'SUBMITTED',
                assignedTo: 'Claims Officer 1', // Default assignment
                documents: formData.documents.map(f => ({ name: f.name, url: '#', type: f.type || f.name.split('.').pop() })),
                history: [
                    { timestamp: new Date().toISOString(), action: `Claim Submitted by ${formData.policyholderName}` },
                    { timestamp: new Date().toISOString(), action: 'Assigned to Claims Officer 1' },
                ],
                notes: [{ author: formData.policyholderName, text: formData.description, timestamp: new Date().toISOString() }],
                sla: { targetDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().split('T')[0], breached: false }, // 20 days SLA
                milestones: [
                    { name: 'Submitted', date: new Date().toISOString().split('T')[0], completed: true },
                    { name: 'Review', date: null, completed: false },
                    { name: 'Verification', date: null, completed: false },
                    { name: 'Approval', date: null, completed: false },
                    { name: 'Settlement', date: null, completed: false },
                ]
            };
            setClaims(prevClaims => [...prevClaims, newClaim]);
            alert('Claim submitted successfully!');
            navigate('CLAIM_DETAIL', { claimId: newClaim.id });
        }
    };

    return (
        <div>
            <h2>Submit New Claim</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="policyholderName">Policyholder Name</label>
                    <input type="text" id="policyholderName" name="policyholderName" value={formData.policyholderName || ''} readOnly={user?.role === 'POLICYHOLDER'} />
                </div>
                <div className="form-group">
                    <label htmlFor="policyholderId">Policyholder ID *</label>
                    <input type="text" id="policyholderId" name="policyholderId" value={formData.policyholderId || ''} onChange={handleChange} required readOnly={user?.role === 'POLICYHOLDER'} />
                    {errors.policyholderId && <p className="error-message">{errors.policyholderId}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="type">Claim Type *</label>
                    <input type="text" id="type" name="type" value={formData.type || ''} onChange={handleChange} placeholder="e.g., Auto Accident, Home Burglary" required />
                    {errors.type && <p className="error-message">{errors.type}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Claim Amount *</label>
                    <input type="number" id="amount" name="amount" value={formData.amount || ''} onChange={handleChange} required min="0.01" step="0.01" />
                    {errors.amount && <p className="error-message">{errors.amount}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="dateOfIncident">Date of Incident *</label>
                    <input type="date" id="dateOfIncident" name="dateOfIncident" value={formData.dateOfIncident || ''} onChange={handleChange} required max={new Date().toISOString().split('T')[0]}/>
                    {errors.dateOfIncident && <p className="error-message">{errors.dateOfIncident}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows="5" placeholder="Provide a detailed description of the incident..." required></textarea>
                    {errors.description && <p className="error-message">{errors.description}</p>}
                </div>
                <div className="form-group">
                    <label>Supporting Documents</label>
                    <div className="file-upload-area">
                        <input type="file" multiple style={{ display: 'none' }} id="claim-documents-upload" onChange={handleFileChange} />
                        <label htmlFor="claim-documents-upload" style={{ cursor: 'pointer', display: 'block' }}>Drag & drop files here or click to upload</label>
                    </div>
                    {formData.documents.length > 0 && (
                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            <p>Files to upload:</p>
                            <ul>
                                {formData.documents.map((file, index) => (
                                    <li key={index} style={{ fontSize: 'var(--font-size-small)' }}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="form-actions">
                    <button type="button" className="button button-secondary" onClick={() => navigate('CLAIMS_LIST')}>Cancel</button>
                    <button type="submit" className="button button-primary">Submit Claim</button>
                </div>
            </form>
        </div>
    );
  };


  const LoginScreen = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const handleLoginClick = () => {
      if (selectedRole) {
        handleLogin(selectedRole);
      } else {
        alert('Please select a role to log in.');
      }
    };

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-dark)',
        padding: 'var(--spacing-xl)'
      }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: 'var(--spacing-xxl)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary)' }}>Insurance Platform Login</h2>
          <div className="form-group">
            <label htmlFor="role-select">Select Your Role</label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ marginBottom: 'var(--spacing-lg)' }}
            >
              <option value="">-- Choose Role --</option>
              {Object.keys(ROLES).map(roleKey => (
                <option key={roleKey} value={roleKey}>
                  {roleKey.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
          <button className="button button-primary" onClick={handleLoginClick} style={{ width: '100%' }}>Login</button>
        </div>
      </div>
    );
  };


  const renderScreen = () => {
    if (!user) {
      return <LoginScreen />;
    }
    if (!isAllowedScreen(view.screen)) {
      return (
        <div className="main-content">
          <Breadcrumbs path={view.path} />
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
          <button className="button button-primary" onClick={() => navigate('DASHBOARD')}>Go to Dashboard</button>
        </div>
      );
    }

    switch (view.screen) {
      case 'DASHBOARD':
        return <DashboardScreen />;
      case 'CLAIMS_LIST':
        return <ClaimsListScreen />;
      case 'CLAIM_DETAIL':
        return <ClaimDetailScreen claimId={view.params.claimId} />;
      case 'USER_MANAGEMENT':
        return <UserManagementScreen />;
      case 'AUDIT_LOGS':
        return <AuditLogScreen />;
      case 'SUBMIT_CLAIM':
        return <SubmitClaimScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="app-container">
      {user && (
        <header className="app-header">
          <a href="#" className="app-logo" onClick={() => navigate('DASHBOARD')}>Insurance Platform</a>
          <nav className="nav-links">
            {isAllowedScreen('DASHBOARD') && <a href="#" className="nav-link" onClick={() => navigate('DASHBOARD')}>Dashboard</a>}
            {isAllowedScreen('CLAIMS_LIST') && <a href="#" className="nav-link" onClick={() => navigate('CLAIMS_LIST')}>Claims</a>}
            {isAllowedScreen('USER_MANAGEMENT') && <a href="#" className="nav-link" onClick={() => navigate('USER_MANAGEMENT')}>Users</a>}
            {isAllowedScreen('AUDIT_LOGS') && <a href="#" className="nav-link" onClick={() => navigate('AUDIT_LOGS')}>Audit Logs</a>}
          </nav>
          <div className="user-info">
            <span onClick={toggleGlobalSearch} style={{ cursor: 'pointer', marginRight: 'var(--spacing-md)' }}>🔍 Search</span>
            <span>{user?.name || user?.username} ({user?.role})</span>
            <button className="button button-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </header>
      )}

      {showGlobalSearch && user && (
        <div className="global-search-container active">
          <input
            type="text"
            className="global-search-input"
            placeholder="Search claims, policies, users..."
            onKeyDown={(e) => {
              if (e.key === 'Escape') toggleGlobalSearch();
              // Smart suggestions logic would go here
            }}
          />
          <button className="close-button" onClick={toggleGlobalSearch}>&times;</button>
        </div>
      )}

      <main className="main-content">
        {user && view.screen !== 'LOGIN' && <Breadcrumbs path={view.path} />}
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;