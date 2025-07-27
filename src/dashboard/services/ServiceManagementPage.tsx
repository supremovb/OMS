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
  Tooltip,
  InputAdornment,
  Stack,
  useMediaQuery,
  useTheme,
  createTheme,
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  Skeleton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Inventory2 as InventoryIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import AppSidebar from "../AppSidebar";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
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

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  available?: boolean;
  stock: number; // Add stock field
}

interface ProductManagementPageProps {
  onLogout?: () => void;
  onProfile?: () => void;
  firstName?: string;
  lastName?: string;
}

const peso = (v: number) => `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
};
const addProduct = async (product: Omit<Product, "id">) => {
  await addDoc(collection(db, "products"), product);
};
const updateProduct = async (product: Product) => {
  await updateDoc(doc(db, "products", product.id), {
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    cost: product.cost,
    available: product.available ?? false,
    stock: product.stock, // Save stock
  });
};
const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, "products", id));
};

// Helper to reduce stock after sale
export const reduceProductStock = async (productId: string, quantity: number) => {
  const productRef = doc(db, "products", productId);
  const productSnap = await getDocs(collection(db, "products"));
  const product = productSnap.docs.find(d => d.id === productId)?.data() as Product | undefined;
  if (!product) return;
  const newStock = Math.max(0, (product.stock || 0) - quantity);
  await updateDoc(productRef, { stock: newStock });
}

const ProductManagementPage: React.FC<ProductManagementPageProps> = ({
  onLogout,
  onProfile,
  firstName,
  lastName
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<{ name: string; description: string; price: number; cost: number; available: boolean; stock: number }>({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    available: true,
    stock: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "info" });
  const [search, setSearch] = useState("");
  const [addFormErrors, setAddFormErrors] = useState({ name: false, price: false, cost: false, stock: false });
  const [editFormErrors, setEditFormErrors] = useState({ name: false, price: false, cost: false, stock: false });

  const currentTheme = useTheme();
  const isSm = useMediaQuery(currentTheme.breakpoints.down("sm"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
      setSnackbar({ open: true, message: "Failed to load data", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const productsData = await getProducts();
    setProducts(productsData);
  };

  // Filter by search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    (product.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = async () => {
    const errors = {
      name: !newProduct.name.trim(),
      price: isNaN(newProduct.price) || newProduct.price <= 0,
      cost: isNaN(newProduct.cost) || newProduct.cost < 0,
      stock: isNaN(newProduct.stock) || newProduct.stock < 0,
    };
    setAddFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setSnackbar({ open: true, message: "Please fill in all required fields.", severity: "error" });
      return;
    }

    try {
      await addProduct({
        name: newProduct.name,
        description: newProduct.description ?? "",
        price: newProduct.price,
        cost: newProduct.cost,
        available: newProduct.available,
        stock: newProduct.stock,
      });
      setSnackbar({ open: true, message: "Product added successfully!", severity: "success" });
      setAddDialogOpen(false);
      setNewProduct({ name: "", description: "", price: 0, cost: 0, available: true, stock: 0 });
      setAddFormErrors({ name: false, price: false, cost: false, stock: false });
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      setSnackbar({ open: true, message: "Failed to add product", severity: "error" });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct({ ...product, available: product.available ?? true });
    setEditFormErrors({ name: false, price: false, cost: false, stock: false });
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    const errors = {
      name: !selectedProduct.name.trim(),
      price: isNaN(selectedProduct.price) || selectedProduct.price <= 0,
      cost: isNaN(selectedProduct.cost) || selectedProduct.cost < 0,
      stock: isNaN(selectedProduct.stock) || selectedProduct.stock < 0,
    };
    setEditFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setSnackbar({ open: true, message: "Please fill in all required fields.", severity: "error" });
      return;
    }

    try {
      await updateProduct({
        ...selectedProduct,
        description: selectedProduct.description ?? "",
        available: selectedProduct.available ?? true,
      });
      setSnackbar({ open: true, message: "Product updated successfully!", severity: "success" });
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setEditFormErrors({ name: false, price: false, cost: false, stock: false });
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      setSnackbar({ open: true, message: "Failed to update product", severity: "error" });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      setSnackbar({ open: true, message: "Product deleted successfully!", severity: "success" });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setSnackbar({ open: true, message: "Failed to delete product", severity: "error" });
    }
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppSidebar
        role="admin"
        firstName={firstName}
        lastName={lastName}
        onLogout={onLogout}
        onProfile={onProfile}
      >
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            mt: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: 4,
            width: "100%",
            minHeight: "calc(100vh - 64px)",
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
                background: `linear-gradient(135deg, ${currentTheme.palette.info.light} 0%, ${currentTheme.palette.info.main} 100%)`,
                color: currentTheme.palette.info.contrastText,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant={isSm ? "h5" : "h3"} fontWeight={700} gutterBottom>
                  <InventoryIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: isSm ? 30 : 40 }} />
                  Product Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage your military supply products.
                </Typography>
              </Box>
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
                p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.primary.main}`,
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <Box sx={{ p: 1.5, bgcolor: currentTheme.palette.primary.light, borderRadius: '50%', color: currentTheme.palette.primary.dark, boxShadow: currentTheme.shadows[2] }}>
                  <InventoryIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Products</Typography>
                  <Typography variant="h5" fontWeight={700} color={currentTheme.palette.primary.dark}>{loading ? <CircularProgress size={24} /> : products.length}</Typography>
                </Box>
              </Paper>
            </motion.div>
          </motion.div>

          {/* Search and Add Product Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                mb: { xs: 2, sm: 3 },
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                borderRadius: 3,
                boxShadow: currentTheme.shadows[2],
                background: currentTheme.palette.background.paper
              }}
            >
              <TextField
                size="medium"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    background: currentTheme.palette.background.default,
                  }
                }}
                sx={{
                  minWidth: { xs: "100%", sm: 250 },
                  flex: 1
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
                sx={{
                  minWidth: { xs: "100%", sm: 180 },
                  fontWeight: 700,
                  borderRadius: 2.5,
                  height: 48,
                  bgcolor: currentTheme.palette.primary.main,
                  ":hover": { bgcolor: currentTheme.palette.primary.dark },
                  boxShadow: currentTheme.shadows[3],
                  "&:hover": {
                    boxShadow: currentTheme.shadows[6],
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {isSm ? "Add Product" : "Add New Product"}
              </Button>
            </Paper>
          </motion.div>

          {/* Products Table */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <TableContainer
              component={Paper}
              elevation={4}
              sx={{
                borderRadius: 3,
                boxShadow: currentTheme.shadows[4],
                overflowX: "auto",
                maxWidth: "100%",
                minHeight: 200,
                border: "1px solid",
                borderColor: currentTheme.palette.divider,
                bgcolor: "background.paper",
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: currentTheme.shadows[6],
                }
              }}
            >
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
                <Table
                  size={isSm ? "small" : "medium"}
                  sx={{
                    minWidth: 700,
                    "& th, & td": {
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      maxWidth: isSm ? 90 : 180,
                    },
                    "& th": {
                      fontWeight: 700,
                      background: currentTheme.palette.grey[100],
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      fontSize: '1rem',
                      color: currentTheme.palette.text.primary,
                    },
                    "& tr": {
                      transition: "background 0.2s"
                    },
                    "& tr:hover": {
                      background: currentTheme.palette.action.hover
                    }
                  }}
                  stickyHeader
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Cost</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map(product => (
                      <TableRow key={product.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, maxWidth: 160 }}>
                          <Typography noWrap title={product.name}>{product.name}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            title={product.description}
                          >
                            {product.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={500}>
                            {peso(product.price)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={500} color="text.secondary">
                            {peso(product.cost)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color={product.stock === 0 ? "error.main" : "success.main"}>
                            {product.stock}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Edit Product">
                              <IconButton
                                color="primary"
                                onClick={() => handleEditProduct(product)}
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
                                }}
                              >
                                <EditIcon fontSize={isSm ? "small" : "medium"} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Product">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteProduct(product)}
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
                                }}
                              >
                                <DeleteIcon fontSize={isSm ? "small" : "medium"} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1
                          }}>
                            <InventoryIcon
                              fontSize="large"
                              color="disabled"
                              sx={{ fontSize: 48, mb: 1 }}
                            />
                            <Typography variant="h6" color="text.secondary">
                              No products found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {search.trim() ? "Try a different search." : "Click 'Add Product' to get started!"}
                            </Typography>
                            {(!search.trim()) && (
                              <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setAddDialogOpen(true)}
                                sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
                              >
                                Add Product
                              </Button>
                            )}
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

        {/* Add Product Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setAddFormErrors({ name: false, price: false, cost: false, stock: false }); }}
          maxWidth="sm"
          fullWidth
          fullScreen={isSm}
          PaperProps={{
            sx: { borderRadius: isSm ? 0 : 3, boxShadow: currentTheme.shadows[8] }
          }}
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
            Add New Product
            <IconButton
              onClick={() => { setAddDialogOpen(false); setAddFormErrors({ name: false, price: false, cost: false, stock: false }); }}
              sx={{ color: currentTheme.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers={false} sx={{ py: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Product Name"
                fullWidth
                variant="outlined"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                error={addFormErrors.name}
                helperText={addFormErrors.name ? "Product name is required" : ""}
                autoFocus
              />
              <TextField
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                error={false}
                helperText="Optional"
              />
              <TextField
                label="Price"
                fullWidth
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  inputProps: { min: 0 }
                }}
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                error={addFormErrors.price}
                helperText={addFormErrors.price ? "Price is required and must be greater than 0" : ""}
              />
              <TextField
                label="Cost"
                fullWidth
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  inputProps: { min: 0 }
                }}
                value={newProduct.cost}
                onChange={e => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                error={addFormErrors.cost}
                helperText={addFormErrors.cost ? "Cost is required and must be 0 or greater" : ""}
              />
              <TextField
                label="Stock"
                fullWidth
                variant="outlined"
                type="number"
                InputProps={{
                  inputProps: { min: 0 }
                }}
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                error={addFormErrors.stock}
                helperText={addFormErrors.stock ? "Stock is required and must be 0 or greater" : ""}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newProduct.available}
                    onChange={e => setNewProduct({ ...newProduct, available: e.target.checked })}
                    color="primary"
                  />
                }
                label="Available for Sale"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setAddDialogOpen(false); setAddFormErrors({ name: false, price: false, cost: false, stock: false }); }} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddProduct} sx={{ borderRadius: 2, fontWeight: 600 }} startIcon={<CheckIcon />}>
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => { setEditDialogOpen(false); setEditFormErrors({ name: false, price: false, cost: false, stock: false }); }}
          maxWidth="sm"
          fullWidth
          fullScreen={isSm}
          PaperProps={{
            sx: { borderRadius: isSm ? 0 : 3, boxShadow: currentTheme.shadows[8] }
          }}
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
            Edit Product
            <IconButton
              onClick={() => { setEditDialogOpen(false); setEditFormErrors({ name: false, price: false, cost: false, stock: false }); }}
              sx={{ color: currentTheme.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers={false} sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Product Name"
                fullWidth
                variant="outlined"
                value={selectedProduct?.name || ""}
                onChange={e =>
                  setSelectedProduct(selectedProduct
                    ? { ...selectedProduct, name: e.target.value }
                    : null
                  )
                }
                error={editFormErrors.name}
                helperText={editFormErrors.name ? "Product name is required" : ""}
              />
              <TextField
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={selectedProduct?.description || ""}
                onChange={e =>
                  setSelectedProduct(selectedProduct
                    ? { ...selectedProduct, description: e.target.value }
                    : null
                  )
                }
                error={false}
                helperText="Optional"
              />
              <TextField
                label="Price"
                fullWidth
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  inputProps: { min: 0 }
                }}
                value={selectedProduct?.price ?? ""}
                onChange={e =>
                  setSelectedProduct(selectedProduct
                    ? { ...selectedProduct, price: Number(e.target.value) }
                    : null
                  )
                }
                error={editFormErrors.price}
                helperText={editFormErrors.price ? "Price is required and must be greater than 0" : ""}
              />
              <TextField
                label="Cost"
                fullWidth
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  inputProps: { min: 0 }
                }}
                value={selectedProduct?.cost ?? ""}
                onChange={e =>
                  setSelectedProduct(selectedProduct
                    ? { ...selectedProduct, cost: Number(e.target.value) }
                    : null
                  )
                }
                error={editFormErrors.cost}
                helperText={editFormErrors.cost ? "Cost is required and must be 0 or greater" : ""}
              />
              <TextField
                label="Stock"
                fullWidth
                variant="outlined"
                type="number"
                InputProps={{
                  inputProps: { min: 0 }
                }}
                value={selectedProduct?.stock ?? 0}
                onChange={e =>
                  setSelectedProduct(selectedProduct
                    ? { ...selectedProduct, stock: Number(e.target.value) }
                    : null
                  )
                }
                error={editFormErrors.stock}
                helperText={editFormErrors.stock ? "Stock is required and must be 0 or greater" : ""}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedProduct?.available ?? true}
                    onChange={e =>
                      setSelectedProduct(selectedProduct
                        ? { ...selectedProduct, available: e.target.checked }
                        : null
                      )
                    }
                    color="primary"
                  />
                }
                label="Available for Sale"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setEditDialogOpen(false); setEditFormErrors({ name: false, price: false, cost: false, stock: false }); }} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleUpdateProduct} sx={{ borderRadius: 2, fontWeight: 600 }} startIcon={<CheckIcon />}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Product Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          fullScreen={isSm}
          PaperProps={{
            sx: { borderRadius: isSm ? 0 : 3, boxShadow: currentTheme.shadows[8] }
          }}
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
                Delete product "{selectedProduct?.name}"?
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
            <Button color="error" variant="contained" onClick={confirmDeleteProduct} sx={{ borderRadius: 2, fontWeight: 600 }} startIcon={<DeleteIcon />}>
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

export default ProductManagementPage;

