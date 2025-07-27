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
  IconButton,
  Chip,
  Tooltip,
  Divider,
  useTheme, // Added useTheme
  useMediaQuery, // Added useMediaQuery
  Stack, // Added Stack for consistent spacing
  CircularProgress, // Added for loading states
  Skeleton, // Added for loading states
  createTheme, // Import createTheme for consistency
  ThemeProvider, // Import ThemeProvider
  CssBaseline, // Import CssBaseline
  InputAdornment, // For TextField adornments
} from "@mui/material";
import {
  Add as AddIcon, // Renamed for consistency
  Edit as EditIcon, // Renamed for consistency
  Delete as DeleteIcon, // Renamed for consistency
  Science as ScienceIcon, // Renamed for consistency
  Inventory2 as Inventory2Icon, // Renamed for consistency
  Close as CloseIcon, // For dialog close buttons
  Check as CheckIcon, // For dialog save buttons
  Refresh as RefreshIcon, // For refresh button
} from "@mui/icons-material";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Assuming correct path to firebase config
import AppSidebar from "./AppSidebar"; // Assuming correct path to AppSidebar
import { motion } from "framer-motion"; // Import motion for animations

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
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#333',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: '#e0e0e0',
        },
        bar: {
          borderRadius: 4,
          backgroundColor: '#ef5350',
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
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          fontWeight: 500,
        },
      },
    },
  },
});

interface Chemical {
  id?: string;
  name: string;
  stock: number; // in ml
  unit?: string; // e.g. ml, L
  description?: string;
}

const ChemicalsInventoryPage: React.FC<{
  onLogout?: () => void;
  onProfile?: () => void;
  firstName?: string;
  lastName?: string;
}> = ({ onLogout, onProfile, firstName, lastName }) => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Added delete dialog state
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [newChemical, setNewChemical] = useState<{ name: string; stock: number; unit: string; description: string }>({
    name: "",
    stock: 0,
    unit: "ml",
    description: ""
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // Validation states for Add/Edit forms
  const [addFormErrors, setAddFormErrors] = useState({ name: false, stock: false });
  const [editFormErrors, setEditFormErrors] = useState({ name: false, stock: false });

  const currentTheme = useTheme(); // Use currentTheme to access theme properties
  const isSm = useMediaQuery(currentTheme.breakpoints.down("sm"));
  const isMd = useMediaQuery(currentTheme.breakpoints.down("md"));

  useEffect(() => {
    fetchChemicals();
  }, []);

  const fetchChemicals = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "chemicals"));
      setChemicals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chemical[]);
    } catch (error) {
      console.error("Error fetching chemicals:", error);
      setSnackbar({ open: true, message: "Failed to load chemicals", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddChemical = async () => {
    const errors = {
      name: !newChemical.name.trim(),
      stock: newChemical.stock <= 0, // Stock must be positive
    };
    setAddFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setSnackbar({ open: true, message: "Please fill in all required fields correctly.", severity: "error" });
      return;
    }

    try {
      await addDoc(collection(db, "chemicals"), newChemical);
      setSnackbar({ open: true, message: "Chemical added successfully!", severity: "success" });
      setAddDialogOpen(false);
      setNewChemical({ name: "", stock: 0, unit: "ml", description: "" });
      setAddFormErrors({ name: false, stock: false }); // Reset errors
      fetchChemicals();
    } catch (error) {
      console.error("Error adding chemical:", error);
      setSnackbar({ open: true, message: "Failed to add chemical", severity: "error" });
    }
  };

  const handleEditChemical = async () => {
    if (!selectedChemical) return;

    const errors = {
      name: !selectedChemical.name.trim(),
      stock: selectedChemical.stock <= 0, // Stock must be positive
    };
    setEditFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setSnackbar({ open: true, message: "Please fill in all required fields correctly.", severity: "error" });
      return;
    }

    try {
      await updateDoc(doc(db, "chemicals", selectedChemical.id!), {
        name: selectedChemical.name,
        stock: selectedChemical.stock,
        unit: selectedChemical.unit,
        description: selectedChemical.description
      });
      setSnackbar({ open: true, message: "Chemical updated successfully!", severity: "success" });
      setEditDialogOpen(false);
      setSelectedChemical(null);
      setEditFormErrors({ name: false, stock: false }); // Reset errors
      fetchChemicals();
    } catch (error) {
      console.error("Error updating chemical:", error);
      setSnackbar({ open: true, message: "Failed to update chemical", severity: "error" });
    }
  };

  const handleDeleteChemical = (chemical: Chemical) => {
    setSelectedChemical(chemical);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteChemical = async () => {
    if (!selectedChemical || !selectedChemical.id) return;
    try {
      await deleteDoc(doc(db, "chemicals", selectedChemical.id));
      setSnackbar({ open: true, message: "Chemical deleted successfully!", severity: "success" });
      setDeleteDialogOpen(false);
      setSelectedChemical(null);
      fetchChemicals();
    } catch (error) {
      console.error("Error deleting chemical:", error);
      setSnackbar({ open: true, message: "Failed to delete chemical", severity: "error" });
    }
  };

  // Stats
  const totalChemicals = chemicals.length;
  const totalStock = chemicals.reduce((sum, c) => sum + (c.stock || 0), 0);

  // Determine chip color based on stock level
  const getStockChipColor = (stock: number) => {
    if (stock <= 0) return 'error';
    if (stock < 1000) return 'warning'; // Example: less than 1 liter is low
    return 'success';
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

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
    hover: { scale: 1.03, boxShadow: currentTheme.shadows[6] }
  };

  return (
    <ThemeProvider theme={theme}> {/* Apply the custom theme */}
      <CssBaseline /> {/* Apply base CSS for consistent styling */}
      <AppSidebar role="admin" firstName={firstName} lastName={lastName} onLogout={onLogout} onProfile={onProfile}>
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            mt: { xs: 2, sm: 3, md: 4 }, // Responsive margin top
            px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            pb: 4,
            width: "100%",
            minHeight: "calc(100vh - 64px)", // ensures content fills viewport
            boxSizing: "border-box",
            transition: "margin-left 0.3s",
          }}
        >
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
                borderRadius: 4,
                boxShadow: currentTheme.shadows[6],
                background: `linear-gradient(135deg, ${currentTheme.palette.warning.light} 0%, ${currentTheme.palette.warning.main} 100%)`, // Warning gradient for inventory
                color: currentTheme.palette.warning.contrastText,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant={isSm ? "h5" : "h3"} fontWeight={700} gutterBottom>
                  <ScienceIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: isSm ? 30 : 40 }} />
                  Chemicals Inventory
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage your chemical stock levels and details.
                </Typography>
              </Box>
              <Button
                onClick={fetchChemicals}
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
                {loading ? "Loading..." : "Refresh Data"}
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
              gridTemplateColumns: isSm ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
              gap: currentTheme.spacing(3),
              marginBottom: currentTheme.spacing(4),
              justifyContent: "center",
            }}
          >
            <motion.div variants={statCardVariants} whileHover="hover">
              <Paper elevation={4} sx={{
                flex: 1, minWidth: 180, p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.info.main}`, // Info color border
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <Box sx={{ p: 1.5, bgcolor: currentTheme.palette.info.light, borderRadius: '50%', color: currentTheme.palette.info.dark, boxShadow: currentTheme.shadows[2] }}>
                  <ScienceIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Chemicals</Typography>
                  <Typography variant="h5" fontWeight={700} color={currentTheme.palette.info.dark}>{loading ? <CircularProgress size={24} /> : totalChemicals}</Typography>
                </Box>
              </Paper>
            </motion.div>
            <motion.div variants={statCardVariants} whileHover="hover">
              <Paper elevation={4} sx={{
                flex: 1, minWidth: 180, p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.success.main}`, // Success color border
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <Box sx={{ p: 1.5, bgcolor: currentTheme.palette.success.light, borderRadius: '50%', color: currentTheme.palette.success.dark, boxShadow: currentTheme.shadows[2] }}>
                  <Inventory2Icon sx={{ fontSize: 36 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Stock</Typography>
                  <Typography variant="h5" fontWeight={700} color={currentTheme.palette.success.dark}>{loading ? <CircularProgress size={24} /> : `${totalStock.toLocaleString()} ml`}</Typography>
                </Box>
              </Paper>
            </motion.div>
          </motion.div>

          {/* Add Chemical Button Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Paper sx={{
              p: { xs: 2, sm: 3 },
              mb: { xs: 2, sm: 3 },
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end", // Align to right
              borderRadius: 3,
              boxShadow: currentTheme.shadows[2],
              bgcolor: "background.paper"
            }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  height: 48, // Consistent height
                  bgcolor: currentTheme.palette.primary.main,
                  ":hover": { bgcolor: currentTheme.palette.primary.dark },
                  boxShadow: currentTheme.shadows[3],
                  "&:hover": {
                    boxShadow: currentTheme.shadows[6],
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Add New Chemical
              </Button>
            </Paper>
          </motion.div>

          {/* Chemicals Table */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <TableContainer component={Paper} elevation={4} sx={{
              borderRadius: 3,
              boxShadow: currentTheme.shadows[4],
              border: "1px solid",
              borderColor: currentTheme.palette.divider,
              overflow: "auto", // allow horizontal scroll on mobile
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: currentTheme.shadows[6],
              }
            }}>
              {loading ? (
                <Box sx={{ p: 3 }}>
                  {[...Array(5)].map((_, index) => (
                    <Skeleton 
                      key={index} 
                      variant="rectangular" 
                      height={isSm ? 60 : 72}
                      sx={{ 
                        mb: 1, 
                        borderRadius: 1,
                        bgcolor: currentTheme.palette.grey[200]
                      }} 
                    />
                  ))}
                </Box>
              ) : (
                <Table size={isSm ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: currentTheme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Stock</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Description</TableCell>
                      {/* Hide Actions column header on xs screens, show on sm+ */}
                      {!isSm && (
                        <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }} align="right">Actions</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chemicals.map(c => (
                      <TableRow
                        key={c.id}
                        hover
                        sx={{
                          transition: "background 0.2s",
                          "&:hover": { bgcolor: currentTheme.palette.action.hover },
                          '&:last-child td': { borderBottom: 0 }
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={600}>{c.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${c.stock.toLocaleString()} ${c.unit || "ml"}`}
                            color={getStockChipColor(c.stock)}
                            sx={{ fontWeight: 600, px: 1, minWidth: 80, justifyContent: 'center' }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography>{c.unit || "ml"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={c.description || "No description provided"}>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.description || "-"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        {/* Actions column: show as column on sm+, as row of buttons below on xs */}
                        {!isSm ? (
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Edit Chemical">
                                <IconButton onClick={() => { setSelectedChemical(c); setEditFormErrors({ name: false, stock: false }); setEditDialogOpen(true); }}
                                  size={isSm ? "small" : "medium"}
                                  sx={{
                                    bgcolor: currentTheme.palette.primary.light,
                                    color: currentTheme.palette.primary.dark,
                                    boxShadow: currentTheme.shadows[1],
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                      backgroundColor: currentTheme.palette.primary.main,
                                      color: currentTheme.palette.common.white,
                                      transform: 'scale(1.1)',
                                      boxShadow: currentTheme.shadows[3],
                                    }
                                  }}>
                                  <EditIcon fontSize={isSm ? "small" : "medium"} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Chemical">
                                <IconButton color="error" onClick={() => handleDeleteChemical(c)}
                                  size={isSm ? "small" : "medium"}
                                  sx={{
                                    bgcolor: currentTheme.palette.error.light,
                                    color: currentTheme.palette.error.dark,
                                    boxShadow: currentTheme.shadows[1],
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                      backgroundColor: currentTheme.palette.error.main,
                                      color: currentTheme.palette.common.white,
                                      transform: 'scale(1.1)',
                                      boxShadow: currentTheme.shadows[3],
                                    }
                                  }}>
                                  <DeleteIcon fontSize={isSm ? "small" : "medium"} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        ) : (
                          // On mobile, show actions as a row below the main row
                          <TableCell
                            colSpan={4}
                            sx={{
                              px: 0,
                              py: 0,
                              border: 0,
                              background: "transparent"
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                              <Tooltip title="Edit Chemical">
                                <IconButton onClick={() => { setSelectedChemical(c); setEditFormErrors({ name: false, stock: false }); setEditDialogOpen(true); }}
                                  size="small"
                                  sx={{
                                    bgcolor: currentTheme.palette.primary.light,
                                    color: currentTheme.palette.primary.dark,
                                    boxShadow: currentTheme.shadows[1],
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                      backgroundColor: currentTheme.palette.primary.main,
                                      color: currentTheme.palette.common.white,
                                      transform: 'scale(1.1)',
                                      boxShadow: currentTheme.shadows[3],
                                    }
                                  }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Chemical">
                                <IconButton color="error" onClick={() => handleDeleteChemical(c)}
                                  size="small"
                                  sx={{
                                    bgcolor: currentTheme.palette.error.light,
                                    color: currentTheme.palette.error.dark,
                                    boxShadow: currentTheme.shadows[1],
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                      backgroundColor: currentTheme.palette.error.main,
                                      color: currentTheme.palette.common.white,
                                      transform: 'scale(1.1)',
                                      boxShadow: currentTheme.shadows[3],
                                    }
                                  }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {chemicals.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={isSm ? 4 : 5} align="center" sx={{ py: 5 }}>
                          <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1
                          }}>
                            <ScienceIcon
                              fontSize="large"
                              color="disabled"
                              sx={{ fontSize: 48, mb: 1 }}
                            />
                            <Typography variant="h6" color="text.secondary">
                              No chemicals found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click 'Add New Chemical' to start managing your inventory.
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => setAddDialogOpen(true)}
                              sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
                            >
                              Add New Chemical
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </motion.div>
        </Box>

        {/* Add Chemical Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setNewChemical({ name: "", stock: 0, unit: "ml", description: "" }); setAddFormErrors({ name: false, stock: false }); }} // Reset form and errors on close
          maxWidth="sm"
          fullWidth
          fullScreen={isSm} // Full screen on small mobile
          PaperProps={{ sx: { borderRadius: isSm ? 0 : 3, boxShadow: currentTheme.shadows[8] } }}
        >
          <DialogTitle sx={{
            fontWeight: 700,
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: currentTheme.palette.primary.main,
            borderBottom: `1px solid ${currentTheme.palette.divider}`,
            mb: 2,
          }}>
            Add New Chemical
            <IconButton
              onClick={() => { setAddDialogOpen(false); setNewChemical({ name: "", stock: 0, unit: "ml", description: "" }); setAddFormErrors({ name: false, stock: false }); }}
              sx={{ color: currentTheme.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Chemical Name"
                fullWidth
                variant="outlined" // Consistent variant
                value={newChemical.name}
                onChange={e => setNewChemical({ ...newChemical, name: e.target.value })}
                inputProps={{ maxLength: 40 }}
                helperText={addFormErrors.name ? "Chemical name is required" : "Enter the chemical's name"}
                error={addFormErrors.name}
                autoFocus
              />
              <TextField
                label="Stock"
                type="number"
                fullWidth
                variant="outlined" // Consistent variant
                value={newChemical.stock}
                onChange={e => setNewChemical({ ...newChemical, stock: Number(e.target.value) })}
                inputProps={{ min: 0 }}
                helperText={addFormErrors.stock ? "Stock must be a positive number" : "Amount in stock"}
                error={addFormErrors.stock}
              />
              <TextField
                label="Unit"
                fullWidth
                variant="outlined" // Consistent variant
                value={newChemical.unit}
                onChange={e => setNewChemical({ ...newChemical, unit: e.target.value })}
                placeholder="ml"
                inputProps={{ maxLength: 10 }}
                helperText="e.g. ml, L (optional)"
              />
              <TextField
                label="Description"
                fullWidth
                variant="outlined" // Consistent variant
                value={newChemical.description}
                onChange={e => setNewChemical({ ...newChemical, description: e.target.value })}
                multiline
                minRows={2}
                inputProps={{ maxLength: 120 }}
                helperText="Optional description for the chemical"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setAddDialogOpen(false); setNewChemical({ name: "", stock: 0, unit: "ml", description: "" }); setAddFormErrors({ name: false, stock: false }); }} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddChemical} sx={{ borderRadius: 2, fontWeight: 600 }} startIcon={<CheckIcon />}>
              Add Chemical
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Chemical Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => { setEditDialogOpen(false); setSelectedChemical(null); setEditFormErrors({ name: false, stock: false }); }} // Reset form and errors on close
          maxWidth="sm"
          fullWidth
          fullScreen={isSm} // Full screen on small mobile
          PaperProps={{ sx: { borderRadius: isSm ? 0 : 3, boxShadow: currentTheme.shadows[8] } }}
        >
          <DialogTitle sx={{
            fontWeight: 700,
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: currentTheme.palette.primary.main,
            borderBottom: `1px solid ${currentTheme.palette.divider}`,
            mb: 2,
          }}>
            Edit Chemical
            <IconButton
              onClick={() => { setEditDialogOpen(false); setSelectedChemical(null); setEditFormErrors({ name: false, stock: false }); }}
              sx={{ color: currentTheme.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Chemical Name"
                fullWidth
                variant="outlined"
                value={selectedChemical?.name || ""}
                onChange={e => setSelectedChemical(selectedChemical ? { ...selectedChemical, name: e.target.value } : null)}
                inputProps={{ maxLength: 40 }}
                helperText={editFormErrors.name ? "Chemical name is required" : "Edit the chemical's name"}
                error={editFormErrors.name}
                autoFocus
              />
              <TextField
                label="Stock"
                type="number"
                fullWidth
                variant="outlined"
                value={selectedChemical?.stock || 0}
                onChange={e => setSelectedChemical(selectedChemical ? { ...selectedChemical, stock: Number(e.target.value) } : null)}
                inputProps={{ min: 0 }}
                helperText={editFormErrors.stock ? "Stock must be a positive number" : "Amount in stock"}
                error={editFormErrors.stock}
              />
              <TextField
                label="Unit"
                fullWidth
                variant="outlined"
                value={selectedChemical?.unit || ""}
                onChange={e => setSelectedChemical(selectedChemical ? { ...selectedChemical, unit: e.target.value } : null)}
                placeholder="ml"
                inputProps={{ maxLength: 10 }}
                helperText="e.g. ml, L (optional)"
              />
              <TextField
                label="Description"
                fullWidth
                variant="outlined"
                value={selectedChemical?.description || ""}
                onChange={e => setSelectedChemical(selectedChemical ? { ...selectedChemical, description: e.target.value } : null)}
                multiline
                minRows={2}
                inputProps={{ maxLength: 120 }}
                helperText="Optional description for the chemical"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setEditDialogOpen(false); setSelectedChemical(null); setEditFormErrors({ name: false, stock: false }); }} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleEditChemical} sx={{ borderRadius: 2, fontWeight: 600 }} startIcon={<CheckIcon />}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Chemical Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          fullScreen={isSm}
          PaperProps={{ sx: { borderRadius: isSm ? 0 : 3, boxShadow: currentTheme.shadows[8] } }}
        >
          <DialogTitle sx={{
            fontWeight: 700,
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: currentTheme.palette.error.main,
            borderBottom: `1px solid ${currentTheme.palette.divider}`,
            mb: 2,
          }}>
            Confirm Deletion
            <IconButton
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ color: currentTheme.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 1, pb: 1 }}>
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 2
            }}>
              <DeleteIcon sx={{ fontSize: 64, color: currentTheme.palette.error.main, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} color={currentTheme.palette.text.primary}>
                Delete chemical "{selectedChemical?.name}"?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone. All associated data will be permanently removed.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button color="error" variant="contained" onClick={confirmDeleteChemical} sx={{ borderRadius: 2, fontWeight: 600 }} startIcon={<DeleteIcon />}>
              Delete Permanently
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{ width: "100%", borderRadius: 2, boxShadow: currentTheme.shadows[3] }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </AppSidebar>
    </ThemeProvider>
  );
};

export default ChemicalsInventoryPage;
