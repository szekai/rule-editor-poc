import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Snackbar,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  mockApi,
  validateSpelExpression,
  sampleDataStructure,
} from "../utils/mockApi";

export default function SpelRuleEditor() {
  const [selectedRule, setSelectedRule] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    condition: "",
    ruleType: "validation",
    errorCode: "",
  });

  // Load rules on mount
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const data = await mockApi.getRules();
        setRules(data);
      } catch (error) {
        showSnackbar("Error loading rules: " + error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getRules();
      setRules(data);
    } catch (error) {
      showSnackbar("Error loading rules: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const validateCondition = async (condition) => {
    if (!condition || condition.trim() === "") {
      setValidation(null);
      return;
    }

    setValidating(true);
    try {
      const result = await validateSpelExpression(condition);
      setValidation(result);
    } catch (error) {
      setValidation({ valid: false, error: error.message });
    } finally {
      setValidating(false);
    }
  };

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      validateCondition(formData.condition);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.condition]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showSnackbar("Rule name is required", "error");
      return;
    }

    if (!formData.condition.trim()) {
      showSnackbar("SpEL condition is required", "error");
      return;
    }

    if (validation && !validation.valid) {
      showSnackbar("Please fix SpEL validation errors before saving", "error");
      return;
    }

    setLoading(true);
    try {
      if (selectedRule) {
        // Update existing rule
        await mockApi.updateRule(selectedRule.id, formData);
        showSnackbar("Rule updated successfully!");
      } else {
        // Create new rule
        await mockApi.createRule(formData);
        showSnackbar("Rule created successfully!");
      }

      await loadRules();
      resetForm();
    } catch (error) {
      showSnackbar("Error saving rule: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) {
      return;
    }

    setLoading(true);
    try {
      await mockApi.deleteRule(ruleId);
      showSnackbar("Rule deleted successfully!");
      await loadRules();
      if (selectedRule && selectedRule.id === ruleId) {
        resetForm();
      }
    } catch (error) {
      showSnackbar("Error deleting rule: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      condition: "",
      ruleType: "validation",
      errorCode: "",
    });
    setSelectedRule(null);
    setValidation(null);
  };

  const editRule = (rule) => {
    setFormData({
      name: rule.name,
      description: rule.description,
      condition: rule.condition,
      ruleType: rule.ruleType,
      errorCode: rule.errorCode,
    });
    setSelectedRule(rule);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        SpEL Rule Editor
      </Typography>

      <Box sx={{ display: "flex", gap: 3, height: "80vh" }}>
        {/* Rules List Panel */}
        <Paper sx={{ width: "30%", p: 2, overflow: "auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Rules</Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={resetForm}
            >
              New Rule
            </Button>
          </Box>

          {loading && rules.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            rules.map((rule) => (
              <Card
                key={rule.id}
                sx={{
                  mb: 1,
                  cursor: "pointer",
                  border: selectedRule?.id === rule.id ? 2 : 1,
                  borderColor:
                    selectedRule?.id === rule.id ? "primary.main" : "grey.300",
                  "&:hover": { borderColor: "primary.main" },
                }}
                onClick={() => editRule(rule)}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {rule.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {rule.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                        <Chip
                          label={rule.ruleType}
                          size="small"
                          color={
                            rule.ruleType === "validation"
                              ? "primary"
                              : "secondary"
                          }
                        />
                        {rule.errorCode && (
                          <Chip
                            label={rule.errorCode}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rule.id);
                      }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Paper>

        {/* Rule Editor Panel */}
        <Paper sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" gutterBottom>
            {selectedRule
              ? `Edit Rule: ${selectedRule.name}`
              : "Create New Rule"}
          </Typography>

          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
          >
            {/* Basic Information */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Rule Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Rule Type</InputLabel>
                <Select
                  value={formData.ruleType}
                  label="Rule Type"
                  onChange={(e) => handleFormChange("ruleType", e.target.value)}
                >
                  <MenuItem value="validation">Validation</MenuItem>
                  <MenuItem value="execution">Execution</MenuItem>
                  <MenuItem value="filter">Filter</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />

            <TextField
              label="Error Code"
              fullWidth
              value={formData.errorCode}
              onChange={(e) => handleFormChange("errorCode", e.target.value)}
              helperText="Optional error code for validation rules"
            />

            {/* SpEL Condition Editor */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1">SpEL Condition</Typography>
                {validating && <CircularProgress size={16} />}
                {validation &&
                  !validating &&
                  (validation.valid ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  ))}
              </Box>

              <Box
                sx={{
                  flex: 1,
                  border: 1,
                  borderColor: "grey.300",
                  borderRadius: 1,
                }}
              >
                <Editor
                  height="200px"
                  language="javascript"
                  value={formData.condition}
                  onChange={(value) =>
                    handleFormChange("condition", value || "")
                  }
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    theme: "vs-light",
                  }}
                />
              </Box>

              {/* Validation Feedback */}
              {validation && !validating && (
                <Box sx={{ mt: 1 }}>
                  {validation.valid ? (
                    <Alert severity="success">
                      ✅ SpEL expression is valid
                    </Alert>
                  ) : (
                    <Alert severity="error">
                      ❌ {validation.error}
                      {validation.suggestions &&
                        validation.suggestions.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              Suggestions:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {validation.suggestions.map(
                                (suggestion, index) => (
                                  <li key={index}>
                                    <Typography variant="body2">
                                      {suggestion}
                                    </Typography>
                                  </li>
                                )
                              )}
                            </ul>
                          </Box>
                        )}
                    </Alert>
                  )}

                  {validation.warnings && validation.warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {validation.warnings.map((warning, index) => (
                        <Typography key={index} variant="body2">
                          {warning}
                        </Typography>
                      ))}
                    </Alert>
                  )}
                </Box>
              )}
            </Box>

            {/* Sample Data Structure */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Available Objects for SpEL:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  maxHeight: 150,
                  overflow: "auto",
                }}
              >
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                >
                  {JSON.stringify(sampleDataStructure, null, 2)}
                </Typography>
              </Paper>
            </Box>

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={resetForm}>
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading || (validation && !validation.valid)}
              >
                {loading
                  ? "Saving..."
                  : selectedRule
                  ? "Update Rule"
                  : "Save Rule"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
