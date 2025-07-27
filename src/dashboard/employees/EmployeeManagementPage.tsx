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
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Skeleton,
  createTheme,
  ThemeProvider,
  CssBaseline,
  DialogContentText,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
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

// Firestore helpers (kept as is, assuming they are correct and functional)
const getEmployees = async () => {
  const snapshot = await getDocs(collection(db, "employees"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Employee[];
};

const addEmployee = async (emp: Omit<Employee, "id">) => {
  const docRef = await addDoc(collection(db, "employees"), emp);
  return docRef.id;
};

const updateEmployee = async (emp: Employee) => {
  const empRef = doc(db, "employees", emp.id);
  await updateDoc(empRef, { 
    firstName: emp.firstName, 
    lastName: emp.lastName
  });
};

const deleteEmployee = async (id: string) => {
  const empRef = doc(db, "employees", id);
  await deleteDoc(empRef);
};

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface EmployeeManagementPageProps {
  onLogout?: () => void;
  onProfile?: () => void;
  firstName?: string;
  lastName?: string;
}

const EmployeeManagementPage: React.FC<EmployeeManagementPageProps> = ({
  onLogout,
  onProfile,
  firstName,
  lastName
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id">>({ 
    firstName: "", 
    lastName: ""
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" | "info" 
  });
  
  const currentTheme = useTheme(); // Use currentTheme to access theme properties
  const isSm = useMediaQuery(currentTheme.breakpoints.down("sm"));
  const isMd = useMediaQuery(currentTheme.breakpoints.down("md"));

  // Validation state
  const [addError, setAddError] = useState({ 
    firstName: false, 
    lastName: false
  });
  
  const [editError, setEditError] = useState({ 
    firstName: false, 
    lastName: false
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const emps = await getEmployees();
      setEmployees(emps);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to load employees", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    const errors = {
      firstName: !newEmployee.firstName.trim(),
      lastName: !newEmployee.lastName.trim()
    };
    setAddError(errors);
    if (Object.values(errors).some(Boolean)) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields.",
        severity: "error"
      });
      return;
    }
    try {
      await addEmployee(newEmployee);
      setSnackbar({ 
        open: true, 
        message: "Employee added successfully!", 
        severity: "success" 
      });
      setAddDialogOpen(false);
      setNewEmployee({ 
        firstName: "", 
        lastName: ""
      });
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to add employee", 
        severity: "error" 
      });
    }
  };

  const handleEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditError({ firstName: false, lastName: false }); // Reset errors on open
    setEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    const errors = {
      firstName: !selectedEmployee.firstName.trim(),
      lastName: !selectedEmployee.lastName.trim()
    };
    setEditError(errors);
    if (Object.values(errors).some(Boolean)) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields.",
        severity: "error"
      });
      return;
    }
    try {
      await updateEmployee(selectedEmployee);
      setSnackbar({ 
        open: true, 
        message: "Employee updated successfully!", 
        severity: "success" 
      });
      setEditDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to update employee", 
        severity: "error" 
      });
    }
  };

  const handleDeleteEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      await deleteEmployee(selectedEmployee.id);
      setSnackbar({ 
        open: true, 
        message: "Employee deleted successfully!", 
        severity: "success" 
      });
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to delete employee", 
        severity: "error" 
      });
    }
  };

  const filterEmployees = (emps: Employee[]) => {
    if (!search.trim()) return emps;
    const s = search.trim().toLowerCase();
    return emps.filter(
      e =>
        e.firstName.toLowerCase().includes(s) ||
        e.lastName.toLowerCase().includes(s)
    );
  };

  // Stats
  const totalEmployees = employees.length;
  const initials = (emp: Employee) =>
    `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase();

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
      <AppSidebar
        role="admin"
        firstName={firstName}
        lastName={lastName}
        onLogout={onLogout}
        onProfile={onProfile}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            mt: { xs: 2, sm: 3, md: 4 }, // Responsive margin top
            px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            pb: 4
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
                background: `linear-gradient(135deg, ${currentTheme.palette.info.light} 0%, ${currentTheme.palette.info.main} 100%)`, // Info gradient
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
                  <PersonIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: isSm ? 30 : 40 }} />
                  Employee Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Oversee and manage your valuable team members.
                </Typography>
              </Box>
              <Button
                onClick={fetchEmployees}
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
                borderLeft: `6px solid ${currentTheme.palette.primary.main}`, // Primary color border
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <Box sx={{ p: 1.5, bgcolor: currentTheme.palette.primary.light, borderRadius: '50%', color: currentTheme.palette.primary.dark, boxShadow: currentTheme.shadows[2] }}>
                  <PersonIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Employees</Typography>
                  <Typography variant="h5" fontWeight={700} color={currentTheme.palette.primary.dark}>{loading ? <CircularProgress size={24} /> : totalEmployees}</Typography>
                </Box>
              </Paper>
            </motion.div>
          </motion.div>

          {/* Search and Add Employee Section */}
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
                size="medium" // Changed to medium
                placeholder="Search employees..."
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
                    background: currentTheme.palette.background.default, // Use default background for input
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
                  minWidth: { xs: "100%", sm: 180 }, // Adjusted minWidth for better mobile fit
                  fontWeight: 700, // Bolder text
                  borderRadius: 2.5, // More rounded
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
                {isSm ? "Add Employee" : "Add New Employee"} {/* More descriptive text for small screens */}
              </Button>
            </Paper>
          </motion.div>

          {/* Employee Table */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Paper
              elevation={4} // Stronger shadow for the table
              sx={{
                borderRadius: 3,
                boxShadow: currentTheme.shadows[4], // Consistent shadow
                overflow: "hidden", // Ensures border-radius applies to table content
                mb: 2,
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
                      height={isSm ? 60 : 72} // Responsive height for skeleton rows
                      sx={{ 
                        mb: 1, 
                        borderRadius: 1,
                        bgcolor: currentTheme.palette.grey[200] // Lighter skeleton color
                      }} 
                    />
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table
                    sx={{
                      minWidth: 350,
                      "& th": { 
                        fontWeight: 700, 
                        background: currentTheme.palette.grey[100], // Lighter header background
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        fontSize: '1rem', // Consistent font size for headers
                        color: currentTheme.palette.text.primary,
                      },
                      "& tr": {
                        transition: "background 0.2s"
                      },
                      "& tr:hover": {
                        background: currentTheme.palette.action.hover // Use theme's hover color
                      }
                    }}
                    size={isSm ? "small" : "medium"}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filterEmployees(employees).map((emp) => (
                        <TableRow
                          key={emp.id}
                          hover
                          sx={{
                            '&:last-child td': { borderBottom: 0 }
                          }}
                        >
                          <TableCell sx={{ py: { xs: 1.5, sm: 2 } }}> {/* Increased vertical padding */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Avatar 
                                src={emp.avatar} 
                                sx={{ 
                                  width: isSm ? 40 : 48, // Responsive avatar size
                                  height: isSm ? 40 : 48,
                                  bgcolor: currentTheme.palette.primary.main,
                                  fontWeight: 700,
                                  fontSize: isSm ? 18 : 22, // Responsive font size
                                  boxShadow: currentTheme.shadows[1], // Subtle shadow for avatar
                                }}
                              >
                                {initials(emp)}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600} variant={isSm ? "body1" : "h6"}> {/* Responsive font size */}
                                  {emp.firstName} {emp.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Employee ID: {emp.id.slice(0, 8)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ py: { xs: 1.5, sm: 2 } }}> {/* Increased vertical padding */}
                            <Stack 
                              direction="row" 
                              spacing={1} 
                              justifyContent="flex-end"
                            >
                              <Tooltip title="Edit Employee">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEditEmployee(emp)}
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
                              <Tooltip title="Delete Employee">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteEmployee(emp)}
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
                      
                      {!loading && filterEmployees(employees).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} align="center" sx={{ py: 6 }}> {/* Adjusted colspan */}
                            <Box sx={{ 
                              display: "flex", 
                              flexDirection: "column", 
                              alignItems: "center",
                              gap: 1
                            }}>
                              <PersonIcon 
                                fontSize="large" 
                                color="disabled" 
                                sx={{ fontSize: 48, mb: 1 }} 
                              />
                              <Typography variant="h6" color="text.secondary">
                                No employees found
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {search.trim() ? "Try a different search query." : "Click 'Add Employee' to get started!"}
                              </Typography>
                              {!search.trim() && (
                                <Button
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={() => setAddDialogOpen(true)}
                                  sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
                                >
                                  Add Employee
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </motion.div>
        </Box>

        {/* Add Employee Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth="sm" // Changed to sm for slightly wider dialog
          fullWidth
          fullScreen={isSm} // Full screen on small mobile
          PaperProps={{
            sx: { 
              borderRadius: 3,
              p: { xs: 1, sm: 2 }, // Responsive padding
              boxShadow: currentTheme.shadows[8], // Stronger shadow
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: currentTheme.palette.primary.main, // Primary color for title
            borderBottom: `1px solid ${currentTheme.palette.divider}`, // Subtle divider
            mb: 2,
          }}>
            Add New Employee
            <IconButton 
              onClick={() => setAddDialogOpen(false)}
              sx={{ color: currentTheme.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers={false} sx={{ py: 3 }}> {/* Removed dividers, using Stack spacing */}
            <Stack spacing={3}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: currentTheme.palette.primary.main,
                    fontSize: 32,
                    mb: 1, // Reduced margin bottom
                    boxShadow: currentTheme.shadows[2],
                  }}
                >
                  <PersonIcon fontSize="large" />
                </Avatar>
              </Box>
              
              <Stack 
                direction={{ xs: "column", sm: "row" }} 
                spacing={3}
              >
                <TextField
                  label="First Name"
                  fullWidth
                  variant="outlined" // Consistent variant
                  value={newEmployee.firstName}
                  onChange={e => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                  error={addError.firstName}
                  helperText={addError.firstName ? "First name is required" : ""}
                  autoFocus
                  inputProps={{ maxLength: 32 }}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  variant="outlined" // Consistent variant
                  value={newEmployee.lastName}
                  onChange={e => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                  error={addError.lastName}
                  helperText={addError.lastName ? "Last name is required" : ""}
                  inputProps={{ maxLength: 32 }}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setAddDialogOpen(false)} 
              variant="outlined"
              color="inherit"
              sx={{ 
                borderRadius: 2,
                px: 3,
                color: currentTheme.palette.text.secondary
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddEmployee}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 600,
                px: 3,
                bgcolor: currentTheme.palette.primary.main,
                ":hover": { bgcolor: currentTheme.palette.primary.dark },
              }}
              startIcon={<CheckIcon />}
            >
              Add Employee
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm" // Changed to sm
          fullWidth
          fullScreen={isSm} // Full screen on small mobile
          PaperProps={{
            sx: { 
              borderRadius: 3,
              p: { xs: 1, sm: 2 },
              boxShadow: currentTheme.shadows[8],
            }
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
            Edit Employee
            <IconButton 
              onClick={() => setEditDialogOpen(false)}
              sx={{ color: currentTheme.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers={false} sx={{ py: 3 }}>
            <Stack spacing={3}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar
                  src={selectedEmployee?.avatar}
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: currentTheme.palette.primary.main,
                    fontSize: 32,
                    mb: 1,
                    boxShadow: currentTheme.shadows[2],
                  }}
                >
                  {selectedEmployee ? initials(selectedEmployee) : ""}
                </Avatar>
              </Box>
              
              <Stack 
                direction={{ xs: "column", sm: "row" }} 
                spacing={3}
              >
                <TextField
                  label="First Name"
                  fullWidth
                  variant="outlined"
                  value={selectedEmployee?.firstName || ""}
                  onChange={e =>
                    setSelectedEmployee(selectedEmployee
                      ? { ...selectedEmployee, firstName: e.target.value }
                      : null
                    )
                  }
                  error={editError.firstName}
                  helperText={editError.firstName ? "First name is required" : ""}
                  autoFocus
                  inputProps={{ maxLength: 32 }}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  variant="outlined"
                  value={selectedEmployee?.lastName || ""}
                  onChange={e =>
                    setSelectedEmployee(selectedEmployee
                      ? { ...selectedEmployee, lastName: e.target.value }
                      : null
                    )
                  }
                  error={editError.lastName}
                  helperText={editError.lastName ? "Last name is required" : ""}
                  inputProps={{ maxLength: 32 }}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setEditDialogOpen(false)} 
              variant="outlined"
              color="inherit"
              sx={{ 
                borderRadius: 2,
                px: 3,
                color: currentTheme.palette.text.secondary
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateEmployee}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 600,
                px: 3,
                bgcolor: currentTheme.palette.primary.main,
                ":hover": { bgcolor: currentTheme.palette.primary.dark },
              }}
              startIcon={<CheckIcon />}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Employee Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs" // Kept as xs for a more focused confirmation
          fullWidth
          fullScreen={isSm} // Full screen on small mobile
          PaperProps={{
            sx: { 
              borderRadius: 3,
              p: { xs: 1, sm: 2 },
              boxShadow: currentTheme.shadows[8],
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: currentTheme.palette.error.main, // Error color for title
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
          <DialogContent dividers={false} sx={{ py: 3 }}>
            <Box sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              textAlign: "center",
              gap: 2
            }}>
              <Avatar
                sx={{ 
                  width: 64, 
                  height: 64,
                  bgcolor: currentTheme.palette.error.light,
                  color: currentTheme.palette.error.dark,
                  mb: 2,
                  boxShadow: currentTheme.shadows[2],
                }}
              >
                <DeleteIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color={currentTheme.palette.text.primary}>
                Delete {selectedEmployee?.firstName} {selectedEmployee?.lastName}?
              </Typography>
              <DialogContentText variant="body2" color="text.secondary">
                This action cannot be undone. All associated data will be permanently removed.
              </DialogContentText>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              variant="outlined"
              color="inherit"
              sx={{ 
                borderRadius: 2,
                px: 3,
                color: currentTheme.palette.text.secondary
              }}
            >
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={confirmDeleteEmployee}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 600,
                px: 3,
                bgcolor: currentTheme.palette.error.main,
                ":hover": { bgcolor: currentTheme.palette.error.dark },
              }}
              startIcon={<DeleteIcon />}
            >
              Delete Permanently
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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

export default EmployeeManagementPage;
