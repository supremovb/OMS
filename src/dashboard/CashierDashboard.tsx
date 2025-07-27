import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Button,
  createTheme, // Import createTheme for consistency
  ThemeProvider, // Import ThemeProvider
  CssBaseline,
  CircularProgress, // Import CssBaseline
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar"; // Assuming this path is correct
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Assuming this path is correct
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import GroupIcon from "@mui/icons-material/Group";
import RefreshIcon from "@mui/icons-material/Refresh";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { motion } from "framer-motion"; // Import motion for animations

// Custom Material-UI Theme for consistent styling (copied from LoginForm/RegistrationForm)
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif', // Using Inter as requested
    h3: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 800,
      letterSpacing: 1.5,
    },
    h4: {
      fontFamily: '"Poppins", sans-serif', // Keep Poppins for headings for distinct branding
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
          borderRadius: '16px', // Slightly less rounded for cards
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)', // Consistent softer shadow
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)', // Smooth transition for hover
          '&:hover': {
            boxShadow: '0 12px 35px rgba(0,0,0,0.15)', // More pronounced shadow on hover
            transform: 'translateY(-5px)', // Subtle lift effect
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
  },
});

interface CashierDashboardProps {
  onLogout?: () => void;
  onProfile?: () => void;
}

interface PaymentRecord {
  id?: string;
  customerName: string;
  productName?: string; // Use for product sales
  serviceName?: string; // Fallback for legacy
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
  products?: { productName?: string; price: number; quantity?: number }[]; // Added for multi-product support
}

interface LoyaltyCustomer {
  id?: string;
  name: string;
  cars: { carName: string; plateNumber: string }[];
  points?: number;
}

const peso = (v: number) => `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const CashierDashboard: React.FC<CashierDashboardProps> = ({ onLogout, onProfile }) => {
  const navigate = useNavigate();
  const currentTheme = useTheme(); // Use currentTheme to avoid conflict with imported 'theme'
  const isSm = useMediaQuery(currentTheme.breakpoints.down("sm"));
  const isMd = useMediaQuery(currentTheme.breakpoints.down("md"));

  // State for dashboard stats
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<LoyaltyCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch payments and loyalty customers
  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsSnap, loyaltySnap] = await Promise.all([
        getDocs(collection(db, "payments")),
        getDocs(collection(db, "loyalty_customers")),
      ]);
      setPayments(paymentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PaymentRecord[]);
      setLoyaltyCustomers(loyaltySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as LoyaltyCustomer[]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Optionally, set an error state to display to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute today's stats
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();

  // Use both productName and serviceName for compatibility
  function getProductName(p: PaymentRecord) {
    return p.productName || p.serviceName || "";
  }

  // Helper to get total quantity from products array (for multi-product transactions)
  function getTotalQuantity(record: PaymentRecord): number {
    if (Array.isArray(record.products) && record.products.length > 0) {
      return record.products.reduce((sum, prod) => sum + (prod.quantity || 0), 0);
    }
    return record.quantity || 1;
  }

  // Helper to get product names from products array (for multi-product transactions)
  function getProductNames(record: PaymentRecord): string[] {
    if (Array.isArray(record.products) && record.products.length > 0) {
      return record.products.map(prod => prod.productName || "").filter(Boolean);
    }
    if (record.productName) return [record.productName];
    if (record.serviceName) return [record.serviceName];
    return [];
  }

  // Only count product sales (ignore records without product/service name)
  const todaysPayments = payments.filter(
    (p) => p.createdAt >= startOfDay && p.createdAt <= endOfDay && getProductNames(p).length > 0
  );

  const todaysPaid = todaysPayments.filter((p) => p.paid);
  const todaysUnpaid = todaysPayments.filter((p) => !p.paid);

  // Fix: Sum total price and quantity for multi-product transactions
  const todaySales = todaysPaid.reduce((sum, p) => {
    if (Array.isArray(p.products) && p.products.length > 0) {
      return sum + p.products.reduce((s, prod) => s + (prod.price * (prod.quantity ?? 1)), 0);
    }
    return sum + (typeof p.price === "number" ? p.price : 0);
  }, 0);

  const todayProductsSold = todaysPaid.reduce((sum, p) => sum + getTotalQuantity(p), 0);

  // Top-selling products today (multi-product support)
  const productCount: { [productName: string]: number } = {};
  todaysPaid.forEach((p) => {
    if (Array.isArray(p.products) && p.products.length > 0) {
      p.products.forEach(prod => {
        if (prod.productName) {
          productCount[prod.productName] = (productCount[prod.productName] || 0) + (prod.quantity || 0);
        }
      });
    } else {
      const name = p.productName || p.serviceName || "";
      if (name) {
        productCount[name] = (productCount[name] || 0) + (p.quantity || 1);
      }
    }
  });
  const topProductsToday = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // All-time stats
  const allPaid = payments.filter((p) => p.paid && getProductNames(p).length > 0);
  const allUnpaid = payments.filter((p) => !p.paid && getProductNames(p).length > 0);

  const allSales = allPaid.reduce((sum, p) => {
    if (Array.isArray(p.products) && p.products.length > 0) {
      return sum + p.products.reduce((s, prod) => s + (prod.price * (prod.quantity ?? 1)), 0);
    }
    return sum + (typeof p.price === "number" ? p.price : 0);
  }, 0);

  const allProductsSold = allPaid.reduce((sum, p) => sum + getTotalQuantity(p), 0);

  // All-time top-selling products (multi-product support)
  const allProductCount: { [productName: string]: number } = {};
  allPaid.forEach((p) => {
    if (Array.isArray(p.products) && p.products.length > 0) {
      p.products.forEach(prod => {
        if (prod.productName) {
          allProductCount[prod.productName] = (allProductCount[prod.productName] || 0) + (prod.quantity || 0);
        }
      });
    } else {
      const name = p.productName || p.serviceName || "";
      if (name) {
        allProductCount[name] = (allProductCount[name] || 0) + (p.quantity || 1);
      }
    }
  });
  const topProductsAllTime = Object.entries(allProductCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Ensure onProfile and onLogout work with navigation
  const handleProfile = () => {
    if (onProfile) onProfile();
    navigate("/profile");
  };
  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  // Skeleton loader for cards - improved to mimic content structure
  const StatCardSkeleton = () => (
    <Card
      elevation={4}
      sx={{
        flex: "1 1 220px",
        minWidth: 220,
        borderRadius: 3,
        bgcolor: "background.paper",
        p: 2, // Add padding to skeleton card
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="85%" height={28} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="55%" height={16} />
        </Box>
      </CardContent>
    </Card>
  );

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppSidebar role="cashier" onLogout={handleLogoutClick} onProfile={handleProfile}>
        <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1400, mx: "auto", width: "100%" }}>
          {/* Header Section */}
          <motion.div initial="hidden" animate="visible" variants={itemVariants}>
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
                  Military Supplies Sales Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Welcome, Cashier! Here is your summary of product sales.
                </Typography>
              </Box>
              <Tooltip title="Refresh Data">
                <Button
                  onClick={fetchData}
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
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </Tooltip>
            </Paper>
          </motion.div>

          {/* Dashboard Stats as Flex Cards */}
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
            {/* Today's Sales */}
            {loading ? (
              <StatCardSkeleton />
            ) : (
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
                    <MonetizationOnIcon color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                        Today's Sales
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color={currentTheme.palette.success.dark}>
                        {peso(todaySales)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Products Sold: <span style={{ fontWeight: 600 }}>{todayProductsSold}</span>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Paid Sales */}
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <motion.div variants={itemVariants}>
                <Card
                  elevation={4}
                  sx={{
                    borderLeft: `6px solid ${currentTheme.palette.info.main}`,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                    <CheckCircleIcon color="info" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                        Paid Sales
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color={currentTheme.palette.info.dark}>
                        {todaysPaid.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        All Time: <span style={{ fontWeight: 600 }}>{allPaid.length}</span>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Unpaid Sales */}
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <motion.div variants={itemVariants}>
                <Card
                  elevation={4}
                  sx={{
                    borderLeft: `6px solid ${currentTheme.palette.warning.main}`,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                    <HourglassEmptyIcon color="warning" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                        Unpaid Sales
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color={currentTheme.palette.warning.dark}>
                        {todaysUnpaid.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        All Time: <span style={{ fontWeight: 600 }}>{allUnpaid.length}</span>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Loyalty Customers */}
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <motion.div variants={itemVariants}>
                <Card
                  elevation={4}
                  sx={{
                    borderLeft: `6px solid ${currentTheme.palette.primary.main}`,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                    <GroupIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                        Loyalty Customers
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color={currentTheme.palette.primary.dark}>
                        {loyaltyCustomers.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Registered
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Top-Selling Products Today */}
          <motion.div initial="hidden" animate="visible" variants={itemVariants}>
            <Paper elevation={4} sx={{ mb: 4, borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, bgcolor: "background.paper" }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                <Inventory2Icon color="warning" sx={{ mr: 1.5, fontSize: 28 }} />
                Top-Selling Products Today
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                <Stack direction={isSm ? "column" : "row"} spacing={2} sx={{ width: "100%" }}>
                  <Skeleton variant="rectangular" width={isSm ? "100%" : 180} height={40} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" width={isSm ? "100%" : 180} height={40} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" width={isSm ? "100%" : 180} height={40} sx={{ borderRadius: 2 }} />
                </Stack>
              ) : topProductsToday.length === 0 ? (
                <Typography color="text.secondary" variant="body1">
                  No product sales today.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: isSm ? "center" : "flex-start" }}>
                  {topProductsToday.map(([product, count], idx) => (
                    <Chip
                      key={product}
                      label={`${product} (${count})`}
                      color={idx === 0 ? "warning" : idx === 1 ? "info" : "default"}
                      icon={<ShoppingCartIcon />}
                      sx={{
                        fontWeight: 600,
                        fontSize: isSm ? 14 : 16,
                        px: isSm ? 1.5 : 2,
                        py: isSm ? 0.5 : 1,
                        borderRadius: 2,
                        boxShadow: currentTheme.shadows[1],
                      }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </motion.div>

          {/* Top-Selling Products (All Time) */}
          <motion.div initial="hidden" animate="visible" variants={itemVariants}>
            <Paper elevation={4} sx={{ mb: 4, borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, bgcolor: "background.paper" }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                <Inventory2Icon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                Top-Selling Products (All Time)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                <Stack direction={isSm ? "column" : "row"} spacing={2} sx={{ width: "100%" }}>
                  <Skeleton variant="rectangular" width={isSm ? "100%" : 180} height={40} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" width={isSm ? "100%" : 180} height={40} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" width={isSm ? "100%" : 180} height={40} sx={{ borderRadius: 2 }} />
                </Stack>
              ) : topProductsAllTime.length === 0 ? (
                <Typography color="text.secondary" variant="body1">
                  No product sales yet.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: isSm ? "center" : "flex-start" }}>
                  {topProductsAllTime.map(([product, count], idx) => (
                    <Chip
                      key={product}
                      label={`${product} (${count})`}
                      color={idx === 0 ? "primary" : idx === 1 ? "info" : "default"}
                      icon={<ShoppingCartIcon />}
                      sx={{
                        fontWeight: 600,
                        fontSize: isSm ? 14 : 16,
                        px: isSm ? 1.5 : 2,
                        py: isSm ? 0.5 : 1,
                        borderRadius: 2,
                        boxShadow: currentTheme.shadows[1],
                      }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </motion.div>
        </Box>
      </AppSidebar>
    </ThemeProvider>
  );
};

export default CashierDashboard;
