import React, { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  Alert,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";

// Mock data for demonstration
const mockPendingApprovals = [
  {
    id: 1,
    type: "Rule",
    name: "High Value Transaction Check",
    action: "CREATE",
    requestedBy: "John Doe",
    requestedAt: "2025-01-20T10:30:00Z",
    status: "PENDING",
  },
  {
    id: 2,
    type: "Rule Set",
    name: "Enhanced Validation Set",
    action: "UPDATE",
    requestedBy: "Jane Smith",
    requestedAt: "2025-01-19T15:45:00Z",
    status: "PENDING",
  },
  {
    id: 3,
    type: "Rule",
    name: "Currency Validation",
    action: "DELETE",
    requestedBy: "Mike Johnson",
    requestedAt: "2025-01-18T09:15:00Z",
    status: "APPROVED",
  },
];

const MakerCheckerTable = () => {
  const [approvals, setApprovals] = useState(mockPendingApprovals);

  const handleApprove = (id) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "APPROVED",
              approvedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const handleReject = (id) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "REJECTED",
              rejectedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <PendingIcon color="warning" />;
      case "APPROVED":
        return <ApproveIcon color="success" />;
      case "REJECTED":
        return <RejectIcon color="error" />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE":
        return "success";
      case "UPDATE":
        return "info";
      case "DELETE":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const pendingCount = approvals.filter(
    (item) => item.status === "PENDING"
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Maker/Checker Approvals
      </Typography>

      {pendingCount > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have {pendingCount} pending approval
          {pendingCount !== 1 ? "s" : ""} requiring your attention.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Requested By</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Chip
                    label={item.type}
                    variant="outlined"
                    color={item.type === "Rule" ? "primary" : "secondary"}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {item.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.action}
                    size="small"
                    color={getActionColor(item.action)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{item.requestedBy}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(item.requestedAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getStatusIcon(item.status)}
                    <Chip
                      label={item.status}
                      size="small"
                      color={getStatusColor(item.status)}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {item.status === "PENDING" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleApprove(item.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleReject(item.id)}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                  {item.status !== "PENDING" && (
                    <Typography variant="body2" color="text.secondary">
                      {item.status === "APPROVED" ? "Approved" : "Rejected"} on{" "}
                      {formatDate(item.approvedAt || item.rejectedAt)}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {approvals.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No approval requests found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MakerCheckerTable;
