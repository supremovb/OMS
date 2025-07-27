import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme, // Import useTheme
  useMediaQuery, // Import useMediaQuery
  createTheme, // Import createTheme
  ThemeProvider, // Import ThemeProvider
  CssBaseline, // Import CssBaseline
  CircularProgress, // Already imported, just ensuring it's used correctly
  InputAdornment,
  Pagination
} from "@mui/material";
import AppSidebar from "./AppSidebar";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  PointOfSale as PointOfSaleIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Paid as PaidIcon,
  MoneyOff as MoneyOffIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
      // If you need a lighter shade, use error.light or define a custom color elsewhere
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px', // Slightly less rounded for text fields in dialogs
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
    MuiSelect: { // Add styles for Select component
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '24px', // Consistent rounded corners for dialogs
          boxShadow: '0 15px 45px rgba(0,0,0,0.15)', // Deeper shadow for dialogs
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5', // Light grey header for tables (hardcoded value)
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#212121', // Use a safe default or hardcoded value
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Rounded progress bar
          height: 8, // Thicker progress bar
          backgroundColor: '#eeeeee', // Use a safe default or hardcoded value
        },
        bar: {
          borderRadius: 4,
          backgroundColor: '#ef5350', // Use primary.main color directly
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Subtle shadow for avatars
        },
      },
    },
  },
});

interface PaymentRecord {
  id?: string;
  customerName: string;
  productName?: string;
  serviceName?: string;
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
  // Add for multi-product transactions:
  products?: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}

const peso = (v: number) => `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const SalesTransactionsPage: React.FC = () => {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const currentTheme = useTheme(); // Use currentTheme to access theme properties
  const isSm = useMediaQuery(currentTheme.breakpoints.down("sm"));
  const isMd = useMediaQuery(currentTheme.breakpoints.down("md"));


  // Filters
  const [searchCustomer, setSearchCustomer] = useState("");
  // Remove searchPlate
  // const [searchPlate, setSearchPlate] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "unpaid" | "voided">("");
  const [productFilter, setProductFilter] = useState<string>(""); // was serviceFilter
  const [dateFilter, setDateFilter] = useState<string>("");

  // Dialog states
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [voidTargetId, setVoidTargetId] = useState<string | null>(null);

  // For delete feature
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAll, setDeleteAll] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchRecords = async () => {
    setRefreshing(true);
    try {
      const snap = await getDocs(collection(db, "payments"));
      setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentRecord[]);
    } catch (error) {
      console.error("Error fetching records:", error);
      // In a real app, you might show a Snackbar here
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Unique products for filter dropdown (include both productName and serviceName for legacy support)
  const uniqueProducts = Array.from(
    new Set(
      records
        .map(r => r.productName || r.serviceName)
        .filter(Boolean)
    )
  );

  // Handler to void a transaction (show confirmation dialog)
  // FIX: Do NOT open transaction details dialog when voiding
  const handleVoidTransaction = (id: string) => {
    setVoidTargetId(id);
    setVoidDialogOpen(true);
  };

  const confirmVoidTransaction = async () => {
    if (!voidTargetId) return;
    setVoidingId(voidTargetId);
    setVoidDialogOpen(false);
    try {
      await updateDoc(doc(db, "payments", voidTargetId), {
        voided: true,
        paid: false, // A voided transaction is considered unpaid
      });
      await fetchRecords();
    } catch (error) {
      console.error("Failed to void transaction:", error);
      // Use a Snackbar for user feedback instead of alert
      // setSnackbar({ open: true, message: "Failed to void transaction.", severity: "error" });
    } finally {
      setVoidingId(null);
      setVoidTargetId(null);
    }
  };

  // Delete records (single or multiple)
  const handleDeleteRecords = (ids: string[], all: boolean = false) => {
    setSelectedIds(ids);
    setDeleteAll(all);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRecords = async () => {
    setDeleting(true);
    try {
      let idsToDelete: string[] = [];
      if (deleteAll) {
        idsToDelete = filteredRecords.filter(r => r.id).map(r => r.id!) as string[];
      } else {
        idsToDelete = selectedIds;
      }
      for (const id of idsToDelete) {
        await deleteDoc(doc(db, "payments", id));
      }
      await fetchRecords();
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to delete record(s):", error);
      // Use a Snackbar for user feedback instead of alert
      // setSnackbar({ open: true, message: "Failed to delete record(s).", severity: "error" });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Filtered records (sort by latest first)
  const filteredRecords = records
    .filter(r => {
      const customerMatch = r.customerName.toLowerCase().includes(searchCustomer.toLowerCase());
      // Remove plateMatch
      // const plateMatch = r.plateNumber?.toLowerCase().includes(searchPlate.toLowerCase());

      let statusMatch = true;
      if (statusFilter === "paid") {
        statusMatch = !!r.paid && !r.voided;
      } else if (statusFilter === "unpaid") {
        statusMatch = !r.paid && !r.voided;
      } else if (statusFilter === "voided") {
        statusMatch = !!r.voided;
      } else {
        statusMatch = true;
      }

      // Product filter: check both productName and serviceName for legacy/compatibility
      const productName = r.productName || r.serviceName || "";
      const productMatch = productFilter ? productName === productFilter : true;
      const dateMatch = dateFilter
        ? format(new Date(r.createdAt), 'yyyy-MM-dd') === dateFilter
        : true;

      return customerMatch && productMatch && dateMatch && statusMatch;
    })
    .sort((a, b) => b.createdAt - a.createdAt); // Sort by latest

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = filteredRecords.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page if filters change or filteredRecords shrink
  useEffect(() => {
    setPage(1);
  }, [searchCustomer, statusFilter, productFilter, dateFilter, records.length]);

  // Checkbox selection logic
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const allSelectableIds = filteredRecords.filter(r => r.id).map(r => r.id!) as string[];
  const allSelected = allSelectableIds.length > 0 && allSelectableIds.every(id => selectedIds.includes(id));

  // Get role from localStorage (default to 'cashier' for backward compatibility)
  const role = (localStorage.getItem("role") as "admin" | "cashier") || "cashier";

  // Calculate today's date string for comparison
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Quick stats
  const totalSales = role === "admin"
    ? records.filter(r => r.paid && !r.voided).reduce((sum, r) => sum + (typeof r.price === "number" ? r.price : 0), 0)
    : records.filter(r =>
        r.paid &&
        !r.voided &&
        format(new Date(r.createdAt), 'yyyy-MM-dd') === todayStr
      ).reduce((sum, r) => sum + (typeof r.price === "number" ? r.price : 0), 0);

  // Paid/unpaid counts: for cashier, only today's; for admin, all-time
  const paidCount = role === "admin"
    ? records.filter(r => r.paid && !r.voided).length
    : records.filter(r =>
        r.paid &&
        !r.voided &&
        format(new Date(r.createdAt), 'yyyy-MM-dd') === todayStr
      ).length;

  const unpaidCount = role === "admin"
    ? records.filter(r => !r.paid && !r.voided).length
    : records.filter(r =>
        !r.paid &&
        !r.voided &&
        format(new Date(r.createdAt), 'yyyy-MM-dd') === todayStr
      ).length;

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

  // Add row click handler to show details dialog
  // TableRow click handler: only open details dialog if not clicking the Void button
  const handleRowClick = (record: PaymentRecord, event?: React.MouseEvent) => {
    // If event exists and originated from a button, do nothing
    if (event && (event.target as HTMLElement).closest('button')) return;
    setSelectedRecord(record);
    setDetailsDialogOpen(true);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppSidebar role={role} onLogout={handleLogout}>
        <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1400, mx: "auto", width: "100%" }}>
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
                <Typography variant={isSm ? "h5" : "h3"} fontWeight={700} gutterBottom>
                  <PointOfSaleIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: isSm ? 30 : 40, color: "inherit" }} />
                  Sales Transactions
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  View and manage all payment transactions.
                </Typography>
              </Box>
              <Tooltip title="Refresh data">
                <Button
                  onClick={fetchRecords}
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
              </Tooltip>
            </Paper>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{
              display: "grid",
              gridTemplateColumns: isMd ? "repeat(auto-fit, minmax(220px, 1fr))" : "repeat(auto-fit, minmax(250px, 1fr))",
              gap: currentTheme.spacing(3),
              marginBottom: currentTheme.spacing(4),
              justifyContent: "center",
            }}
          >
            <motion.div variants={itemVariants}>
              <Card
                elevation={4}
                sx={{
                  borderLeft: `6px solid ${currentTheme.palette.success.main}`,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                  <Avatar sx={{ bgcolor: currentTheme.palette.success.light, mr: 0.5, width: 48, height: 48 }}>
                    <PaidIcon color="inherit" sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                      {role === "admin" ? "Total Sales (Paid)" : "Today's Sales"}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={currentTheme.palette.success.dark}>
                      {loading ? <CircularProgress size={24} /> : peso(totalSales)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role === "admin" ? "All time" : "Today"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card
                elevation={4}
                sx={{
                  flex: 1,
                  borderLeft: `6px solid ${currentTheme.palette.info.main}`,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                  <Avatar sx={{ bgcolor: currentTheme.palette.info.light, mr: 0.5, width: 48, height: 48 }}>
                    <AttachMoneyIcon color="inherit" sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                      Paid Transactions
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={currentTheme.palette.info.dark}>
                      {loading ? <CircularProgress size={24} /> : paidCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed payments
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card
                elevation={4}
                sx={{
                  flex: 1,
                  borderLeft: `6px solid ${currentTheme.palette.warning.main}`,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                  <Avatar sx={{ bgcolor: currentTheme.palette.warning.light, mr: 0.5, width: 48, height: 48 }}>
                    <MoneyOffIcon color="inherit" sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                      Unpaid Transactions
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={currentTheme.palette.warning.dark}>
                      {loading ? <CircularProgress size={24} /> : unpaidCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending payments
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters Section */}
          <motion.div variants={itemVariants}>
            <Paper elevation={4} sx={{ mb: 3, borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, bgcolor: "background.paper" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FilterIcon sx={{ mr: 1.5, fontSize: 28, color: "inherit" }} />
                <Typography variant="h6" fontWeight={700}>
                  Filters
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)"
                  },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Search Customer"
                  value={searchCustomer}
                  onChange={e => setSearchCustomer(e.target.value)}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ mr: 1, color: "inherit" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
                {/* Plate # search removed */}
                <Select
                  fullWidth
                  value={productFilter}
                  onChange={e => setProductFilter(e.target.value)}
                  size="medium"
                  displayEmpty
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Products</MenuItem>
                  {uniqueProducts.map(p => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
                <Select
                  fullWidth
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as "" | "paid" | "unpaid" | "voided")}
                  size="medium"
                  displayEmpty
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="voided">Voided</MenuItem>
                </Select>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  size="medium"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon fontSize="small" sx={{ mr: 1, color: "inherit" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Paper>
          </motion.div>

          {/* Transactions Table */}
          <motion.div variants={itemVariants}>
            <Card elevation={4} sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, bgcolor: "background.paper" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Transactions
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {filteredRecords.length} of {records.length} records
                  </Typography>
                  {/* Delete buttons for admin (moved here) */}
                  {role === "admin" && (
                    <>
                      <Tooltip title="Delete selected transactions">
                        <span>
                          <IconButton
                            color="error"
                            disabled={selectedIds.length === 0 || deleting}
                            onClick={() => handleDeleteRecords(selectedIds)}
                            sx={{
                              bgcolor: currentTheme.palette.error.main,
                              color: "#fff",
                              border: "2px solid #fff",
                              "&:hover": {
                                bgcolor: currentTheme.palette.error.dark,
                                color: "#fff",
                                border: "2px solid #fff",
                                boxShadow: 3,
                              },
                              transition: "all 0.15s"
                            }}
                          >
                            <DeleteIcon fontSize="small" sx={{ color: "#fff" }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete all filtered transactions">
                        <span>
                          <IconButton
                            color="error"
                            disabled={allSelectableIds.length === 0 || deleting}
                            onClick={() => handleDeleteRecords([], true)}
                            sx={{
                              bgcolor: currentTheme.palette.error.main,
                              color: "#fff",
                              border: "2px solid #fff",
                              "&:hover": {
                                bgcolor: currentTheme.palette.error.dark,
                                color: "#fff",
                                border: "2px solid #fff",
                                boxShadow: 3,
                              },
                              transition: "all 0.15s"
                            }}
                          >
                            <DeleteIcon fontSize="small" sx={{ color: "#fff" }} />
                            <Typography variant="caption" sx={{ ml: 0.5, color: "#fff", fontWeight: 600 }}>All</Typography>
                          </IconButton>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {refreshing && <LinearProgress sx={{ mb: 2 }} />}

              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "none", border: `1px solid ${currentTheme.palette.divider}` }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow sx={{ bgcolor: currentTheme.palette.grey[100] }}>
                      {role === "admin" && (
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedIds(allSelectableIds);
                              } else {
                                setSelectedIds([]);
                              }
                            }}
                            disabled={allSelectableIds.length === 0 || deleting}
                            style={{ cursor: allSelectableIds.length === 0 ? "not-allowed" : "pointer" }}
                          />
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      {role === "admin" && (
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={role === "admin" ? 9 : 8} align="center" sx={{ py: 5 }}>
                          <CircularProgress color="primary" />
                          <Typography sx={{ mt: 2, color: "text.secondary" }}>Loading Transactions...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={role === "admin" ? 9 : 8} align="center" sx={{ py: 4 }}>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <SearchIcon sx={{ fontSize: 40, color: "inherit", mb: 1 }} />
                            <Typography color="text.secondary">
                              No transactions found matching your criteria
                            </Typography>
                            <Button
                              variant="text"
                              size="small"
                              sx={{ mt: 1 }}
                              onClick={() => {
                                setSearchCustomer("");
                                // setSearchPlate("");
                                setStatusFilter("");
                                setProductFilter("");
                                setDateFilter("");
                              }}
                            >
                              Clear filters
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((r) => (
                        <TableRow
                          key={r.id}
                          hover
                          // FIX: Pass event to handleRowClick, so clicking Void does NOT open details
                          onClick={event => handleRowClick(r, event)}
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            bgcolor: r.voided ? currentTheme.palette.error.light : (r.paid ? "transparent" : currentTheme.palette.action.hover),
                            opacity: r.voided ? 0.7 : 1,
                            textDecoration: r.voided ? "line-through" : "none",
                            transition: "background-color 0.2s ease-in-out, opacity 0.2s ease-in-out",
                            cursor: "pointer"
                          }}
                        >
                          {role === "admin" && (
                            <TableCell padding="checkbox">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(r.id!)}
                                onChange={() => toggleSelect(r.id!)}
                                disabled={deleting}
                                style={{ cursor: deleting ? "not-allowed" : "pointer" }}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <Typography fontWeight={500}>{r.customerName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {r.cashierFullName || r.cashier}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {/* Show all products if multi-product, else fallback */}
                            {Array.isArray(r.products) && r.products.length > 0
                              ? r.products.map(p => p.productName).join(", ")
                              : (r.productName || r.serviceName || "-")}
                          </TableCell>
                          <TableCell>
                            {Array.isArray(r.products) && r.products.length > 0
                              ? r.products.map(p => p.quantity).join(", ")
                              : (r.quantity || 1)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={500}>
                              {peso(r.price)}
                            </Typography>
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
                          <TableCell>
                            <Typography>
                              {format(new Date(r.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(r.createdAt), 'hh:mm a')}
                            </Typography>
                          </TableCell>
                          {role === "admin" && (
                            <TableCell>
                              {!r.voided ? (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  disabled={!!voidingId}
                                  // FIX: Prevent event bubbling to row click
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleVoidTransaction(r.id!);
                                  }}
                                  sx={{ borderRadius: 2, fontWeight: 600 }}
                                >
                                  {voidingId === r.id ? "Voiding..." : "Void"}
                                </Button>
                              ) : (
                                <Typography variant="caption" color="error" fontWeight={600}>Voided</Typography>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination controls */}
              {!loading && filteredRecords.length > 0 && (
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
                    siblingCount={isSm ? 0 : 1}
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
            </Card>
          </motion.div>

          {/* Void Confirmation Dialog */}
          <Dialog open={voidDialogOpen} onClose={() => setVoidDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700, color: currentTheme.palette.error.dark }}>Void Transaction</DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
              <Typography sx={{ mt: 1, mb: 2, color: currentTheme.palette.text.secondary }}>
                Are you sure you want to void this transaction? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setVoidDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                onClick={confirmVoidTransaction}
                disabled={!!voidingId}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                {!!voidingId ? "Voiding..." : "Void"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700, color: currentTheme.palette.error.dark }}>Delete Transaction{deleteAll ? "s" : ""}</DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
              <Typography sx={{ mt: 1, mb: 2, color: currentTheme.palette.text.secondary }}>
                {deleteAll
                  ? `Are you sure you want to delete ALL ${filteredRecords.length} transactions in the current filtered list? This cannot be undone.`
                  : `Are you sure you want to delete the selected ${selectedIds.length} transaction(s)? This cannot be undone.`}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
              <Button
                color="error"
                variant="contained"
                onClick={confirmDeleteRecords}
                disabled={deleting}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Transaction Details Dialog */}
          <Dialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            scroll="paper"
          >
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogContent dividers sx={{ px: { xs: 1, sm: 3 } }}>
              {selectedRecord && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{
                    display: "flex",
                    flexDirection: isSm ? "column" : "row",
                    gap: 2,
                    flexWrap: "wrap"
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Customer Name</Typography>
                      <Typography>{selectedRecord.customerName}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                      <Typography>{format(new Date(selectedRecord.createdAt), 'MMM dd, yyyy hh:mm a')}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Cashier</Typography>
                      <Typography>
                        {selectedRecord.cashierFullName || selectedRecord.cashier}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  {/* Products Table */}
                  {Array.isArray(selectedRecord.products) && selectedRecord.products.length > 0 ? (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Products in this Transaction
                      </Typography>
                      <TableContainer component={Paper} sx={{ boxShadow: 0, mb: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product Name</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Unit Price</TableCell>
                              <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedRecord.products.map((prod, idx) => (
                              <TableRow key={prod.productId || idx}>
                                <TableCell>{prod.productName}</TableCell>
                                <TableCell align="right">{prod.quantity}</TableCell>
                                <TableCell align="right">{peso(prod.price)}</TableCell>
                                <TableCell align="right">{peso(prod.price * prod.quantity)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ) : (
                    // Single product/service fallback (legacy)
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Product</Typography>
                        <Typography>{selectedRecord.productName || selectedRecord.serviceName}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                        <Typography>{selectedRecord.quantity || 1}</Typography>
                      </Box>
                    </Box>
                  )}
                  <Divider />
                  <Box sx={{
                    display: "flex",
                    flexDirection: isSm ? "column" : "row",
                    gap: 2,
                    flexWrap: "wrap"
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Total Price</Typography>
                      <Typography>{peso(selectedRecord.price)}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      {selectedRecord.voided ? (
                        <Chip label="Voided" color="error" size="small" />
                      ) : (
                        <Chip
                          label={selectedRecord.paid ? "Paid" : "Unpaid"}
                          color={selectedRecord.paid ? "success" : "warning"}
                          size="small"
                        />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Payment Method</Typography>
                      <Typography>
                        {selectedRecord.paymentMethod
                          ? selectedRecord.paymentMethod.charAt(0).toUpperCase() + selectedRecord.paymentMethod.slice(1)
                          : "-"}
                      </Typography>
                    </Box>
                  </Box>
                  {selectedRecord.paid && (
                    <Box sx={{
                      display: "flex",
                      flexDirection: isSm ? "column" : "row",
                      gap: 2,
                      flexWrap: "wrap"
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Amount Tendered</Typography>
                        <Typography>
                          {typeof selectedRecord.amountTendered === "number"
                            ? peso(selectedRecord.amountTendered)
                            : "-"}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Change</Typography>
                        <Typography>
                          {typeof selectedRecord.change === "number"
                            ? peso(selectedRecord.change)
                            : "-"}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppSidebar>
    </ThemeProvider>
  );
};

export default SalesTransactionsPage;
