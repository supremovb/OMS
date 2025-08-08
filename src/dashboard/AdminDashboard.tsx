import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  useTheme,
  useMediaQuery,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress, // Added for loading states
  createTheme, // Import createTheme for consistency
  ThemeProvider, // Import ThemeProvider
  CssBaseline, // Import CssBaseline
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import moment, { Moment } from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import AppSidebar from "./AppSidebar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  MonetizationOn as MonetizationOnIcon,
  Build as BuildIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  TableChart as TableChartIcon,
  Refresh as RefreshIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon, // <-- Add this for Net Income
} from "@mui/icons-material";
import { motion } from "framer-motion";

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

interface AdminDashboardProps {
  onLogout?: () => void;
  onProfile?: () => void;
  firstName?: string;
  lastName?: string;
}

interface PaymentRecord {
  id?: string;
  customerName: string;
  carName: string;
  plateNumber: string;
  variety: string;
  serviceId: string;
  serviceName: string;
  price: number;
  cashier: string;
  cashierFullName?: string;
  employees: { id: string; name: string; commission: number }[];
  referrer?: { id: string; name: string; commission: number };
  createdAt: number; // Unix timestamp
  paid?: boolean;
  paymentMethod?: string;
  amountTendered?: number;
  change?: number;
  voided?: boolean;
}

interface LoyaltyCustomer {
  id?: string;
  name: string;
  cars: { carName: string; plateNumber: string }[];
  points?: number;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  prices: { [variety: string]: number };
}

// Helper function to format currency
const peso = (v: number) => `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const StatCard = ({
  icon,
  title,
  value,
  loading,
  color = "primary"
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  loading: boolean;
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error";
}) => {
  const currentTheme = useTheme();
  return (
    <Card
      component={motion.div}
      whileHover={{ y: -5, boxShadow: currentTheme.shadows[8] }} // Stronger hover effect
      sx={{
        flex: "1 1 240px",
        minWidth: 240,
        borderRadius: 3,
        boxShadow: currentTheme.shadows[4], // Increased default shadow
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)', // Smooth transition
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.light`,
            color: `${color}.dark`,
            borderRadius: '50%', // Circular background for icon
            p: 2,
            minWidth: 60, // Larger icon background
            minHeight: 60,
            boxShadow: currentTheme.shadows[2], // Subtle shadow for icon background
          }}
        >
          {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 32 } })} {/* Ensure icon size */}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}> {/* Bolder subtitle */}
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} color={color} /> // Use CircularProgress for loading
          ) : (
            <Typography variant="h5" fontWeight={700} color={`${color}.dark`}> {/* Darker color for value */}
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Helper to get total quantity from products array (for multi-product transactions)
function getTotalQuantity(record: PaymentRecord): number {
  if (Array.isArray((record as any).products) && (record as any).products.length > 0) {
    return (record as any).products.reduce((sum: number, prod: any) => sum + (prod.quantity || 0), 0);
  }
  return (record as any).quantity || 1;
}

// Helper to get product names from products array (for multi-product transactions)
function getProductNames(record: PaymentRecord): string[] {
  if (Array.isArray((record as any).products) && (record as any).products.length > 0) {
    return (record as any).products.map((prod: any) => prod.productName || "").filter(Boolean);
  }
  if ((record as any).productName) return [(record as any).productName];
  if (record.serviceName) return [record.serviceName];
  return [];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onProfile,
  firstName = "",
  lastName = ""
}) => {
  const currentTheme = useTheme(); // Use currentTheme to access theme properties
  const isMobile = useMediaQuery(currentTheme.breakpoints.down('sm'));
  const isMd = useMediaQuery(currentTheme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<LoyaltyCustomer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  // Add products state for accurate count
  const [products, setProducts] = useState<any[]>([]);

  // State for shift report date range
  const [reportStartDate, setReportStartDate] = useState<Moment | null>(moment().startOf('day'));
  const [reportEndDate, setReportEndDate] = useState<Moment | null>(moment().endOf('day'));
  // New state for shift selection
  const [reportShiftType, setReportShiftType] = useState<'all' | 'shift1' | 'shift2'>('all');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [paymentsSnap, loyaltySnap, employeesSnap, servicesSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, "payments")),
          getDocs(collection(db, "loyalty_customers")),
          getDocs(collection(db, "employees")),
          getDocs(collection(db, "services")),
          getDocs(collection(db, "products")), // Add products collection
        ]);
        setPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentRecord[]);
        setLoyaltyCustomers(loyaltySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoyaltyCustomer[]);
        setEmployees(employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Employee[]);
        setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[]);
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // Store products for count
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Overall sales (paid only, not voided, supports multi-product)
  const allPaidNonVoided = payments.filter(p => p.paid && !p.voided && getProductNames(p).length > 0);
  const overallSales = allPaidNonVoided.reduce((sum, p) => {
    if (Array.isArray((p as any).products) && (p as any).products.length > 0) {
      return sum + (p as any).products.reduce((s: number, prod: any) => s + (prod.price * prod.quantity), 0);
    }
    return sum + (typeof p.price === "number" ? p.price : 0);
  }, 0);

  // Helper: Map productId to cost for fast lookup
  const productCostMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p: any) => {
      if (p.id && typeof p.cost === "number") map[p.id] = p.cost;
    });
    return map;
  }, [products]);

  // Calculate total cost of goods sold (COGS)
  const totalCostOfGoodsSold = allPaidNonVoided.reduce((sum, p) => {
    if (Array.isArray((p as any).products) && (p as any).products.length > 0) {
      return sum + (p as any).products.reduce((s: number, prod: any) => {
        const cost = productCostMap[prod.productId] || 0;
        return s + cost * (prod.quantity || 0);
      }, 0);
    }
    // For legacy/single-product, skip (no productId/cost info)
    return sum;
  }, 0);

  // Net income = total sales - total cost
  const netIncome = overallSales - totalCostOfGoodsSold;

  // Total products (from products collection)
  const totalProducts = products.length;

  // Loyalty customers count
  const totalLoyaltyCustomers = loyaltyCustomers.length;

  // Employees count
  const totalEmployees = employees.length;

  // Most availed services (all time, top 3, paid and not voided)
  const serviceCount: { [serviceName: string]: number } = {};
  allPaidNonVoided.forEach(p => {
    if (Array.isArray((p as any).products) && (p as any).products.length > 0) {
      (p as any).products.forEach((prod: any) => {
        if (prod.productName) {
          serviceCount[prod.productName] = (serviceCount[prod.productName] || 0) + (prod.quantity || 0);
        }
      });
    } else if (p.serviceName) {
      serviceCount[p.serviceName] = (serviceCount[p.serviceName] || 0) + getTotalQuantity(p);
    }
  });
  const mostAvailed = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Top customers by number of paid records (top 3, not voided)
  const customerCount: { [customerName: string]: number } = {};
  allPaidNonVoided.forEach(p => {
    if (p.customerName) {
      customerCount[p.customerName] = (customerCount[p.customerName] || 0) + 1;
    }
  });
  const topCustomers = Object.entries(customerCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // --- Shift Sales Logic ---

  /**
   * Filters payment records for a specific shift within a given date range.
   * @param payments All payment records.
   * @param startMoment Moment object for the start date of the report range.
   * @param endMoment Moment object for the end date of the report range.
   * @param shiftType 'shift1' (8 AM - 8 PM) or 'shift2' (8 PM - 8 AM next day).
   * @returns Filtered list of payment records for the specified shift and date range.
   */
  const getShiftPayments = (
    payments: PaymentRecord[],
    startMoment: Moment,
    endMoment: Moment,
    shiftType: 'shift1' | 'shift2'
  ): PaymentRecord[] => {
    const SHIFT1_START_HOUR = 8; // 8:00 AM
    const SHIFT1_END_HOUR = 20;  // 8:00 PM (20:00)

    return payments.filter(p => {
      const paymentTime = moment.unix(p.createdAt / 1000);

      // 1. Filter by selected report date range (inclusive of full days)
      const isWithinReportRange = paymentTime.isSameOrAfter(startMoment.clone().startOf('day')) &&
                                   paymentTime.isSameOrBefore(endMoment.clone().endOf('day'));

      if (!isWithinReportRange) {
        return false;
      }

      // 2. Filter by shift type for the specific payment time
      const paymentHour = paymentTime.hour();

      if (shiftType === 'shift1') {
        // Shift 1: 8:00 AM (inclusive) to 8:00 PM (exclusive) on the same day
        return paymentHour >= SHIFT1_START_HOUR && paymentHour < SHIFT1_END_HOUR;
      } else { // shiftType === 'shift2'
        // Shift 2: 8:00 PM (inclusive) to 8:00 AM next day (exclusive)
        let effectiveShiftDayStart;
        if (paymentHour < SHIFT1_START_HOUR) {
            effectiveShiftDayStart = paymentTime.clone().subtract(1, 'day').startOf('day');
        } else {
            effectiveShiftDayStart = paymentTime.clone().startOf('day');
        }

        const shift2StartMoment = effectiveShiftDayStart.clone().hour(SHIFT1_END_HOUR); // 8:00 PM of current effective day
        const shift2EndMoment = effectiveShiftDayStart.clone().add(1, 'day').hour(SHIFT1_START_HOUR); // 8:00 AM of next effective day

        return paymentTime.isSameOrAfter(shift2StartMoment) && paymentTime.isBefore(shift2EndMoment);
      }
    });
  };

  // Filter payments for the selected date range first, then apply shift filter
  const paymentsInReportRange = payments.filter(p => {
    const paymentTime = moment.unix(p.createdAt / 1000);
    return reportStartDate && reportEndDate &&
           paymentTime.isSameOrAfter(reportStartDate.clone().startOf('day')) &&
           paymentTime.isSameOrBefore(reportEndDate.clone().endOf('day')) &&
           !p.voided; // Only consider non-voided payments for sales
  });

  const shift1Payments = getShiftPayments(paymentsInReportRange, reportStartDate!, reportEndDate!, 'shift1');
  const shift2Payments = getShiftPayments(paymentsInReportRange, reportStartDate!, reportEndDate!, 'shift2');

  const shift1Sales = shift1Payments.reduce((sum, p) => sum + (typeof p.price === "number" ? p.price : 0), 0);
  const shift2Sales = shift2Payments.reduce((sum, p) => sum + (typeof p.price === "number" ? p.price : 0), 0);

  // --- Report Generation Functions ---

  const generateExcelReport = () => {
    if (!reportStartDate || !reportEndDate) {
      alert("Please select a valid date range for the report.");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Shift Sales Report Summary'],
      [`Date Range: ${reportStartDate.format('YYYY-MM-DD')} to ${reportEndDate.format('YYYY-MM-DD')}`],
      [],
      ['Shift', 'Total Sales', 'Number of Transactions'],
      ['Shift 1 (8 AM - 8 PM)', peso(shift1Sales), shift1Payments.length],
      ['Shift 2 (8 PM - 8 AM next day)', peso(shift2Sales), shift2Payments.length],
      ['Overall Total', peso(shift1Sales + shift2Sales), shift1Payments.length + shift2Payments.length],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Conditionally add detail sheets based on reportShiftType
    if (reportShiftType === 'all' || reportShiftType === 'shift1') {
      const ws1Data = shift1Payments.map(p => ({
        'Payment ID': p.id,
        'Date & Time': moment.unix(p.createdAt / 1000).format('YYYY-MM-DD HH:mm:ss'),
        'Customer Name': p.customerName,
        'Service Name': p.serviceName,
        'Price': p.price,
        'Cashier': p.cashierFullName || p.cashier,
        'Payment Method': p.paymentMethod || 'N/A',
      }));
      if (ws1Data.length > 0) {
        const ws1 = XLSX.utils.json_to_sheet(ws1Data);
        XLSX.utils.book_append_sheet(wb, ws1, "Shift 1 Details");
      } else {
        const ws1 = XLSX.utils.aoa_to_sheet([['No sales records for Shift 1 in this period.']]);
        XLSX.utils.book_append_sheet(wb, ws1, "Shift 1 Details");
      }
    }

    if (reportShiftType === 'all' || reportShiftType === 'shift2') {
      const ws2Data = shift2Payments.map(p => ({
        'Payment ID': p.id,
        'Date & Time': moment.unix(p.createdAt / 1000).format('YYYY-MM-DD HH:mm:ss'),
        'Customer Name': p.customerName,
        'Service Name': p.serviceName,
        'Price': p.price,
        'Cashier': p.cashierFullName || p.cashier,
        'Payment Method': p.paymentMethod || 'N/A',
      }));
      if (ws2Data.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(ws2Data);
        XLSX.utils.book_append_sheet(wb, ws2, "Shift 2 Details");
      } else {
        const ws2 = XLSX.utils.aoa_to_sheet([['No sales records for Shift 2 in this period.']]);
        XLSX.utils.book_append_sheet(wb, ws2, "Shift 2 Details");
      }
    }

    XLSX.writeFile(wb, `Shift_Sales_Report_${reportStartDate.format('YYYY-MM-DD')}_to_${reportEndDate.format('YYYY-MM-DD')}.xlsx`);
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

  // Fetch all data (used for Refresh button)
  async function fetchAll(event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setLoading(true);
    try {
      const [paymentsSnap, loyaltySnap, employeesSnap, servicesSnap] = await Promise.all([
        getDocs(collection(db, "payments")),
        getDocs(collection(db, "loyalty_customers")),
        getDocs(collection(db, "employees")),
        getDocs(collection(db, "services"))
      ]);
      setPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentRecord[]);
      setLoyaltyCustomers(loyaltySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoyaltyCustomer[]);
      setEmployees(employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Employee[]);
      setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      // Optionally show a Snackbar or alert here
    } finally {
      setLoading(false);
    }
  }

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
        <Box sx={{
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: 1400,
          mx: "auto",
          width: '100%'
        }}>
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2.5, sm: 4 }, // Increased padding
                mb: 4,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${currentTheme.palette.primary.light} 0%, ${currentTheme.palette.primary.main} 100%)`,
                color: currentTheme.palette.primary.contrastText,
                boxShadow: currentTheme.shadows[6], // Stronger shadow
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant={isMobile ? "h5" : "h3"} fontWeight={700} gutterBottom>
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Welcome back, {firstName}! Here's what's happening with your business.
                </Typography>
              </Box>
              <Button
                onClick={fetchAll}
                variant="contained"
                color="secondary" // Secondary color for contrast
                sx={{
                  borderRadius: 2.5, // More rounded button
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
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh Data"}
              </Button>
            </Paper>
          </motion.div>

          {/* Dashboard Stats */}
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
              <StatCard
                icon={<MonetizationOnIcon />}
                title="Overall Sales"
                value={peso(overallSales)}
                loading={loading}
                color="success"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<AccountBalanceWalletIcon />}
                title="Net Income"
                value={peso(netIncome)}
                loading={loading}
                color="primary"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<BuildIcon />}
                title="Total Products"
                value={totalProducts}
                loading={loading}
                color="info"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<PeopleIcon />}
                title="Loyalty Customers"
                value={totalLoyaltyCustomers}
                loading={loading}
                color="warning"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<GroupIcon />}
                title="Total Employees"
                value={totalEmployees}
                loading={loading}
                color="secondary"
              />
            </motion.div>
          </motion.div>

          {/* Analytics Sections */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 4 }}>
            {/* Most Availed Services */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              style={{ flex: 1, minWidth: 300 }}
            >
              <Card
                elevation={4} // Stronger shadow
                sx={{
                  borderRadius: 3,
                  boxShadow: currentTheme.shadows[4],
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon color="warning" sx={{ mr: 1.5, fontSize: 32 }} />
                    <Typography variant="h6" fontWeight={700}>
                      Most Availed Services
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  {loading ? (
                    <Stack spacing={1}>
                      <Skeleton variant="rounded" width="80%" height={40} />
                      <Skeleton variant="rounded" width="70%" height={40} />
                      <Skeleton variant="rounded" width="60%" height={40} />
                    </Stack>
                  ) : mostAvailed.length === 0 ? (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                      No services availed yet.
                    </Typography>
                  ) : (
                    <Box sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                    }}>
                      {mostAvailed.map(([service, count], idx) => (
                        <Chip
                          key={service}
                          label={`${service} (${count})`}
                          color={idx === 0 ? "warning" : idx === 1 ? "info" : "default"}
                          icon={<EmojiEventsIcon />}
                          sx={{ fontWeight: 600, fontSize: 15, px: 2, py: 1.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Customers */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              style={{ flex: 1, minWidth: 300 }}
            >
              <Card
                elevation={4} // Stronger shadow
                sx={{
                  borderRadius: 3,
                  boxShadow: currentTheme.shadows[4],
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StarIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
                    <Typography variant="h6" fontWeight={700}>
                      Top Customers
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  {loading ? (
                    <Stack spacing={1}>
                      <Skeleton variant="rounded" width="80%" height={40} />
                      <Skeleton variant="rounded" width="70%" height={40} />
                      <Skeleton variant="rounded" width="60%" height={40} />
                    </Stack>
                  ) : topCustomers.length === 0 ? (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                      No customer records yet.
                    </Typography>
                  ) : (
                    <Box sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                    }}>
                      {topCustomers.map(([customer, count], idx) => (
                        <Chip
                          key={customer}
                          label={`${customer} (${count})`}
                          color={idx === 0 ? "primary" : idx === 1 ? "info" : "default"}
                          icon={<PersonIcon />}
                          sx={{ fontWeight: 600, fontSize: 15, px: 2, py: 1.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* --- Shift Sales Report Section --- */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Card
              elevation={4} // Stronger shadow
              sx={{
                borderRadius: 3,
                boxShadow: currentTheme.shadows[4],
                p: 3,
                mb: 4,
                bgcolor: "background.paper",
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MonetizationOnIcon color="success" sx={{ mr: 1.5, fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Shift Sales Reports
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <Stack direction={isMobile ? 'column' : 'row'} spacing={2} mb={3}>
                    <DatePicker
                      label="Start Date"
                      value={reportStartDate}
                      onChange={(newValue: Moment | null) => setReportStartDate(newValue)}
                      enableAccessibleFieldDOMStructure={false}
                      slots={{ textField: TextField }}
                      slotProps={{ textField: { fullWidth: true, variant: "outlined", size: "medium" } }}
                    />
                    <DatePicker
                      label="End Date"
                      value={reportEndDate}
                      onChange={(newValue: Moment | null) => setReportEndDate(newValue)}
                      enableAccessibleFieldDOMStructure={false}
                      slots={{ textField: TextField }}
                      slotProps={{ textField: { fullWidth: true, variant: "outlined", size: "medium" } }}
                    />
                  </Stack>
                </LocalizationProvider>

                {/* Shift Selection Dropdown */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="shift-select-label">Select Shift for Report</InputLabel>
                  <Select
                    labelId="shift-select-label"
                    id="shift-select"
                    value={reportShiftType}
                    label="Select Shift for Report"
                    onChange={(e) => setReportShiftType(e.target.value as 'all' | 'shift1' | 'shift2')}
                    sx={{ borderRadius: 2 }}
                    variant="outlined" // Consistent variant
                    size="medium" // Consistent size
                  >
                    <MenuItem value="all">All Shifts (Includes Shift 1 & 2 for selected period)</MenuItem>
                    <MenuItem value="shift1">Shift 1 (8:00 AM - 7:59 PM)</MenuItem>
                    <MenuItem value="shift2">Shift 2 (8:00 PM - 7:59 AM Next Day)</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mb: 3, p: 2, bgcolor: currentTheme.palette.grey[50], borderRadius: 2 }}> {/* Subtle background for summary */}
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Sales for Selected Period ({reportStartDate?.format('MMM DD, YYYY')} to {reportEndDate?.format('MMM DD, YYYY')})
                  </Typography>
                  {loading ? (
                    <Stack spacing={1}>
                      <Skeleton variant="text" width="80%" height={24} />
                      <Skeleton variant="text" width="70%" height={24} />
                      <Skeleton variant="text" width="60%" height={28} />
                    </Stack>
                  ) : (
                    <>
                      <Typography variant="body1" sx={{ mb: 0.5 }}>
                        <strong>Shift 1 (8 AM - 8 PM):</strong> {peso(shift1Sales)} ({shift1Payments.length} transactions)
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1.5 }}>
                        <strong>Shift 2 (8 PM - 8 AM next day):</strong> {peso(shift2Sales)} ({shift2Payments.length} transactions)
                      </Typography>
                      <Typography variant="h6" color="primary.dark"> {/* Highlight total sales */}
                        <strong>Total Sales for Period:</strong> {peso(shift1Sales + shift2Sales)}
                      </Typography>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<TableChartIcon />}
                    onClick={generateExcelReport}
                    disabled={loading || !reportStartDate || !reportEndDate}
                    sx={{ flex: 1, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                  >
                    Generate Excel Report
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
          {/* --- End Shift Sales Report Section --- */}

        </Box>
      </AppSidebar>
    </ThemeProvider>
  );
};

export default AdminDashboard;
