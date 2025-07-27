import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip, Snackbar, Alert, Divider,
  useMediaQuery, useTheme, createTheme, ThemeProvider, CssBaseline, CircularProgress, Tooltip,
  InputAdornment
} from "@mui/material";
import { Add, Delete, Edit, People, Search } from "@mui/icons-material";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import AppSidebar from "./AppSidebar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    MuiCard: { // Although not directly used in this file yet, keeping for consistency if cards are added later
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
          backgroundColor: '#f5f5f5', // Light grey header for tables (hardcoded to avoid theme reference)
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#212121', // Use a hardcoded color instead of referencing theme.palette.text.primary
        },
      },
    },
  },
});

interface LoyaltyCustomer {
  id?: string;
  name: string;
  points?: number;
}

const LoyaltyProgramPage: React.FC<any> = (props) => {
  const {
    role = "cashier",
    onLogout,
    onProfile,
    firstName,
    lastName
  } = props;

  const navigate = useNavigate();
  const currentTheme = useTheme(); // Use currentTheme to avoid conflict with imported 'theme'
  const isSm = useMediaQuery(currentTheme.breakpoints.down("sm"));
  const isMd = useMediaQuery(currentTheme.breakpoints.down("md"));

  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCustomers()]);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "loyalty_customers"));
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoyaltyCustomer[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setSnackbar({ open: true, message: "Failed to load customers.", severity: "error" });
    }
  };

  const handleAddCustomer = async () => {
    if (!customerName.trim()) {
      setSnackbar({ open: true, message: "Please enter customer name.", severity: "error" });
      return;
    }
    try {
      await addDoc(collection(db, "loyalty_customers"), {
        name: customerName,
        points: 0 // initialize points to 0
      });
      setSnackbar({ open: true, message: "Customer registered successfully!", severity: "success" });
      setAddDialogOpen(false);
      setCustomerName("");
      fetchData(); // Refresh all data
    } catch (error) {
      console.error("Error adding customer:", error);
      setSnackbar({ open: true, message: "Failed to register customer.", severity: "error" });
    }
  };

  // Edit logic
  const handleEditClick = (customer: LoyaltyCustomer) => {
    setEditCustomerId(customer.id || null);
    setEditCustomerName(customer.name);
    setEditDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!editCustomerId) {
      setSnackbar({ open: true, message: "Customer ID is missing for update.", severity: "error" });
      return;
    }
    if (!editCustomerName.trim()) {
      setSnackbar({ open: true, message: "Please enter customer name.", severity: "error" });
      return;
    }
    try {
      await updateDoc(doc(db, "loyalty_customers", editCustomerId), {
        name: editCustomerName
      });
      setSnackbar({ open: true, message: "Customer updated successfully!", severity: "success" });
      setEditDialogOpen(false);
      setEditCustomerId(null);
      setEditCustomerName("");
      fetchData(); // Refresh all data
    } catch (error) {
      console.error("Error updating customer:", error);
      setSnackbar({ open: true, message: "Failed to update customer.", severity: "error" });
    }
  };

  // Delete logic (admin only)
  const handleDeleteClick = (customer: LoyaltyCustomer) => {
    setDeleteCustomerId(customer.id || null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!deleteCustomerId) {
      setSnackbar({ open: true, message: "Customer ID is missing for deletion.", severity: "error" });
      return;
    }
    try {
      await deleteDoc(doc(db, "loyalty_customers", deleteCustomerId));
      setSnackbar({ open: true, message: "Customer deleted successfully!", severity: "success" });
      setDeleteDialogOpen(false);
      setDeleteCustomerId(null);
      fetchData(); // Refresh all data
    } catch (error) {
      console.error("Error deleting customer:", error);
      setSnackbar({ open: true, message: "Failed to delete customer.", severity: "error" });
    }
  };

  // Filtered customers for search
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (a.name || "").localeCompare(b.name || "")); // Sort alphabetically by name

  // Stats
  const totalCustomers = customers.length;

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppSidebar
        role={role}
        onLogout={handleLogout}
        onProfile={onProfile}
        firstName={firstName}
        lastName={lastName}
      >
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
                  Loyalty Program
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage your loyal customers and their car wash history.
                </Typography>
              </Box>
              <Button
                onClick={() => setAddDialogOpen(true)}
                variant="contained"
                color="secondary"
                startIcon={<Add />}
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
              >
                Register Customer
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
              gridTemplateColumns: isMd ? "repeat(auto-fit, minmax(220px, 1fr))" : "repeat(auto-fit, minmax(250px, 1fr))",
              gap: currentTheme.spacing(3),
              marginBottom: currentTheme.spacing(4),
              justifyContent: "center",
            }}
          >
            <motion.div variants={itemVariants}>
              <Paper elevation={4} sx={{
                flex: 1, minWidth: 180, p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.info.main}`,
                borderRadius: 3, bgcolor: "background.paper",
              }}>
                <People color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Customers</Typography>
                  {loading ? <CircularProgress size={24} /> : <Typography variant="h5" fontWeight={700}>{totalCustomers}</Typography>}
                </Box>
              </Paper>
            </motion.div>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={itemVariants}>
            <TextField
              label="Search Customer Name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                bgcolor: "background.paper",
                borderRadius: 3, // More rounded search bar
                boxShadow: currentTheme.shadows[1], // Subtle shadow
                "& .MuiOutlinedInput-root": { borderRadius: 3 },
                "&:hover": {
                  boxShadow: currentTheme.shadows[3], // Elevate on hover
                },
              }}
            />
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants}>
            <TableContainer component={Paper} sx={{
              borderRadius: 3,
              boxShadow: currentTheme.shadows[2],
              overflow: "auto", // allow horizontal scroll on mobile
              border: `1px solid ${currentTheme.palette.divider}`,
            }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: currentTheme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>Customer Name</TableCell>
                    {/* Hide Actions column header on xs screens, show on sm+ */}
                    {!isSm && (
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }} align="right">Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isSm ? 3 : 4} align="center" sx={{ py: 5 }}>
                        <CircularProgress color="primary" />
                        <Typography sx={{ mt: 2, color: "text.secondary" }}>Loading Customers...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isSm ? 3 : 4} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                          No customers found.
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => setAddDialogOpen(true)}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            color: "primary.main",
                            borderColor: "primary.main",
                            "&:hover": {
                              borderColor: "primary.dark",
                              bgcolor: "primary.light",
                              color: "primary.contrastText",
                            },
                          }}
                        >
                          Register New Customer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map(c => (
                      <TableRow
                        key={c.id}
                        hover
                        sx={{
                          transition: "background 0.2s",
                          "&:hover": { bgcolor: currentTheme.palette.action.hover }
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={600}>{c.name}</Typography>
                        </TableCell>
                        {/* Actions column: show as column on sm+, as row of buttons below on xs */}
                        {!isSm ? (
                          <TableCell align="right">
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                              <Tooltip title="Edit Customer">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEditClick(c)}
                                  size="small"
                                  sx={{ bgcolor: currentTheme.palette.primary.light, ":hover": { bgcolor: currentTheme.palette.primary.main, color: "#fff" } }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {role === "admin" && (
                                <Tooltip title="Delete Customer">
                                  <IconButton 
                                    color="error"
                                    onClick={() => handleDeleteClick(c)}
                                    size="small"
                                    sx={{ bgcolor: currentTheme.palette.error.light, ":hover": { bgcolor: currentTheme.palette.error.main, color: "#fff" } }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        ) : (
                          // On mobile, show actions as a row below the main row
                          <TableCell
                            colSpan={3}
                            sx={{
                              px: 0,
                              py: 0,
                              border: 0,
                              background: "transparent"
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                              <Tooltip title="Edit Customer">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEditClick(c)}
                                  size="small"
                                  sx={{ bgcolor: currentTheme.palette.primary.light, ":hover": { bgcolor: currentTheme.palette.primary.main, color: "#fff" } }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {role === "admin" && (
                                <Tooltip title="Delete Customer">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDeleteClick(c)}
                                    size="small"
                                    sx={{ bgcolor: currentTheme.palette.error.light, ":hover": { bgcolor: currentTheme.palette.error.main, color: "#fff" } }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        </Box>

        {/* Add Customer Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1, color: currentTheme.palette.primary.dark }}>Register New Customer</DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              label="Customer Name"
              fullWidth
              margin="normal"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              autoFocus
              inputProps={{ maxLength: 40 }}
              helperText="Enter the full name of the customer"
              variant="outlined" // Ensure consistent variant
            />
          </DialogContent>
          <Divider sx={{ mt: 2 }} />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAddDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
            <Button variant="contained" onClick={handleAddCustomer} sx={{ borderRadius: 2, fontWeight: 600 }}>Register</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1, color: currentTheme.palette.primary.dark }}>Edit Customer</DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              label="Customer Name"
              fullWidth
              margin="normal"
              value={editCustomerName}
              onChange={e => setEditCustomerName(e.target.value)}
              inputProps={{ maxLength: 40 }}
              helperText="Edit the customer's name"
              variant="outlined"
            />
          </DialogContent>
          <Divider sx={{ mt: 2 }} />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateCustomer} sx={{ borderRadius: 2, fontWeight: 600 }}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Customer Dialog (admin only) */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, color: currentTheme.palette.error.dark }}>Delete Customer</DialogTitle>
          <Divider />
          <DialogContent>
            <Typography sx={{ mt: 2, mb: 2, color: currentTheme.palette.text.secondary }}>
              Are you sure you want to delete this customer? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteCustomer} sx={{ borderRadius: 2, fontWeight: 600 }}>Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </AppSidebar>
    </ThemeProvider>
  );
};

export default LoyaltyProgramPage;
