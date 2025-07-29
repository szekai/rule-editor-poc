import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Editor } from "@monaco-editor/react";
import { useSpelValidation } from "../hooks/useSpelValidation";
import spelValidationService from "../services/spelValidationService";

/**
 * Demo component showing the difference between syntax and backend validation
 */
const SpelValidationDemo = () => {
  const [expression, setExpression] = useState("transaction.amount > 1000");
  const [backendResult, setBackendResult] = useState(null);
  const [isBackendValidating, setIsBackendValidating] = useState(false);

  // Frontend syntax validation (real-time)
  const { validation: syntaxValidation, isValidating } = useSpelValidation(
    expression,
    "business",
    {
      enableLiveValidation: true,
      enableExecutionValidation: false, // Only syntax checking
      debounceMs: 300,
    }
  );

  // Manual backend validation
  const handleBackendValidation = async () => {
    if (!expression.trim()) return;

    setIsBackendValidating(true);
    try {
      const result = await spelValidationService.validateExpression(
        expression,
        "business"
      );
      setBackendResult(result);
    } catch (error) {
      setBackendResult({
        valid: false,
        error: `Backend validation failed: ${error.message}`,
        suggestions: ["Check network connection", "Verify backend service"],
      });
    } finally {
      setIsBackendValidating(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1000, mx: "auto", mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        SpEL Validation Demo: Syntax vs Backend
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        This demo shows the difference between frontend syntax validation and
        optional backend validation.
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Expression Editor */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          SpEL Expression Editor
        </Typography>

        <Box sx={{ border: "1px solid #ddd", borderRadius: 1, mb: 2 }}>
          <Editor
            height="120px"
            language="javascript"
            value={expression}
            onChange={(value) => setExpression(value || "")}
            options={{
              minimap: { enabled: false },
              lineNumbers: "on",
              automaticLayout: true,
              wordWrap: "on",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Quick Edit Expression"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g., transaction.amount > 1000"
          />

          <Button
            variant="outlined"
            onClick={handleBackendValidation}
            disabled={!expression.trim() || isBackendValidating}
            startIcon={
              isBackendValidating ? <CircularProgress size={16} /> : undefined
            }
            sx={{ minWidth: 160 }}
          >
            {isBackendValidating ? "Validating..." : "Backend Validate"}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Validation Results */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {/* Frontend Syntax Validation */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="h6">Frontend Syntax Validation</Typography>
            <Chip
              label={isValidating ? "Checking..." : "Real-time"}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          {syntaxValidation ? (
            <Alert
              severity={syntaxValidation.valid ? "success" : "error"}
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">
                {syntaxValidation.valid ? "✅ Syntax Valid" : "❌ Syntax Error"}
              </Typography>
              {!syntaxValidation.valid && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {syntaxValidation.error}
                </Typography>
              )}
            </Alert>
          ) : (
            <Alert severity="info">
              <Typography variant="body2">
                Type an expression to see real-time syntax validation
              </Typography>
            </Alert>
          )}

          {syntaxValidation?.suggestions?.length > 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Suggestions:</Typography>
              <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                {syntaxValidation.suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Typography variant="body2">{suggestion}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              ℹ️ Frontend Validation Features:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.875rem" }}>
              <li>Real-time syntax checking</li>
              <li>Immediate feedback as you type</li>
              <li>No network calls required</li>
              <li>Prevents saving invalid syntax</li>
              <li>Basic SpEL grammar validation</li>
            </ul>
          </Box>
        </Box>

        {/* Backend Validation */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="h6">Backend Validation</Typography>
            <Chip
              label="Optional"
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>

          {backendResult ? (
            <Alert
              severity={
                backendResult.valid
                  ? backendResult.executionSuccessful
                    ? "success"
                    : "warning"
                  : "error"
              }
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">
                {backendResult.valid &&
                  backendResult.executionSuccessful &&
                  "✅ Backend Validation Passed"}
                {backendResult.valid &&
                  !backendResult.executionSuccessful &&
                  "⚠️ Syntax OK, Execution Failed"}
                {!backendResult.valid && "❌ Backend Validation Failed"}
              </Typography>

              {backendResult.error && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {backendResult.error}
                </Typography>
              )}

              {backendResult.result !== undefined && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Result:</strong>{" "}
                  {JSON.stringify(backendResult.result)} (
                  {backendResult.resultType})
                </Typography>
              )}

              {backendResult.executionTimeMs && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Execution Time:</strong>{" "}
                  {backendResult.executionTimeMs.toFixed(2)}ms
                </Typography>
              )}
            </Alert>
          ) : (
            <Alert severity="info">
              <Typography variant="body2">
                Click "Backend Validate" to test execution against real context
              </Typography>
            </Alert>
          )}

          {backendResult?.suggestions?.length > 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Backend Suggestions:</Typography>
              <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                {backendResult.suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Typography variant="body2">{suggestion}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              🔧 Backend Validation Features:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.875rem" }}>
              <li>Actual expression execution</li>
              <li>Real context object validation</li>
              <li>Performance timing</li>
              <li>Advanced error suggestions</li>
              <li>Optional - doesn't block saving</li>
            </ul>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Example Expressions */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Try These Examples:
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {[
            "transaction.amount > 1000",
            "user.role == 'ADMIN'",
            "transaction.currency in {'USD', 'EUR'}",
            "user.permissions.contains('APPROVE')",
            "transaction.amount > user.limit", // This might fail in backend
            "invalid.property", // This will fail
          ].map((example, index) => (
            <Chip
              key={index}
              label={example}
              onClick={() => setExpression(example)}
              variant="outlined"
              size="small"
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Summary */}
      <Alert severity="info">
        <Typography variant="subtitle2" gutterBottom>
          💡 Summary:
        </Typography>
        <Typography variant="body2">
          <strong>Frontend validation</strong> ensures syntax is correct and
          prevents saving malformed expressions.
          <br />
          <strong>Backend validation</strong> is optional and tests actual
          execution with real data context.
          <br />
          Rules can be saved with valid syntax even if backend validation fails
          or is skipped.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default SpelValidationDemo;
