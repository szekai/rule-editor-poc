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
import { mockApi } from "../utils/mockApi";
import {
  useSpelValidation,
  useSpelServiceConfig,
} from "../hooks/useSpelValidation";
import spelValidationService from "../services/spelValidationService";

export default function SpelRuleEditor() {
  const [selectedRule, setSelectedRule] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Use the new SpEL validation hook for syntax validation only
  const { validation, isValidating, isServiceAvailable, validateExpression } =
    useSpelValidation(formData.condition, "business", {
      enableLiveValidation: true,
      enableExecutionValidation: false, // Disable auto execution validation
      debounceMs: 500,
    });

  // Separate state for backend validation
  const [backendValidation, setBackendValidation] = useState(null);
  const [isBackendValidating, setIsBackendValidating] = useState(false);

  // Service configuration hook
  const { config, isMock, switchToRealApi, switchToMockApi } =
    useSpelServiceConfig();

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

  // Optional backend validation function
  const handleBackendValidation = async () => {
    if (!formData.condition.trim()) {
      showSnackbar("Please enter a SpEL condition first", "warning");
      return;
    }

    setIsBackendValidating(true);
    setBackendValidation(null);

    try {
      // Use full execution validation for backend validation
      const result = await spelValidationService.validateExpression(
        formData.condition,
        "business"
      );

      setBackendValidation(result);

      if (result.valid && result.executionSuccessful) {
        showSnackbar(
          "✅ Backend validation passed! Expression is valid and executable.",
          "success"
        );
      } else if (result.valid && !result.executionSuccessful) {
        showSnackbar(
          "⚠️ Syntax is correct but execution failed. Check the warnings.",
          "warning"
        );
      } else {
        showSnackbar(
          "❌ Backend validation failed. Check the error details.",
          "error"
        );
      }
    } catch (error) {
      console.error("Backend validation error:", error);
      setBackendValidation({
        valid: false,
        error: `Backend validation failed: ${error.message}`,
        suggestions: [
          "Check your network connection",
          "Verify the backend service is running",
        ],
      });
      showSnackbar("Backend validation service is unavailable", "warning");
    } finally {
      setIsBackendValidating(false);
    }
  };

  // Remove the old validation function since we're using the hook now

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showSnackbar("Rule name is required", "error");
      return;
    }

    if (!formData.condition.trim()) {
      showSnackbar("SpEL condition is required", "error");
      return;
    }

    // Only check syntax validation - backend validation is optional
    if (validation && !validation.valid) {
      showSnackbar("Please fix SpEL syntax errors before saving", "error");
      return;
    }

    setLoading(true);
    try {
      const ruleData = {
        ...formData,
        syntaxValidation: validation,
        backendValidation: backendValidation, // Include backend validation if available
        lastValidated: new Date().toISOString(),
      };

      if (selectedRule) {
        // Update existing rule
        await mockApi.updateRule(selectedRule.id, ruleData);
        showSnackbar("Rule updated successfully!");
      } else {
        // Create new rule
        await mockApi.createRule(ruleData);
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
    // Note: validation state is managed by useSpelValidation hook and will auto-clear when condition changes
    setBackendValidation(null); // Clear backend validation when resetting
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
    setBackendValidation(null); // Clear backend validation when editing a new rule
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              {selectedRule
                ? `Edit Rule: ${selectedRule.name}`
                : "Create New Rule"}
            </Typography>

            {/* Service Status Indicator */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                size="small"
                label={isMock ? "MOCK API" : "LIVE API"}
                color={isServiceAvailable ? "success" : "error"}
                variant={isMock ? "outlined" : "filled"}
                onClick={() => {
                  if (isMock) {
                    const url = prompt(
                      "Enter real API URL:",
                      "http://localhost:8080/api/spel"
                    );
                    if (url) switchToRealApi(url);
                  } else {
                    switchToMockApi();
                  }
                }}
                sx={{ cursor: "pointer" }}
              />
              {!isServiceAvailable && (
                <ErrorIcon color="error" fontSize="small" />
              )}
            </Box>
          </Box>

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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* Backend Validation Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleBackendValidation}
                    disabled={!formData.condition.trim() || isBackendValidating}
                    startIcon={
                      isBackendValidating ? (
                        <CircularProgress size={16} />
                      ) : undefined
                    }
                    sx={{ minWidth: "auto" }}
                  >
                    {isBackendValidating ? "Validating..." : "Backend Check"}
                  </Button>

                  {/* Syntax Validation Status */}
                  {isValidating && <CircularProgress size={16} />}
                  {validation &&
                    !isValidating &&
                    (validation.valid ? (
                      <CheckIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    ))}
                </Box>
              </Box>

              {/* Validation Status Bar - Syntax Only */}
              {formData.condition.trim() && validation && (
                <Alert
                  severity={validation.valid ? "success" : "error"}
                  sx={{ mb: 1, fontSize: "0.875rem" }}
                >
                  {validation.valid ? (
                    <>✅ Syntax is valid</>
                  ) : (
                    <>❌ Syntax error: {validation.error}</>
                  )}
                </Alert>
              )}

              {/* Backend Validation Results - Optional */}
              {backendValidation && (
                <Alert
                  severity={
                    backendValidation.valid
                      ? backendValidation.executionSuccessful
                        ? "success"
                        : "warning"
                      : "error"
                  }
                  sx={{ mb: 1, fontSize: "0.875rem" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", mb: 0.5 }}
                      >
                        🔍 Backend Validation Result:
                      </Typography>
                      {backendValidation.valid &&
                        backendValidation.executionSuccessful && (
                          <>
                            ✅ Passed! Expression is valid and executable{" "}
                            {backendValidation.executionTimeMs &&
                              `(${backendValidation.executionTimeMs.toFixed(
                                2
                              )}ms)`}
                          </>
                        )}
                      {backendValidation.valid &&
                        !backendValidation.executionSuccessful && (
                          <>
                            ⚠️ Syntax OK, but execution failed:{" "}
                            {backendValidation.error}
                          </>
                        )}
                      {!backendValidation.valid && (
                        <>❌ Failed: {backendValidation.error}</>
                      )}
                      {backendValidation.result !== undefined && (
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          Result: {JSON.stringify(backendValidation.result)} (
                          {backendValidation.resultType})
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label="Optional"
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  </Box>
                </Alert>
              )}

              <Box
                sx={{
                  flex: 1,
                  border: 1,
                  borderColor:
                    validation?.valid === false ? "error.main" : "grey.300",
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

              {/* Smart Suggestions */}
              {validation?.suggestions?.length > 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">
                    💡 Syntax Suggestions:
                  </Typography>
                  <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                    {validation.suggestions.map((suggestion, index) => (
                      <li key={index}>
                        <Typography variant="body2">{suggestion}</Typography>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Backend Validation Suggestions */}
              {backendValidation?.suggestions?.length > 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">
                    🔧 Backend Suggestions:
                  </Typography>
                  <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                    {backendValidation.suggestions.map((suggestion, index) => (
                      <li key={index}>
                        <Typography variant="body2">{suggestion}</Typography>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Service Status Warning */}
              {!isServiceAvailable && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  SpEL validation service is not available. Using fallback
                  validation.
                </Alert>
              )}
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
