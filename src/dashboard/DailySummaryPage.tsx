import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  createTheme, // Import createTheme for consistency
  ThemeProvider, // Import ThemeProvider
  CssBaseline, // Import CssBaseline
  CircularProgress, // For loading states
  Pagination,
  Select,
  MenuItem
} from "@mui/material";
import AppSidebar from "./AppSidebar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
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
    MuiCard: {
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
    MuiTextField: { // Keeping for consistency, though not directly used here
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
    MuiSelect: { // Keeping for consistency, though not directly used here
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
    MuiDialog: { // Keeping for consistency, though not directly used here
      styleOverrides: {
        paper: {
          borderRadius: '24px',
          boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5', // Light grey header for tables
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#212121',
        },
      },
    },
    MuiLinearProgress: { // Keeping for consistency, though not directly used here
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: '#eeeeee',
        },
        bar: {
          borderRadius: 4,
          backgroundColor: '#ef5350',
        },
      },
    },
    MuiAvatar: { // Keeping for consistency, though not directly used here
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

interface PaymentRecord {
  id?: string;
  customerName: string;
  productName?: string; // For product sales
  serviceName?: string; // For service sales
  price: number;
  quantity?: number;
  cashier: string;
  cashierFullName?: string;
  createdAt: number;
  paid?: boolean;
  paymentMethod?: string;
  amountTendered?: number;
  change?: number;
  voided?: boolean;
  products?: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}

const peso = (v: number) => `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const DailySummaryPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const currentTheme = useTheme(); // Use currentTheme to avoid conflict with imported 'theme'
  const isMobile = useMediaQuery(currentTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Get role from localStorage (default to 'cashier')
  const role = (localStorage.getItem("role") as "admin" | "cashier") || "cashier";

  // Pagination state for today's transactions
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "payments"));
      setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentRecord[]);
    } catch (error) {
      console.error("Error fetching payments:", error);
      // In a real app, you might show a Snackbar here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Today's range
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();

  const todaysPayments = payments.filter(
    p => p.createdAt >= startOfDay && p.createdAt <= endOfDay
  );
  const todaysPaid = todaysPayments.filter(p => p.paid && !p.voided); // Exclude voided from paid
  const todaysUnpaid = todaysPayments.filter(p => !p.paid && !p.voided); // Exclude voided from unpaid
  const todaySales = todaysPaid.reduce((sum, p) => sum + (typeof p.price === "number" ? p.price : 0), 0);
  const todaysVoided = todaysPayments.filter(p => p.voided); // Count voided transactions

  // Sales by product/service
  const serviceSales: { [name: string]: number } = {};
  todaysPaid.forEach(p => {
    if (Array.isArray(p.products) && p.products.length > 0) {
      p.products.forEach(prod => {
        if (prod.productName) {
          serviceSales[prod.productName] = (serviceSales[prod.productName] || 0) + (prod.price * prod.quantity);
        }
      });
    } else {
      const name = getProductOrService(p);
      if (name) {
        serviceSales[name] = (serviceSales[name] || 0) + p.price;
      }
    }
  });

  // Payment method breakdown
  const paymentMethodCount: { [method: string]: number } = {};
  todaysPaid.forEach(p => {
    const method = p.paymentMethod || "Other";
    paymentMethodCount[method] = (paymentMethodCount[method] || 0) + 1;
  });

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

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

  // Sort today's payments by latest first
  const todaysPaymentsSorted = [...todaysPayments].sort((a, b) => b.createdAt - a.createdAt);

  // Pagination logic
  const totalPages = Math.ceil(todaysPaymentsSorted.length / rowsPerPage);
  const paginatedPayments = todaysPaymentsSorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page if today's payments change
  React.useEffect(() => {
    setPage(1);
  }, [todaysPayments.length, rowsPerPage]);

  // For admin: show total sales; for cashier: show only today's sales
  const totalSales = role === "admin"
    ? payments.filter(p => p.paid && !p.voided).reduce((sum, p) => sum + (typeof p.price === "number" ? p.price : 0), 0)
    : todaySales;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppSidebar role={role} onLogout={handleLogout}>
        <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1100, mx: "auto", width: "100%" }}>
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
                background: `linear-gradient(135deg, ${currentTheme.palette.info.light} 0%, ${currentTheme.palette.info.main} 100%)`, // Changed to info gradient
                color: currentTheme.palette.primary.contrastText, // White text
              }}
            >
              <Box>
                <Typography variant={isMobile ? "h5" : "h3"} fontWeight={700} gutterBottom>
                  <ReceiptIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: isMobile ? 30 : 40 }} />
                  Daily Summary
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Overview of today's sales and transactions.
                </Typography>
              </Box>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchPayments} // Call fetchPayments to refresh data
                  color="inherit" // Inherit color for contrast on gradient
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 600,
                    minWidth: 44,
                    px: 2,
                    py: 1,
                    alignSelf: { xs: "flex-end", sm: "center" },
                    boxShadow: currentTheme.shadows[3],
                    "&:hover": {
                      boxShadow: currentTheme.shadows[6],
                      transform: "translateY(-2px)",
                      bgcolor: "rgba(255,255,255,0.2)", // Subtle hover effect
                    },
                    "&:disabled": {
                      opacity: 0.7,
                      cursor: "not-allowed",
                    }
                  }}
                  disabled={loading} // Disable while loading
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Paper>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
              gap: currentTheme.spacing(3),
              marginBottom: currentTheme.spacing(4),
              justifyContent: "center",
            }}
          >
            <motion.div variants={itemVariants}>
              <Card elevation={4} sx={{
                flex: "1 1 220px", minWidth: 220,
                borderLeft: `6px solid ${currentTheme.palette.success.main}`,
                borderRadius: 3, bgcolor: "background.paper",
              }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                  <MonetizationOnIcon color="success" sx={{ fontSize: 40 }} /> {/* Larger icon */}
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                      {role === "admin" ? "Total Sales (Paid)" : "Today's Sales"}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={currentTheme.palette.success.dark}>
                      {loading ? <Skeleton width={100} /> : peso(totalSales)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card elevation={4} sx={{
                flex: "1 1 220px", minWidth: 220,
                borderLeft: `6px solid ${currentTheme.palette.info.main}`,
                borderRadius: 3, bgcolor: "background.paper",
              }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                  <CheckCircleIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                      Paid Transactions
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={currentTheme.palette.info.dark}>
                      {loading ? <Skeleton width={60} /> : todaysPaid.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card elevation={4} sx={{
                flex: "1 1 220px", minWidth: 220,
                borderLeft: `6px solid ${currentTheme.palette.warning.main}`,
                borderRadius: 3, bgcolor: "background.paper",
              }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                  <HourglassEmptyIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                      Unpaid Transactions
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={currentTheme.palette.warning.dark}>
                      {loading ? <Skeleton width={60} /> : todaysUnpaid.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card elevation={4} sx={{
                flex: "1 1 220px", minWidth: 220,
                borderLeft: `6px solid ${currentTheme.palette.error.main}`, // New card for voided
                borderRadius: 3, bgcolor: "background.paper",
              }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                  <ReceiptIcon color="error" sx={{ fontSize: 40 }} /> {/* Using ReceiptIcon for voided */}
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                      Voided Transactions
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={currentTheme.palette.error.dark}>
                      {loading ? <Skeleton width={60} /> : todaysVoided.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Sales by Product/Service */}
          <motion.div variants={itemVariants}>
            <Card elevation={4} sx={{ mb: 3, borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, bgcolor: "background.paper" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  <MonetizationOnIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                  Sales by Product/Service
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {loading ? (
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                  </Box>
                ) : Object.keys(serviceSales).length === 0 ? (
                  <Typography color="text.secondary">No paid sales today.</Typography>
                ) : (
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {Object.entries(serviceSales).map(([name, total]) => (
                      <Chip
                        key={name}
                        label={`${name}: ${peso(total)}`}
                        color="primary"
                        sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Method Breakdown */}
          <motion.div variants={itemVariants}>
            <Card elevation={4} sx={{ mb: 3, borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, bgcolor: "background.paper" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  <PaymentIcon color="secondary" sx={{ mr: 1.5, fontSize: 28 }} />
                  Payment Methods
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {loading ? (
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 2 }} />
                  </Box>
                ) : Object.keys(paymentMethodCount).length === 0 ? (
                  <Typography color="text.secondary">No paid transactions today.</Typography>
                ) : (
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {Object.entries(paymentMethodCount).map(([method, count]) => (
                      <Chip
                        key={method}
                        label={`${method.charAt(0).toUpperCase() + method.slice(1)}: ${count}`}
                        color="secondary"
                        icon={<PaymentIcon />}
                        sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Table of Today's Transactions */}
          <motion.div variants={itemVariants}>
            <Card elevation={4} sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, bgcolor: "background.paper" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Today's Transactions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: currentTheme.shadows[1] }}>
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ bgcolor: currentTheme.palette.grey[100] }}>
                        <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Product/Service</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                            <CircularProgress color="primary" />
                            <Typography sx={{ mt: 2, color: "text.secondary" }}>Loading Transactions...</Typography>
                          </TableCell>
                        </TableRow>
                      ) : todaysPaymentsSorted.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary" sx={{ py: 3 }}>
                              No transactions today.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                      paginatedPayments.map((r) =>
                        Array.isArray(r.products) && r.products.length > 0 ? (
                          <React.Fragment key={r.id}>
                            {r.products.map((prod, idx) => (
                              <TableRow
                                key={r.id + "-" + (prod.productId || idx)}
                                hover
                                sx={{
                                  '&:last-child td': { borderBottom: 0 },
                                  bgcolor: r.voided ? currentTheme.palette.error.light : (r.paid ? "transparent" : currentTheme.palette.action.hover),
                                  opacity: r.voided ? 0.7 : 1,
                                  textDecoration: r.voided ? "line-through" : "none",
                                  transition: "background-color 0.2s ease-in-out, opacity 0.2s ease-in-out",
                                }}
                              >
                                <TableCell>
                                  <Typography fontWeight={600}>{r.customerName}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {r.cashierFullName || r.cashier}
                                  </Typography>
                                </TableCell>
                                <TableCell>{prod.productName}</TableCell>
                                <TableCell>{prod.quantity}</TableCell>
                                <TableCell>
                                  <Typography fontWeight={500}>{peso(prod.price * prod.quantity)}</Typography>
                                </TableCell>
                                <TableCell>
                                  {r.voided ? (
                                    <Chip label="Voided" color="error" size="small" sx={{ fontWeight: 600 }} />
                                  ) : (
                                    <Chip
                                      label={r.paid ? "Paid" : "Unpaid"}
                                      color={r.paid ? "success" : "warning"}
                                      size="small"
                                      variant={r.paid ? "filled" : "outlined"}
                                      sx={{ fontWeight: 600 }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {r.paymentMethod ? (
                                    <Chip
                                      label={r.paymentMethod.charAt(0).toUpperCase() + r.paymentMethod.slice(1)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontWeight: 600 }}
                                    />
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell sx={{ minWidth: 120 }}>
                                  <Typography>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        ) : (
                          <TableRow
                            key={r.id}
                            hover
                            sx={{
                              '&:last-child td': { borderBottom: 0 },
                              bgcolor: r.voided ? currentTheme.palette.error.light : (r.paid ? "transparent" : currentTheme.palette.action.hover),
                              opacity: r.voided ? 0.7 : 1,
                              textDecoration: r.voided ? "line-through" : "none",
                              transition: "background-color 0.2s ease-in-out, opacity 0.2s ease-in-out",
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight={600}>{r.customerName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {r.cashierFullName || r.cashier}
                              </Typography>
                            </TableCell>
                            <TableCell>{getProductOrService(r)}</TableCell>
                            <TableCell>{r.quantity || 1}</TableCell>
                            <TableCell>
                              <Typography fontWeight={500}>{peso(r.price)}</Typography>
                            </TableCell>
                            <TableCell>
                              {r.voided ? (
                                <Chip label="Voided" color="error" size="small" sx={{ fontWeight: 600 }} />
                              ) : (
                                <Chip
                                  label={r.paid ? "Paid" : "Unpaid"}
                                  color={r.paid ? "success" : "warning"}
                                  size="small"
                                  variant={r.paid ? "filled" : "outlined"}
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {r.paymentMethod ? (
                                <Chip
                                  label={r.paymentMethod.charAt(0).toUpperCase() + r.paymentMethod.slice(1)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell sx={{ minWidth: 120 }}>
                              <Typography>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Pagination controls */}
                {!loading && todaysPaymentsSorted.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      justifyContent: "space-between",
                      mt: 2,
                      gap: 2
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Rows per page:
                      </Typography>
                      <Select
                        size="small"
                        value={rowsPerPage}
                        onChange={e => {
                          setRowsPerPage(Number(e.target.value));
                          setPage(1);
                        }}
                        sx={{ width: 80, borderRadius: 2, fontWeight: 500 }}
                      >
                        {[5, 10, 20, 50, 100].map(n => (
                          <MenuItem key={n} value={n}>{n}</MenuItem>
                        ))}
                      </Select>
                    </Box>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                      shape="rounded"
                      showFirstButton
                      showLastButton
                      siblingCount={isMobile ? 0 : 1}
                      boundaryCount={1}
                      sx={{
                        mx: "auto",
                        "& .MuiPaginationItem-root": {
                          borderRadius: 2,
                          fontWeight: 600,
                          minWidth: 36,
                          minHeight: 36,
                        }
                      }}
                    />
                    <Box sx={{ minWidth: 120, textAlign: { xs: "left", sm: "right" } }}>
                      <Typography variant="body2" color="text.secondary">
                        Page {page} of {totalPages}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </AppSidebar>
    </ThemeProvider>
  );
};

export default DailySummaryPage;

function getProductOrService(p: PaymentRecord) {
  // Show all products if multi-product, else fallback to productName/serviceName
  if (Array.isArray(p.products) && p.products.length > 0) {
    return p.products.map(prod => prod.productName).join(", ");
  }
  if (p.productName) return p.productName;
  if (p.serviceName) return p.serviceName;
  return "N/A";
}

