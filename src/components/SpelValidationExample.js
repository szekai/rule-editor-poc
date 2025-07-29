import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Divider,
} from "@mui/material";
import spelValidationService from "../services/spelValidationService";

/**
 * Example component demonstrating SpEL validation service usage
 */
const SpelValidationExample = () => {
  const [expression, setExpression] = useState("transaction.amount > 1000");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Test different validation methods
  const testValidation = async () => {
    setIsLoading(true);
    try {
      // 1. Basic validation
      console.log("🔍 Testing basic validation...");
      const basicResult = await spelValidationService.validateExpression(
        expression
      );
      console.log("Basic validation result:", basicResult);

      // 2. Live validation
      console.log("🔍 Testing live validation...");
      const liveResult = await spelValidationService.validateLive(
        expression,
        "business",
        true
      );
      console.log("Live validation result:", liveResult);

      // 3. Context discovery
      console.log("🔍 Testing context discovery...");
      const context = await spelValidationService.getContext("business");
      console.log("Available context:", context);

      // 4. Test with custom data
      console.log("🔍 Testing with custom data...");
      const testData = {
        transaction: { amount: 2500, currency: "EUR" },
        user: { role: "MANAGER" },
      };
      const testResult = await spelValidationService.testExpression(
        expression,
        testData
      );
      console.log("Test result:", testResult);

      setResult({
        basic: basicResult,
        live: liveResult,
        context: context,
        test: testResult,
      });
    } catch (error) {
      console.error("❌ Validation error:", error);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Check service status
  const checkService = async () => {
    const config = spelValidationService.getConfig();
    const isAvailable = await spelValidationService.isServiceAvailable();

    alert(`Service Configuration:
    - Mode: ${config.status}
    - Base URL: ${config.baseUrl}
    - Available: ${isAvailable}
    - Using Mock: ${config.useMock}`);
  };

  // Switch API modes
  const switchToReal = () => {
    const url = prompt(
      "Enter your backend URL:",
      "http://localhost:8080/api/spel"
    );
    if (url) {
      spelValidationService.useRealApi(url);
      alert("Switched to real API: " + url);
    }
  };

  const switchToMock = () => {
    spelValidationService.useMockApi();
    alert("Switched to mock API");
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: "auto", mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        SpEL Validation Service Example
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        This example demonstrates how to use the SpEL validation service with
        mock/real API switching.
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Configuration Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuration
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button onClick={checkService} variant="outlined" size="small">
            Check Service Status
          </Button>
          <Button onClick={switchToReal} variant="outlined" size="small">
            Switch to Real API
          </Button>
          <Button onClick={switchToMock} variant="outlined" size="small">
            Switch to Mock API
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Test Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Expression
        </Typography>

        <TextField
          fullWidth
          label="SpEL Expression"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="e.g., transaction.amount > 1000"
        />

        <Button
          onClick={testValidation}
          variant="contained"
          disabled={isLoading || !expression.trim()}
        >
          {isLoading ? "Testing..." : "Test All Validation Methods"}
        </Button>
      </Box>

      {/* Results Section */}
      {result && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>

          {result.error ? (
            <Alert severity="error">Error: {result.error}</Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Basic Validation Result */}
              <Alert severity={result.basic?.valid ? "success" : "error"}>
                <Typography variant="subtitle2">Basic Validation:</Typography>
                <Typography variant="body2">
                  {result.basic?.valid
                    ? "✅ Valid"
                    : `❌ ${result.basic?.error}`}
                  {result.basic?.executionTimeMs &&
                    ` (${result.basic.executionTimeMs.toFixed(2)}ms)`}
                </Typography>
                {result.basic?.result !== undefined && (
                  <Typography variant="body2">
                    Result: {JSON.stringify(result.basic.result)} (
                    {result.basic.resultType})
                  </Typography>
                )}
              </Alert>

              {/* Live Validation Result */}
              <Alert severity={result.live?.valid ? "success" : "error"}>
                <Typography variant="subtitle2">Live Validation:</Typography>
                <Typography variant="body2">
                  {result.live?.valid ? "✅ Valid" : `❌ ${result.live?.error}`}
                  {result.live?.executionSuccessful && " & Executable"}
                </Typography>
              </Alert>

              {/* Available Context */}
              <Alert severity="info">
                <Typography variant="subtitle2">
                  Available Context Objects:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                >
                  {Object.keys(result.context || {}).join(", ")}
                </Typography>
              </Alert>

              {/* Test Result */}
              <Alert severity={result.test?.valid ? "success" : "error"}>
                <Typography variant="subtitle2">Custom Data Test:</Typography>
                <Typography variant="body2">
                  {result.test?.valid
                    ? "✅ Test Passed"
                    : `❌ ${result.test?.error}`}
                </Typography>
                {result.test?.result !== undefined && (
                  <Typography variant="body2">
                    Test Result: {JSON.stringify(result.test.result)}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Alert severity="info">
        <Typography variant="subtitle2">💡 Usage Tips:</Typography>
        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
          <li>
            The service starts in mock mode (always returns positive results)
          </li>
          <li>Switch to real API when your Spring Boot backend is ready</li>
          <li>
            The validation service automatically handles errors and fallbacks
          </li>
          <li>Use live validation for real-time feedback in editors</li>
          <li>Check the browser console for detailed logs</li>
        </ul>
      </Alert>
    </Paper>
  );
};

export default SpelValidationExample;
