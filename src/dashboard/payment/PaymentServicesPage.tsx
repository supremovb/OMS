import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  OutlinedInput,
  Divider,
  useMediaQuery,
  Checkbox,
  ListItemText
} from "@mui/material";
import AppSidebar from "../AppSidebar";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useTheme } from "@mui/material/styles";
import Autocomplete from "@mui/material/Autocomplete";
import PaymentIcon from "@mui/icons-material/PointOfSale";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import PaidIcon from "@mui/icons-material/Paid";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupIcon from "@mui/icons-material/Group";
import ScienceIcon from "@mui/icons-material/Science";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { format } from "date-fns";
import { reduceProductStock } from "../services/ServiceManagementPage"; // Import stock reducer
import { Grid } from "@mui/material";

const VARIETIES = [
  { key: "motor", label: "Motor" },
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
  { key: "xlarge", label: "X-Large" }
];

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash" },
  { key: "gcash", label: "GCash" },
  { key: "card", label: "Card" },
  { key: "maya", label: "Maya" }
];

// Update Service interface to include chemicals
interface Service {
  id: string;
  name: string;
  description: string;
  prices: { [variety: string]: number };
  chemicals?: {
    [chemicalId: string]: {
      name: string;
      usage: { [variety: string]: number };
    }
  };
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

// Add quantity to PaymentRecord for product sales
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
  createdAt: number;
  paid?: boolean;
  paymentMethod?: string;
  amountTendered?: number;
  change?: number;
  voided?: boolean;
  serviceIds?: string[];
  serviceNames?: string[];
  manualServices?: { name: string; price: number }[];
  // Add for product sales:
  quantity?: number;
  products?: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}

interface PaymentServicesPageProps {
  onLogout?: () => void;
  onProfile?: () => void;
  firstName?: string;
  lastName?: string;
  cashierUsername: string;
}

// Add Product interface
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  available?: boolean;
}

const peso = (v: number) => `₱${v.toLocaleString()}`;

interface LoyaltyCustomer {
  id?: string;
  name: string;
  cars: { carName: string; plateNumber: string }[];
}

const PaymentServicesPage: React.FC<PaymentServicesPageProps> = ({
  onLogout,
  onProfile,
  firstName,
  lastName,
  cashierUsername
}) => {
  // Replace services with products for product sales
  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // New: Multi-product sale state
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id?: string; name: string } | null>(null);
  const [customerInput, setCustomerInput] = useState(""); // For manual entry
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<LoyaltyCustomer[]>([]);
  const [formPaymentMethod, setFormPaymentMethod] = useState(PAYMENT_METHODS[0].key);
  const [amountTendered, setAmountTendered] = useState<number | "">("");
  const [change, setChange] = useState<number>(0);
  const [payLater, setPayLater] = useState(false);
  const [payingRecordId, setPayingRecordId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Search/filter state
  const [searchCustomer, setSearchCustomer] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "unpaid">("");

  // Add filter states
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");

  // New: Product selection dialog state
  const [productSelectDialogOpen, setProductSelectDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Filtered available products for selection dialog
  const availableProducts = products.filter(
    p =>
      (p.available !== false) &&
      (!productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase())))
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchProducts();
    fetchRecords();
    fetchLoyaltyCustomers();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
  };

  const fetchRecords = async () => {
    const snapshot = await getDocs(collection(db, "payments"));
    setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentRecord[]);
  };

  // Fetch loyalty customers for selection
  const fetchLoyaltyCustomers = async () => {
    const snapshot = await getDocs(collection(db, "loyalty_customers"));
    setLoyaltyCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoyaltyCustomer[]);
  };

  // Calculate total price for all selected products
  const calcTotalPrice = () => {
    return selectedProducts.reduce((sum, sp) => {
      const product = products.find(p => p.id === sp.productId);
      return sum + (product ? product.price * sp.quantity : 0);
    }, 0);
  };

  // Update change when amountTendered or total price changes
  useEffect(() => {
    const total = calcTotalPrice();
    if (typeof amountTendered === "number" && !isNaN(amountTendered)) {
      setChange(amountTendered - total);
    } else {
      setChange(0);
    }
  }, [amountTendered, selectedProducts]);

  // Add or update a product in the selectedProducts array
  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.some(p => p.productId === productId)) return prev;
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleProductQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p => p.productId === productId ? { ...p, quantity: Math.max(1, quantity) } : p)
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  // Open process payment dialog
  const handleProcessPayment = () => {
    setProcessDialogOpen(true);
    setAmountTendered(calcTotalPrice());
    setPayLater(false);
    setPayingRecordId(null);
  };

  // Add this helper to extract products from a PaymentRecord (for unpaid records)
  function getProductsFromRecord(record: PaymentRecord): { productId: string; quantity: number }[] {
    if (Array.isArray(record.products) && record.products.length > 0) {
      return record.products.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
      }));
    }
    // Fallback for legacy single-product records
    if (record.serviceId) {
      return [{ productId: record.serviceId, quantity: record.quantity || 1 }];
    }
    return [];
  }

  // Save payment (multi-product, single transaction)
  const handleAddPayment = async () => {
    try {
      // If processing an unpaid record, update the existing record
      let productsForSale = selectedProducts;
      if ((!productsForSale || productsForSale.length === 0) && payingRecordId && selectedRecord) {
        productsForSale = getProductsFromRecord(selectedRecord);
      }
      // If no customer name, store as "N/A"
      let customerName = selectedCustomer?.name || customerInput.trim() || (selectedRecord?.customerName ?? "");
      if (!customerName) customerName = "N/A";
      if (!productsForSale || productsForSale.length === 0) {
        setSnackbar({ open: true, message: "Please select at least one product.", severity: "error" });
        return;
      }
      const now = Date.now();
      const productsDetails = productsForSale.map(sp => {
        const product = products.find(p => p.id === sp.productId);
        return {
          productId: product?.id || "",
          productName: product?.name || "",
          price: product?.price || 0,
          quantity: sp.quantity
        };
      });
      const totalPrice = productsDetails.reduce((sum, p) => sum + (p.price * p.quantity), 0);

      let cashier = cashierUsername;
      let cashierFullName = [firstName, lastName].filter(Boolean).join(" ");
      try {
        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          if (userInfo.username) cashier = userInfo.username;
          if (userInfo.firstName || userInfo.lastName) {
            cashierFullName = [userInfo.firstName, userInfo.lastName].filter(Boolean).join(" ");
          }
        }
      } catch { /* fallback to props */ }

      if (payingRecordId && selectedRecord) {
        // Update the existing unpaid record to mark as paid
        await updateDoc(doc(db, "payments", payingRecordId), {
          paid: true,
          paymentMethod: formPaymentMethod,
          amountTendered: typeof amountTendered === "number" ? amountTendered : undefined,
          change: typeof amountTendered === "number" ? amountTendered - totalPrice : undefined,
          cashier,
          cashierFullName,
          price: totalPrice,
          products: productsDetails,
          customerName,
          createdAt: selectedRecord.createdAt, // preserve original timestamp
        });

        // Reduce stock for each product sold
        for (const prod of productsDetails) {
          if (prod.productId && prod.quantity > 0) {
            await reduceProductStock(prod.productId, prod.quantity);
          }
        }

        setSnackbar({ open: true, message: "Payment recorded!", severity: "success" });
      } else {
        // Create new record (normal flow)
        const record: PaymentRecord = {
          customerName,
          carName: "",
          plateNumber: "",
          variety: "",
          serviceId: "", // Not used for multi-product
          serviceName: "", // Not used for multi-product
          price: totalPrice,
          cashier,
          cashierFullName,
          employees: [],
          createdAt: now,
          paid: !payLater,
          ...(payLater ? {} : {
            paymentMethod: formPaymentMethod,
            amountTendered: typeof amountTendered === "number" ? amountTendered : undefined,
            change: typeof amountTendered === "number" ? amountTendered - totalPrice : undefined
          }),
          products: productsDetails
        };

        await addDoc(collection(db, "payments"), record);

        // Reduce stock for each product sold
        for (const prod of productsDetails) {
          if (prod.productId && prod.quantity > 0) {
            await reduceProductStock(prod.productId, prod.quantity);
          }
        }

        setSnackbar({ open: true, message: payLater ? "Products recorded as unpaid." : "Payment recorded!", severity: "success" });
      }

      setAddDialogOpen(false);
      setProcessDialogOpen(false);
      setPayLater(false);
      setPayingRecordId(null);
      setSelectedProducts([]);
      setSelectedCustomer(null);
      setCustomerInput("");
      setFormPaymentMethod(PAYMENT_METHODS[0].key);
      setAmountTendered("");
      setChange(0);
      fetchRecords();
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to record payment", severity: "error" });
    }
  };

  // Quick amount buttons
  const quickAmounts = [100, 200, 300, 500, 1000];

  // Handle row click to show details or process payment if unpaid
  const handleRowClick = (record: PaymentRecord) => {
    if (record.voided) {
      setSelectedRecord(record);
      setDetailsDialogOpen(true);
    } else if (record.paid) {
      setSelectedRecord(record);
      setDetailsDialogOpen(true);
    } else {
      // For unpaid, set selectedProducts from record.products (multi-product) or fallback
      setSelectedProducts(getProductsFromRecord(record));
      setSelectedCustomer({ name: record.customerName }); // Set customer from record
      setCustomerInput(record.customerName || "");
      setProcessDialogOpen(true);
      setAmountTendered(record.price);
      setPayLater(false);
      setPayingRecordId(record.id || null);
      setDetailsDialogOpen(false);
    }
  };

  // Stats
  const totalPayments = records.length;
  const totalPaid = records.filter(r => r.paid).length;
  const totalUnpaid = records.filter(r => !r.paid).length;
  const totalSales = records.filter(r => r.paid).reduce((sum, r) => sum + (typeof r.price === "number" ? r.price : 0), 0);

  // Most availed services (top 3)
  const serviceCount: { [serviceName: string]: number } = {};
  records.forEach(r => {
    if (r.serviceName) {
      serviceCount[r.serviceName] = (serviceCount[r.serviceName] || 0) + 1;
    }
  });
  const mostAvailed = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Unique customers and products for filter dropdowns
  const uniqueCustomers = Array.from(new Set(records.map(r => r.customerName).filter(Boolean)));
  const uniqueServices = Array.from(new Set(records.map(r => r.serviceName).filter(Boolean)));

  // Filtered records for table
  const filteredRecords = records.filter(r => {
    // Date filter
    if (dateFrom && r.createdAt < new Date(dateFrom).setHours(0, 0, 0, 0)) return false;
    if (dateTo && r.createdAt > new Date(dateTo).setHours(23, 59, 59, 999)) return false;
    // Customer filter
    if (customerFilter && r.customerName !== customerFilter) return false;
    // Product filter
    if (serviceFilter && r.serviceName !== serviceFilter) return false;
    // Status filter
    if (statusFilter === "paid" && !r.paid) return false;
    if (statusFilter === "unpaid" && r.paid) return false;
    // Search
    if (searchCustomer && !r.customerName.toLowerCase().includes(searchCustomer.toLowerCase())) return false;
    return true;
  });

  return (
    <AppSidebar
      role="cashier"
      firstName={firstName}
      lastName={lastName}
      onLogout={onLogout}
      onProfile={onProfile}
    >
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 2, px: { xs: 1, sm: 2 }, pb: 6 }}>
        {/* Stats Section */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Paper elevation={3} sx={{
            flex: 1, minWidth: 180, p: 2, display: "flex", alignItems: "center", gap: 2,
            borderLeft: "5px solid #1976d2", bgcolor: "background.paper"
          }}>
            <PaymentIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Total Transactions</Typography>
              <Typography variant="h6" fontWeight={700}>{totalPayments}</Typography>
            </Box>
          </Paper>
          <Paper elevation={3} sx={{
            flex: 1, minWidth: 180, p: 2, display: "flex", alignItems: "center", gap: 2,
            borderLeft: "5px solid #43a047", bgcolor: "background.paper"
          }}>
            <PaidIcon color="success" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Total Sales</Typography>
              <Typography variant="h6" fontWeight={700}>{peso(totalSales)}</Typography>
            </Box>
          </Paper>
          <Paper elevation={3} sx={{
            flex: 1, minWidth: 180, p: 2, display: "flex", alignItems: "center", gap: 2,
            borderLeft: "5px solid #1976d2", bgcolor: "background.paper"
          }}>
            <AttachMoneyIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Paid</Typography>
              <Typography variant="h6" fontWeight={700}>{totalPaid}</Typography>
            </Box>
          </Paper>
          <Paper elevation={3} sx={{
            flex: 1, minWidth: 180, p: 2, display: "flex", alignItems: "center", gap: 2,
            borderLeft: "5px solid #fbc02d", bgcolor: "background.paper"
          }}>
            <MoneyOffIcon color="warning" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Unpaid</Typography>
              <Typography variant="h6" fontWeight={700}>{totalUnpaid}</Typography>
            </Box>
          </Paper>
        </Box>
        {/* Header Section */}
        <Paper sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          borderRadius: 3,
          boxShadow: 3,
          background: "linear-gradient(90deg, #f8fafc 60%, #e3f2fd 100%)"
        }}>
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
              Product Sales
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and process all product sales
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setAddDialogOpen(true)}
            sx={{
              minWidth: 140,
              borderRadius: 2,
              fontWeight: 600,
              bgcolor: "primary.main",
              ":hover": { bgcolor: "primary.dark" }
            }}
          >
            New Sale
          </Button>
        </Paper>

        {/* Search and Filter Controls */}
        <Paper sx={{
          p: { xs: 2, sm: 2 },
          mb: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <FilterAltIcon color="primary" sx={{ mr: 1 }} />
          <TextField
            label="From"
            type="date"
            size="small"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <Select
            value={customerFilter}
            onChange={e => setCustomerFilter(e.target.value)}
            size="small"
            displayEmpty
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Customers</MenuItem>
            {uniqueCustomers.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
          <Select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
            size="small"
            displayEmpty
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Products</MenuItem>
            {uniqueServices.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Search Customer"
            value={searchCustomer}
            onChange={e => setSearchCustomer(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "action.active" }} />
            }}
          />
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as "" | "paid" | "unpaid")}
            size="small"
            displayEmpty
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
          </Select>
          <Button
            variant="outlined"
            color="primary"
            onClick={fetchRecords}
            sx={{ ml: "auto", borderRadius: 2, minWidth: 44, px: 2, py: 1 }}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Paper>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Customer Name</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Quantities</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Cashier</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Payment Method</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map(r => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    transition: "background 0.2s",
                    "&:hover": { background: theme.palette.action.hover }
                  }}
                  onClick={() => handleRowClick(r)}
                >
                  <TableCell>{r.customerName}</TableCell>
                  <TableCell>
                    {/* Show all products in this transaction */}
                    {Array.isArray((r as any).products)
                      ? (r as any).products.map((p: any) => p.productName).join(", ")
                      : r.serviceName}
                  </TableCell>
                  <TableCell>
                    {Array.isArray((r as any).products)
                      ? (r as any).products.map((p: any) => p.quantity).join(", ")
                      : (r.quantity || 1)}
                  </TableCell>
                  <TableCell>{peso(r.price)}</TableCell>
                  <TableCell>
                    {r.cashierFullName
                      ? r.cashierFullName
                      : r.cashier}
                  </TableCell>
                  <TableCell>
                    {r.voided ? (
                      <Chip
                        label="Voided"
                        color="error"
                        size="small"
                        onClick={ev => ev.stopPropagation()}
                      />
                    ) : (
                      <Chip
                        label={r.paid ? "Paid" : "Unpaid"}
                        color={r.paid ? "success" : "warning"}
                        size="small"
                        onClick={ev => ev.stopPropagation()}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {PAYMENT_METHODS.find(m => m.key === r.paymentMethod)?.label || r.paymentMethod || "-"}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No sales records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* Add Product Sale Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Product Sale</DialogTitle>
        <DialogContent>
          {/* Customer selection: Autocomplete from loyaltyCustomers, or manual entry */}
          <Autocomplete
            options={loyaltyCustomers}
            getOptionLabel={option => typeof option === "string" ? option : option.name}
            value={selectedCustomer}
            onChange={(_, value) => {
              if (typeof value === "string") {
                setSelectedCustomer({ name: value });
                setCustomerInput(value);
              } else {
                setSelectedCustomer(value);
                setCustomerInput("");
              }
            }}
            inputValue={customerInput}
            onInputChange={(_, value, reason) => {
              setCustomerInput(value);
              if (!value) setSelectedCustomer(null);
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Customer (Select from Loyalty or type manually)"
                margin="normal"
                fullWidth
                helperText="Select a registered customer or type a name manually"
              />
            )}
            freeSolo
            sx={{ mb: 2 }}
          />
          {/* Manual input fallback if user wants to enter a name directly */}
          <TextField
            label="Customer Name (Manual Entry)"
            fullWidth
            margin="normal"
            value={customerInput}
            onChange={e => {
              setCustomerInput(e.target.value);
              setSelectedCustomer(null);
            }}
            placeholder="Type customer name if not in the list"
            sx={{ mb: 2 }}
          />

          {/* Product selection: Button to open product grid dialog */}
          <Button
            variant="outlined"
            fullWidth
            sx={{ my: 2 }}
            onClick={() => setProductSelectDialogOpen(true)}
          >
            {selectedProducts.length === 0
              ? "Select Products"
              : `Selected: ${selectedProducts.map(sp => {
                  const prod = products.find(p => p.id === sp.productId);
                  return prod?.name || "";
                }).filter(Boolean).join(", ")}`}
          </Button>

          {/* For each selected product, show quantity input */}
          {selectedProducts.map(sp => {
            const product = products.find(p => p.id === sp.productId);
            return (
              <Box key={sp.productId} sx={{ display: "flex", alignItems: "center", mb: 1, gap: 2 }}>
                <Typography sx={{ minWidth: 120 }}>{product?.name}</Typography>
                <TextField
                  label="Quantity"
                  type="number"
                  size="small"
                  value={sp.quantity}
                  onChange={e => handleProductQuantityChange(sp.productId, Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 100 }}
                />
                <Typography sx={{ minWidth: 80 }}>
                  {peso((product?.price || 0) * sp.quantity)}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveProduct(sp.productId)}
                >
                  Remove
                </Button>
              </Box>
            );
          })}

          <TextField
            label="Total Price"
            fullWidth
            margin="normal"
            value={calcTotalPrice()}
            InputProps={{
              startAdornment: <InputAdornment position="start">₱</InputAdornment>,
              readOnly: true
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleProcessPayment}
            disabled={
              selectedProducts.length === 0 ||
              calcTotalPrice() <= 0
            }
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Selection Grid Dialog */}
      <Dialog
        open={productSelectDialogOpen}
        onClose={() => setProductSelectDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Products</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />
            }}
            sx={{ mb: 2 }}
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: availableProducts.length === 0 ? "center" : "flex-start",
              minHeight: 120
            }}
          >
            {availableProducts.length === 0 && (
              <Box sx={{ width: "100%" }}>
                <Typography align="center" color="text.secondary">
                  No available products found.
                </Typography>
              </Box>
            )}
            {availableProducts.map(product => {
              const isSelected = selectedProducts.some(sp => sp.productId === product.id);
              return (
                <Box
                  key={product.id}
                  sx={{
                    width: { xs: "100%", sm: "47%", md: "30%" },
                    minWidth: 220,
                    maxWidth: 340,
                    flex: "1 1 220px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Paper
                    elevation={isSelected ? 6 : 1}
                    sx={{
                      p: 2,
                      border: isSelected ? "2px solid #1976d2" : "1px solid #e0e0e0",
                      bgcolor: isSelected ? "primary.50" : "background.paper",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s, border 0.2s",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveProduct(product.id);
                      } else {
                        handleProductSelect(product.id);
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {product.description}
                        </Typography>
                      )}
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        {peso(product.price)}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        color={isSelected ? "primary" : "inherit"}
                        size="small"
                        fullWidth
                        sx={{ fontWeight: 600 }}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductSelectDialogOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
      {/* Process Payment Dialog */}
      <Dialog open={processDialogOpen} onClose={() => { setProcessDialogOpen(false); setPayLater(false); setPayingRecordId(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          {!payLater && (
            <>
              <Select
                label="Payment Method"
                fullWidth
                value={formPaymentMethod}
                onChange={e => setFormPaymentMethod(e.target.value)}
                sx={{ mb: 2, mt: 1 }}
              >
                {PAYMENT_METHODS.map(m => (
                  <MenuItem key={m.key} value={m.key}>{m.label}</MenuItem>
                ))}
              </Select>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Total Amount: <b>{peso(calcTotalPrice())}</b>
              </Typography>
              <TextField
                label="Amount Tendered"
                fullWidth
                margin="normal"
                type="number"
                value={amountTendered}
                onChange={e => setAmountTendered(Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>
                }}
              />
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {[100, 200, 300, 500, 1000].map(q => (
                  <Button
                    key={q}
                    variant="outlined"
                    onClick={() => setAmountTendered(q)}
                    sx={{ minWidth: 80 }}
                  >
                    {peso(q)}
                  </Button>
                ))}
              </Box>
              <TextField
                label="Change"
                fullWidth
                margin="normal"
                value={change >= 0 ? peso(change) : "₱0"}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  readOnly: true
                }}
              />
            </>
          )}
          {!payingRecordId && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant={payLater ? "contained" : "outlined"}
                color="warning"
                fullWidth
                onClick={() => setPayLater(v => !v)}
              >
                {payLater ? "Pay Later Selected" : "Pay Later (Record as Unpaid)"}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {payLater
                  ? "This will record the sale as unpaid. You can process payment later."
                  : "Or choose to pay later if payment will be collected after delivery."}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setProcessDialogOpen(false); setPayLater(false); setPayingRecordId(null); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddPayment}
            disabled={
              payLater
                ? false
                : typeof amountTendered !== "number" ||
                  isNaN(amountTendered) ||
                  amountTendered < calcTotalPrice()
            }
          >
            {payLater ? "Record as Unpaid" : "Confirm Payment"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Payment Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Payment & Product Details</DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 1, sm: 3 } }}>
          {selectedRecord && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
                flexWrap: "wrap"
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Customer Name</Typography>
                  <Typography>{selectedRecord.customerName}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography>{new Date(selectedRecord.createdAt).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Cashier</Typography>
                  <Typography>
                    {selectedRecord.cashierFullName
                      ? selectedRecord.cashierFullName
                      : selectedRecord.cashier}
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
                    <Typography>{selectedRecord.serviceName}</Typography>
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
                flexDirection: isMobile ? "column" : "row",
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
                    {PAYMENT_METHODS.find(m => m.key === selectedRecord.paymentMethod)?.label || selectedRecord.paymentMethod || "-"}
                  </Typography>
                </Box>
              </Box>
              {selectedRecord.paid && (
                <Box sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppSidebar>
  );
};

export default PaymentServicesPage;
