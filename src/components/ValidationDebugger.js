import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Alert,
  Button,
  Grid,
  Chip,
} from "@mui/material";
import spelValidationService from "../services/spelValidationService";

/**
 * Debug component to test the fixed validation service directly
 */
const ValidationDebugger = () => {
  const [expression, setExpression] = useState("transaction.amount >");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testCases = [
    {
      expr: "transaction.amount > 1000",
      expected: true,
      label: "Valid: Basic comparison",
    },
    {
      expr: 'user.role == "ADMIN"',
      expected: true,
      label: "Valid: String equality",
    },
    {
      expr: "transaction.amount >",
      expected: false,
      label: "Invalid: Missing operand",
    },
    { expr: "user.role ==", expected: false, label: "Invalid: Missing value" },
    { expr: "", expected: false, label: "Invalid: Empty expression" },
    {
      expr: "amount &&",
      expected: false,
      label: "Invalid: Incomplete logical",
    },
  ];

  const testValidation = async (testExpr = expression) => {
    setIsLoading(true);
    try {
      console.log("🧪 Testing expression:", testExpr);
      const validationResult = await spelValidationService.validateExpression(
        testExpr
      );
      console.log("🧪 Result:", validationResult);
      setResult({ expression: testExpr, ...validationResult });
    } catch (error) {
      console.error("🧪 Error:", error);
      setResult({ expression: testExpr, error: error.message, valid: false });
    } finally {
      setIsLoading(false);
    }
  };

  const testAllCases = async () => {
    setIsLoading(true);
    console.log("🧪 Testing all validation cases...");

    for (const testCase of testCases) {
      try {
        const result = await spelValidationService.validateExpression(
          testCase.expr
        );
        const passed = result.valid === testCase.expected;
        console.log(`🧪 ${testCase.label}:`);
        console.log(`   Expression: "${testCase.expr}"`);
        console.log(`   Expected: ${testCase.expected}, Got: ${result.valid}`);
        console.log(`   Status: ${passed ? "✅ PASS" : "❌ FAIL"}`);
        if (!passed) {
          console.error(`   🚨 VALIDATION BUG DETECTED!`);
        }
      } catch (error) {
        console.error(`🧪 Error testing "${testCase.expr}":`, error);
      }
    }

    setIsLoading(false);
    await testValidation(); // Test current expression
  };

  useEffect(() => {
    if (expression.trim()) {
      const validateCurrentExpression = async () => {
        setIsLoading(true);
        try {
          const validationResult =
            await spelValidationService.validateExpression(expression);
          setResult({ expression, ...validationResult });
        } catch (error) {
          setResult({ expression, error: error.message, valid: false });
        } finally {
          setIsLoading(false);
        }
      };

      const debounce = setTimeout(validateCurrentExpression, 300);
      return () => clearTimeout(debounce);
    }
  }, [expression]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom color="primary">
        🔍 SpEL Validation Service Debugger
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This tool tests the validation service directly to verify the bug fix is
        working. Check the browser console for detailed logs.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Individual Expression
            </Typography>

            <TextField
              fullWidth
              label="SpEL Expression"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Enter SpEL expression to test..."
            />

            <Button
              onClick={() => testValidation()}
              disabled={isLoading}
              variant="contained"
              sx={{ mb: 2, mr: 2 }}
            >
              {isLoading ? "Testing..." : "Test Expression"}
            </Button>

            <Button
              onClick={testAllCases}
              disabled={isLoading}
              variant="outlined"
              color="secondary"
              sx={{ mb: 2 }}
            >
              Test All Cases
            </Button>

            {result && (
              <Box>
                <Alert
                  severity={result.valid ? "success" : "error"}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2">
                    Status: {result.valid ? "✅ VALID" : "❌ INVALID"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Expression: &quot;{result.expression}&quot;
                  </Typography>
                  {result.error && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Error: {result.error}
                    </Typography>
                  )}
                </Alert>

                <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Raw Response:
                  </Typography>
                  <pre
                    style={{
                      fontSize: "12px",
                      overflow: "auto",
                      maxHeight: "200px",
                    }}
                  >
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Test Cases
            </Typography>

            <Box sx={{ mb: 2 }}>
              {testCases.map((testCase, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Chip
                      label={
                        testCase.expected
                          ? "Should be VALID"
                          : "Should be INVALID"
                      }
                      color={testCase.expected ? "success" : "error"}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">{testCase.label}</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={testCase.expr}
                    onClick={() => setExpression(testCase.expr)}
                    sx={{ cursor: "pointer", bgcolor: "grey.50" }}
                    placeholder="Click to test this expression"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ValidationDebugger;
