import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Paper, Button, MenuItem, Select, Divider, Stack,
  Card, CardContent, CircularProgress, Tooltip, IconButton,
  useTheme, useMediaQuery, createTheme, ThemeProvider, CssBaseline,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField,
} from "@mui/material";
import { Assessment, GridOn, Download, Refresh as RefreshIcon } from "@mui/icons-material"; // Added RefreshIcon
import AppSidebar from "./AppSidebar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

// Custom Material-UI Theme for consistent styling
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif',
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
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: '#ef5350',
      light: '#ff8a80',
      dark: '#d32f2f',
    },
    secondary: {
      main: '#424242',
    },
    background: {
      default: '#f0f2f5',
      paper: 'rgba(255,255,255,0.95)',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#2E7D32',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    warning: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#FF8F00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
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
          borderRadius: '16px',
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
          borderRadius: '12px',
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
    MuiDialog: {
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
          backgroundColor: '#f5f5f5', // Use a hardcoded color instead of theme.palette.grey[100]
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#212121', // Use a hardcoded color instead of theme.palette.text.primary
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: '#eeeeee', // Use a hardcoded color instead of theme.palette.grey[200]
        },
        bar: {
          borderRadius: 4,
          backgroundColor: '#ef5350', // Use a hardcoded color instead of theme.palette.primary.main
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const peso = (v: number) => `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const REPORT_TYPES = [
  { key: "sales", label: "Sales Report", icon: "📈" },
  { key: "products", label: "Products Sold", icon: "🛒" }
  // Remove chemicals
];

const REPORT_RANGE_TYPES = [
  { key: "monthly", label: "Monthly" },
  { key: "weekly", label: "Weekly" },
  { key: "daily", label: "Daily" },
  { key: "custom", label: "Custom Range" }
];

const SHOP_NAME = "OPENG MILITARY SUPPLIES"; // Updated shop name

interface ReportData {
  salesByMonth: { [month: string]: number };
  productCount: { [productName: string]: number };
  // Remove chemicalUsage
}

export default function ReportsAnalyticsPage(props: any) {
  const { onLogout, onProfile, firstName, lastName } = props;
  const [payments, setPayments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [reportType, setReportType] = useState<"sales" | "products">("sales");
  const [reportRangeType, setReportRangeType] = useState<"monthly" | "weekly" | "daily" | "custom">("monthly");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const currentTheme = useTheme(); // Use useTheme hook
  const isMobile = useMediaQuery(currentTheme.breakpoints.down('sm'));

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [paymentsSnap, servicesSnap] = await Promise.all([
        getDocs(collection(db, "payments")),
        getDocs(collection(db, "services")),
      ]);
      setPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
      // In a real app, you might show a Snackbar here
    } finally {
      setLoading(false);
    }
  };

  // Helper: get start/end for current week
  function getWeekRange(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday.getTime(), end: sunday.getTime() };
  }

  // Helper: get start/end for current day
  function getDayRange(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const start = d.getTime();
    d.setHours(23, 59, 59, 999);
    const end = d.getTime();
    return { start, end };
  }

  // Helper: get start/end for custom range
  function getCustomRange() {
    if (!customFrom || !customTo) return null;
    const start = new Date(customFrom).setHours(0, 0, 0, 0);
    const end = new Date(customTo).setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Filter payments by selected range
  function filterPaymentsByRange(payments: any[]) {
    if (reportRangeType === "monthly") {
      return payments; // handled in grouping
    }
    if (reportRangeType === "weekly") {
      const { start, end } = getWeekRange(new Date());
      return payments.filter(p => p.createdAt >= start && p.createdAt <= end);
    }
    if (reportRangeType === "daily") {
      const { start, end } = getDayRange(new Date());
      return payments.filter(p => p.createdAt >= start && p.createdAt <= end);
    }
    if (reportRangeType === "custom") {
      const range = getCustomRange();
      if (!range) return [];
      return payments.filter(p => p.createdAt >= range.start && p.createdAt <= range.end);
    }
    return payments;
  }

  // Data processing
  const now = new Date();
  const generatedDate = now.toLocaleString();

  // Process data for reports
  const processReportData = (): ReportData => {
    const paidPayments = payments.filter(p => p.paid && !p.voided);
    const filtered = filterPaymentsByRange(paidPayments);

    // Sales by month/week/day/custom
    let salesByMonth: { [month: string]: number } = {};
    if (reportRangeType === "monthly") {
      paidPayments.forEach(p => {
        const d = new Date(p.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        salesByMonth[key] = (salesByMonth[key] || 0) + (typeof p.price === "number" ? p.price : 0);
      });
    } else {
      filtered.forEach(p => {
        const d = new Date(p.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        salesByMonth[key] = (salesByMonth[key] || 0) + (typeof p.price === "number" ? p.price : 0);
      });
    }

    // Products sold
    const productCount: { [productName: string]: number } = {};
    filtered.forEach(p => {
      if (Array.isArray(p.products) && p.products.length > 0) {
        p.products.forEach((prod: { productName: string; quantity: number }) => {
          if (prod.productName) {
            productCount[prod.productName] = (productCount[prod.productName] || 0) + prod.quantity;
          }
        });
      } else if (p.productName) {
        productCount[p.productName] = (productCount[p.productName] || 0) + (p.quantity || 1);
      }
    });

    return { salesByMonth, productCount };
  };

  const { salesByMonth, productCount } = processReportData();

  const chartTitle = REPORT_TYPES.find(t => t.key === reportType)?.label || "Report";

  // Generate Excel report
  const generateExcel = async () => {
    const wb = XLSX.utils.book_new();
    let data: any[][] = [];
    let headers: string[] = [];
    
    if (reportType === "sales") {
      headers = ["Month/Day", "Sales"];
      data = Object.entries(salesByMonth).map(([month, sales]) => [month, sales]);
    } else if (reportType === "products") {
      headers = ["Product", "Quantity Sold"];
      data = Object.entries(productCount).map(([product, count]) => [product, count]);
    }
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    XLSX.utils.book_append_sheet(wb, ws, chartTitle);
    XLSX.writeFile(wb, `${chartTitle.replace(/\s+/g, '_')}_${now.getTime()}.xlsx`);
  };

  // Print handler
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${SHOP_NAME} - ${chartTitle}</title>
          <style>
            body { font-family: "Inter", sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .shop-title { font-size: 28px; font-weight: bold; margin-bottom: 8px; color: ${currentTheme.palette.primary.dark}; }
            .report-title { font-size: 22px; font-weight: 600; margin-bottom: 5px; color: ${currentTheme.palette.secondary.main}; }
            .generated { font-size: 14px; color: #777; margin-bottom: 15px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; border-radius: 8px; overflow: hidden; }
            th, td { border: 1px solid #e0e0e0; padding: 12px 15px; text-align: left; }
            th { background-color: ${currentTheme.palette.primary.main}; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8f8f8; }
            .footer { margin-top: 30px; text-align: right; font-size: 14px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-title">${SHOP_NAME}</div>
            <div class="report-title">${chartTitle}</div>
            <div class="generated">Generated: ${generatedDate}</div>
          </div>
          ${getPrintableTable()}
          <div class="footer">Page 1</div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  function getPrintableTable() {
    let tableContent = '';
    if (reportType === "sales") {
      tableContent = `
        <thead>
          <tr><th>Month/Day</th><th>Sales</th></tr>
        </thead>
        <tbody>
          ${Object.entries(salesByMonth)
            .map(([month, sales]) => `<tr><td>${month}</td><td>${peso(sales)}</td></tr>`)
            .join("")}
        </tbody>
      `;
    } else if (reportType === "products") {
      tableContent = `
        <thead>
          <tr><th>Product</th><th>Quantity Sold</th></tr>
        </thead>
        <tbody>
          ${Object.entries(productCount)
            .map(([product, count]) => `<tr><td>${product}</td><td>${count}</td></tr>`)
            .join("")}
        </tbody>
      `;
    }
    return `<table style="width: 100%; border-collapse: collapse;">${tableContent}</table>`;
  }

  // Framer Motion variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.2 } },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppSidebar
        role="admin"
        onLogout={onLogout}
        onProfile={onProfile}
        firstName={firstName}
        lastName={lastName}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header Section */}
          <Paper 
            component={motion.div}
            initial="hidden"
            animate="visible"
            variants={headerVariants}
            elevation={4}
            sx={{ 
              p: { xs: 2.5, sm: 4 },
              mb: 4, 
              borderRadius: 4,
              background: `linear-gradient(135deg, ${currentTheme.palette.info.light} 0%, ${currentTheme.palette.info.main} 100%)`,
              color: currentTheme.palette.info.contrastText,
              boxShadow: currentTheme.shadows[6],
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant={isMobile ? "h5" : "h3"} fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }} gutterBottom>
                <Assessment sx={{ mr: 1.5, fontSize: isMobile ? 30 : 40 }} />
                Reports & Analytics
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Generate detailed reports for business insights.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              sx={{
                width: { xs: '100%', sm: 'auto' },
                flexWrap: "wrap",
                gap: 2,
                // Ensure custom range fields are aligned and not overlapping
                '& .custom-range-fields': {
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  minWidth: 0,
                }
              }}
            >
              {/* Report Range Type Selector */}
              <Select
                value={reportRangeType}
                onChange={e => setReportRangeType(e.target.value as any)}
                size="medium"
                variant="outlined"
                sx={{
                  minWidth: 160,
                  background: currentTheme.palette.background.paper,
                  borderRadius: 2,
                  color: currentTheme.palette.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.palette.grey[300],
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.palette.primary.light,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.palette.primary.main,
                  },
                }}
              >
                {REPORT_RANGE_TYPES.map(t => (
                  <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>
                ))}
              </Select>
              {/* Custom Range Date Pickers */}
              {reportRangeType === "custom" && (
                <Box
                  className="custom-range-fields"
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    flexWrap: "wrap",
                    minWidth: 0,
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <TextField
                    type="date"
                    label="From"
                    size="small"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 140,
                      maxWidth: 180,
                    }}
                  />
                  <TextField
                    type="date"
                    label="To"
                    size="small"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 140,
                      maxWidth: 180,
                    }}
                  />
                </Box>
              )}
              {/* Report Type Selector */}
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                size="medium"
                variant="outlined"
                sx={{
                  minWidth: 180,
                  background: currentTheme.palette.background.paper,
                  borderRadius: 2,
                  color: currentTheme.palette.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.palette.grey[300],
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.palette.primary.light,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.palette.primary.main,
                  },
                }}
              >
                {REPORT_TYPES.map(t => (
                  <MenuItem key={t.key} value={t.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{t.icon}</span>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Download />}
                onClick={handlePrint}
                sx={{
                  textTransform: 'none',
                  py: 1.5,
                  px: 3,
                  borderRadius: 2.5,
                  boxShadow: currentTheme.shadows[3],
                  "&:hover": {
                    boxShadow: currentTheme.shadows[6],
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Print Report
              </Button>
            </Stack>
          </Paper>
          {/* Export Button */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={headerVariants} // Using headerVariants for this too
            style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: currentTheme.spacing(3) }}
          >
            <Tooltip title="Export to Excel">
              <IconButton
                onClick={generateExcel}
                color="success"
                sx={{ 
                  bgcolor: currentTheme.palette.success.light, 
                  color: currentTheme.palette.success.dark,
                  p: 1.5, // Larger touch target
                  borderRadius: '50%', // Circular button
                  boxShadow: currentTheme.shadows[2],
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { 
                    bgcolor: currentTheme.palette.success.main, 
                    color: currentTheme.palette.common.white,
                    boxShadow: currentTheme.shadows[4],
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': {
                    opacity: 0.7,
                    cursor: 'not-allowed',
                  }
                }}
                disabled={loading} // Disable if data is loading
              >
                <GridOn sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={fetchAll}
                color="primary"
                sx={{ 
                  ml: 2, // Margin to separate from Excel button
                  bgcolor: currentTheme.palette.primary.light, 
                  color: currentTheme.palette.primary.dark,
                  p: 1.5, 
                  borderRadius: '50%', 
                  boxShadow: currentTheme.shadows[2],
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { 
                    bgcolor: currentTheme.palette.primary.main, 
                    color: currentTheme.palette.common.white,
                    boxShadow: currentTheme.shadows[4],
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': {
                    opacity: 0.7,
                    cursor: 'not-allowed',
                  }
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon sx={{ fontSize: 28 }} />}
              </IconButton>
            </Tooltip>
          </motion.div>

          {/* Report Content */}
          <Box ref={printRef}>
            {/* Use motion(Card) for animation */}
            {/*
              You need to import motion from framer-motion:
              import { motion } from "framer-motion";
            */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={contentVariants}
            >
              <Card
                elevation={4} // Stronger shadow
                sx={{
                  borderRadius: 3,
                  boxShadow: currentTheme.shadows[4], // Consistent shadow
                  mb: 3,
                  bgcolor: "background.paper",
                  p: { xs: 2, sm: 4 }, // Responsive padding
                }}
              >
              <CardContent sx={{ p: 0 }}> {/* Remove default CardContent padding */}
                {/* Report Header (inside printable area) */}
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                    {SHOP_NAME}
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="secondary">
                    {chartTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Generated: {generatedDate}
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                {/* Report Content Tables */}
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress color="primary" />
                    <Typography sx={{ mt: 2, ml: 2, color: "text.secondary" }}>Loading Report Data...</Typography>
                  </Box>
                ) : (
                  <>
                    {reportType === "sales" && (
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                          Sales Report
                        </Typography>
                        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, overflowX: 'auto' }}>
                          <Table size={isMobile ? "small" : "medium"}>
                            <TableHead>
                              <TableRow sx={{ bgcolor: currentTheme.palette.grey[100] }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Month/Day</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Sales</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(salesByMonth).length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={2} align="center" sx={{ py: 3, fontStyle: 'italic', color: 'text.secondary' }}>No sales data available.</TableCell>
                                </TableRow>
                              ) : (
                                Object.entries(salesByMonth).map(([month, sales]) => (
                                  <TableRow key={month} hover>
                                    <TableCell>{month}</TableCell>
                                    <TableCell>{peso(sales)}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    {reportType === "products" && (
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                          Products Sold Report
                        </Typography>
                        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, overflowX: 'auto' }}>
                          <Table size={isMobile ? "small" : "medium"}>
                            <TableHead>
                              <TableRow sx={{ bgcolor: currentTheme.palette.grey[100] }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Product</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Quantity Sold</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(productCount).length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={2} align="center" sx={{ py: 3, fontStyle: 'italic', color: 'text.secondary' }}>No product sales data available.</TableCell>
                                </TableRow>
                              ) : (
                                Object.entries(productCount).map(([product, count]) => (
                                  <TableRow key={product} hover>
                                    <TableCell>{product}</TableCell>
                                    <TableCell>{count}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
              </Card>
            </motion.div>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
              Page 1
            </Typography>
          </Box>
        </Box>
      </AppSidebar>
    </ThemeProvider>
  );
}
