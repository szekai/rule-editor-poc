import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  AccountTree as TreeIcon,
  Approval as ApprovalIcon,
} from "@mui/icons-material";

import RuleSetEditor from "./RuleSetEditor";
import SpelRuleEditor from "./SpelRuleEditor";
import MakerCheckerTable from "./MakerCheckerTable";
import ValidationDebugger from "./ValidationDebugger";

// Create theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Box sx={{ flexGrow: 1 }}>
          {/* App Bar */}
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                SpEL Rule Editor & Rule Set Builder - POC
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                v1.0.0
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Navigation Tabs */}
          <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Paper elevation={1}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="rule editor tabs"
                sx={{ borderBottom: 1, borderColor: "divider" }}
              >
                <Tab
                  icon={<EditIcon />}
                  label="Rule Editor"
                  iconPosition="start"
                  sx={{ minHeight: 60 }}
                />
                <Tab
                  icon={<TreeIcon />}
                  label="Rule Set Composer"
                  iconPosition="start"
                  sx={{ minHeight: 60 }}
                />
                <Tab
                  icon={<ApprovalIcon />}
                  label="Maker/Checker"
                  iconPosition="start"
                  sx={{ minHeight: 60 }}
                />
                <Tab
                  label="Debug Validation"
                  iconPosition="start"
                  sx={{ minHeight: 60 }}
                />
              </Tabs>

              {/* Tab Content */}
              <TabPanel value={tabValue} index={0}>
                <SpelRuleEditor />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <RuleSetEditor />
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <MakerCheckerTable />
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <ValidationDebugger />
              </TabPanel>
            </Paper>
          </Container>

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              mt: 4,
              py: 2,
              textAlign: "center",
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Container maxWidth="xl">
              <Typography variant="body2" color="text.secondary">
                SpEL Rule Editor POC - Built with React, MUI, Monaco Editor, and
                React DnD
              </Typography>
            </Container>
          </Box>
        </Box>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
