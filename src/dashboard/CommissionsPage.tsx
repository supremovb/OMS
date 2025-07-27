import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Select,
  MenuItem,
  InputAdornment,
  TextField,
  useTheme,
  useMediaQuery,
  Button,
  createTheme, // Import createTheme for consistency
  ThemeProvider, // Import ThemeProvider
  CssBaseline, // Import CssBaseline
  CircularProgress // For loading states
} from "@mui/material";
import AppSidebar from "./AppSidebar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { motion } from "framer-motion"; // Import motion for animations

// Custom Material-UI Theme for consistent styling (copied from other forms)
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif', // Using Inter as requested
    h3: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 800,
      letterSpacing: 1.5,
    },
    h4: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 800,
      letterSpacing: 1.5,
    },
    h5: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 700,
      letterSpacing: 1.2,
    },
    h6: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
    },
    button: {
      textTransform: 'none', // Keep button text as is
    },
  },
  palette: {
    primary: {
      main: '#ef5350', // Brighter red
      light: '#ff8a80',
      dark: '#d32f2f',
    },
    secondary: {
      main: '#424242', // Dark grey for contrast
    },
    background: {
      default: '#f0f2f5', // Light background
      paper: 'rgba(255,255,255,0.95)', // Slightly more opaque for glass effect
    },
    success: {
      main: '#4CAF50', // Green
      light: '#81C784',
      dark: '#2E7D32',
    },
    info: {
      main: '#2196F3', // Blue
      light: '#64B5F6',
      dark: '#1976D2',
    },
    warning: {
      main: '#FFC107', // Amber/Yellow
      light: '#FFD54F',
      dark: '#FF8F00',
    },
    error: { // Ensure error palette is defined for voided transactions
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '24px', // Consistent rounded corners for main paper elements
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)', // Consistent softer shadow
        },
      },
    },
    MuiCard: { // Not directly used in this file, but keeping for consistency
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          '&:hover': {
            boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px', // Consistent rounded corners for buttons
          textTransform: 'none',
          fontWeight: 700,
          letterSpacing: 0.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Rounded chips
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            '& fieldset': {
              borderColor: '#e0e0e0',
              transition: 'border-color 0.3s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: '#ffab91',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ef5350',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ef5350',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.8)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffab91',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ef5350',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiDialog: { // Not directly used in this file, but keeping for consistency
      styleOverrides: {
        paper: {
          borderRadius: '24px',
          boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey[100], // Light grey header for tables
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 700,
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiLinearProgress: { // Not directly used in this file, but keeping for consistency
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          height: 8,
          backgroundColor: theme.palette.grey[200],
        }),
        bar: ({ theme }) => ({
          borderRadius: 4,
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiAvatar: { // Not directly used in this file, but keeping for consistency
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface PaymentRecord {
  id?: string;
  employees: { id: string; name: string; commission: number }[];
  referrer?: { id: string; name: string; commission: number };
  createdAt: number;
  paid?: boolean;
  serviceName: string;
  price: number;
}

const peso = (v: number) => `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`; // Ensure 2 decimal places

const CommissionsPage: React.FC<{
  onLogout?: () => void;
  onProfile?: () => void;
  firstName?: string;
  lastName?: string;
}> = ({ onLogout, onProfile, firstName, lastName }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const currentTheme = useTheme(); // Use currentTheme to avoid conflict with imported 'theme'
  const isMobile = useMediaQuery(currentTheme.breakpoints.down("sm"));

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setRefreshing(true);
    try {
      const empSnap = await getDocs(collection(db, "employees"));
      setEmployees(empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Employee[]);
      const paySnap = await getDocs(collection(db, "payments"));
      setPayments(paySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentRecord[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      // In a real app, you might show a Snackbar here
    } finally {
      setRefreshing(false);
    }
  };

  // Filter payments by date range
  const filteredPayments = payments.filter(p => {
    if (!p.paid) return false; // Only consider paid transactions for commissions
    let match = true;
    if (dateFrom) {
      const from = new Date(dateFrom).setHours(0, 0, 0, 0);
      match = match && p.createdAt >= from;
    }
    if (dateTo) {
      const to = new Date(dateTo).setHours(23, 59, 59, 999);
      match = match && p.createdAt <= to;
    }
    return match;
  });

  // Aggregate commissions per employee (labor + referrer) for filteredPayments
  const commissionMap: {
    [empId: string]: {
      name: string;
      total: number;
      labor: number;
      referrer: number;
      count: number;
    };
  } = {};

  // Initialize commissionMap with all employees, even if they have no commissions yet
  employees.forEach(emp => {
    commissionMap[emp.id] = {
      name: `${emp.firstName} ${emp.lastName}`,
      total: 0,
      labor: 0,
      referrer: 0,
      count: 0
    };
  });

  filteredPayments.forEach((p) => {
    // Labor commissions
    if (Array.isArray(p.employees)) {
      p.employees.forEach(e => {
        if (commissionMap[e.id]) { // Ensure employee exists in the map
          commissionMap[e.id].labor += e.commission || 0;
          commissionMap[e.id].total += e.commission || 0;
          commissionMap[e.id].count += 1;
        } else {
          // Handle case where employee from payment record isn't in employees list (e.g., deleted employee)
          commissionMap[e.id] = {
            name: e.name, // Use name from payment record if employee not found
            total: e.commission || 0,
            labor: e.commission || 0,
            referrer: 0,
            count: 1
          };
        }
      });
    }
    // Referrer commission
    if (p.referrer && p.referrer.id) {
      if (commissionMap[p.referrer.id]) { // Ensure referrer exists in the map
        commissionMap[p.referrer.id].referrer += p.referrer.commission || 0;
        commissionMap[p.referrer.id].total += p.referrer.commission || 0;
        commissionMap[p.referrer.id].count += 1;
      } else {
        // Handle case where referrer from payment record isn't in employees list
        commissionMap[p.referrer.id] = {
          name: p.referrer.name, // Use name from payment record if referrer not found
          total: p.referrer.commission || 0,
          labor: 0,
          referrer: p.referrer.commission || 0,
          count: 1
        };
      }
    }
  });

  // Filter by search and sort
  const filtered = Object.entries(commissionMap)
    .filter(([_, v]) =>
      v.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b[1].total - a[1].total); // Sort by total commission descending

  // Stats
  const totalCommissions = filtered.reduce((sum, [_, v]) => sum + v.total, 0);

  // Framer Motion variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <ThemeProvider theme={theme}> {/* Apply the custom theme */}
      <CssBaseline /> {/* Apply base CSS for consistent styling */}
      <AppSidebar
        role={(localStorage.getItem("role") as "admin" | "cashier") || "cashier"}
        firstName={firstName}
        lastName={lastName}
        onLogout={onLogout}
        onProfile={onProfile}
      >
        <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1000, mx: "auto", width: "100%" }}>
          {/* Header Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2.5, sm: 4 },
                mb: 4,
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                borderRadius: 4,
                boxShadow: currentTheme.shadows[6],
                background: `linear-gradient(135deg, ${currentTheme.palette.primary.light} 0%, ${currentTheme.palette.primary.main} 100%)`,
                color: currentTheme.palette.primary.contrastText,
              }}
            >
              <Box>
                <Typography variant={isMobile ? "h5" : "h3"} fontWeight={700} gutterBottom>
                  <MonetizationOnIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: isMobile ? 30 : 40 }} />
                  Employee Commissions
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  View all labor and referrer commissions earned by employees.
                </Typography>
              </Box>
              <Button
                onClick={fetchAll}
                variant="contained"
                color="secondary"
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 600,
                  minWidth: 120,
                  px: 3,
                  py: 1.5,
                  alignSelf: { xs: "flex-end", sm: "center" },
                  boxShadow: currentTheme.shadows[3],
                  "&:hover": {
                    boxShadow: currentTheme.shadows[6],
                    transform: "translateY(-2px)",
                  },
                }}
                startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </Paper>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
              gap: currentTheme.spacing(3),
              marginBottom: currentTheme.spacing(4),
              justifyContent: "center",
            }}
          >
            <motion.div variants={itemVariants}>
              <Paper elevation={4} sx={{
                flex: 1, minWidth: 180, p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.info.main}`, // Changed to info for total
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <MonetizationOnIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Commissions</Typography>
                  {refreshing ? <CircularProgress size={24} /> : <Typography variant="h5" fontWeight={700}>{peso(totalCommissions)}</Typography>}
                </Box>
              </Paper>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Paper elevation={4} sx={{
                flex: 1, minWidth: 180, p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.success.main}`,
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <GroupIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Employees with Commissions</Typography>
                  {refreshing ? <CircularProgress size={24} /> : <Typography variant="h5" fontWeight={700}>{filtered.length}</Typography>}
                </Box>
              </Paper>
            </motion.div>
          </motion.div>

          {/* Filters Section */}
          <motion.div variants={itemVariants}>
            <Paper elevation={4} sx={{
              p: { xs: 2.5, sm: 3.5 },
              mb: 3,
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" }, // Flex direction changes for medium screens
              gap: 2,
              borderRadius: 3,
              boxShadow: currentTheme.shadows[2], // Lighter shadow for filter section
              bgcolor: "background.paper"
            }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: "flex", alignItems: "center", mb: { xs: 1, md: 0 } }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                Filter by Date & Employee
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                  label="From Date"
                  size="medium" // Changed to medium
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 160, borderRadius: 2 }}
                />
                <TextField
                  label="To Date"
                  size="medium" // Changed to medium
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 160, borderRadius: 2 }}
                />
                <TextField
                  label="Search Employee"
                  size="medium" // Changed to medium
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200, borderRadius: 2 }}
                />
              </Box>
            </Paper>
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants}>
            <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, boxShadow: currentTheme.shadows[4] }}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ bgcolor: currentTheme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Total Commission</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Labor Commission</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Referrer Commission</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>No. of Transactions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {refreshing ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <CircularProgress color="primary" />
                        <Typography sx={{ mt: 2, color: "text.secondary" }}>Loading Commissions...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                          No commissions found for the selected criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(([empId, v]) => (
                      <TableRow key={empId} hover sx={{ transition: "background 0.2s", "&:hover": { bgcolor: currentTheme.palette.action.hover } }}>
                        <TableCell>
                          <Typography fontWeight={600}>{v.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={peso(v.total)}
                            color="primary"
                            sx={{ fontWeight: 600, fontSize: isMobile ? 14 : 16, px: isMobile ? 1 : 2, py: isMobile ? 0.5 : 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={peso(v.labor)}
                            color="success"
                            sx={{ fontWeight: 600, fontSize: isMobile ? 14 : 16, px: isMobile ? 1 : 2, py: isMobile ? 0.5 : 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={peso(v.referrer)}
                            color="info"
                            sx={{ fontWeight: 600, fontSize: isMobile ? 14 : 16, px: isMobile ? 1 : 2, py: isMobile ? 0.5 : 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{v.count}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        </Box>
      </AppSidebar>
    </ThemeProvider>
  );
};

export default CommissionsPage;
