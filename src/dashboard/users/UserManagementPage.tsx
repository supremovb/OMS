import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
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
  Select,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Tooltip,
  DialogContentText,
  useMediaQuery,
  useTheme,
  Chip,
  Avatar,
  CircularProgress,
  Badge,
  createTheme, // Import createTheme for consistency
  ThemeProvider, // Import ThemeProvider
  CssBaseline, // Import CssBaseline
  Stack // Ensure Stack is imported for consistent spacing
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon // Added RefreshIcon
} from "@mui/icons-material";
import AppSidebar from "../AppSidebar";
import { getUsers, addUser, acceptUser, updateUser, deleteUser } from "../../firebase/userManagementHelpers"; // Ensure these helpers are correctly implemented and imported
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
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
    MuiCard: { // Not directly used in this file, but keeping for consistency
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
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey[100],
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 700,
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiLinearProgress: { // Not directly used in this file, but keeping for consistency
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          height: 8,
          backgroundColor: theme.palette.grey[200],
        }),
        bar: ({ theme }) => ({
          borderRadius: 4,
          backgroundColor: theme.palette.primary.main,
        }),
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
          borderRadius: '12px', // Rounded alerts
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Subtle shadow for alerts
          fontWeight: 500,
        },
      },
    },
  },
});

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  status: "pending" | "active" | "disabled";
}

interface UserManagementPageProps {
  onLogout?: () => void;
  onProfile?: () => void;
  firstName?: string;
  lastName?: string;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({
  onLogout,
  onProfile,
  firstName,
  lastName
}) => {
  const currentTheme = useTheme(); // Use currentTheme to access theme properties
  const isMobile = useMediaQuery(currentTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(currentTheme.breakpoints.between('sm', 'md'));
  
  const [tab, setTab] = useState(0);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [disabledUsers, setDisabledUsers] = useState<User[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ 
    firstName: "", 
    lastName: "", 
    username: "", 
    password: "", 
    role: "cashier", 
    status: "pending" as "pending" | "active" | "disabled" 
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await getUsers();
      setPendingUsers(users.filter(u => u.status === "pending"));
      setActiveUsers(users.filter(u => u.status === "active"));
      setDisabledUsers(users.filter(u => u.status === "disabled"));
      setAllUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to fetch users", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate fields
      if (!newUser.firstName || !newUser.lastName || !newUser.username || !newUser.password) {
        setSnackbar({ 
          open: true, 
          message: "Please fill all required fields", 
          severity: "error" 
        });
        return;
      }
      if (newUser.password.length < 6) {
        setSnackbar({ 
          open: true, 
          message: "Password must be at least 6 characters long", 
          severity: "error" 
        });
        return;
      }
      
      // Add user to Firestore (status is not supported by addUser helper)
      const addedUser = await addUser({
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }) as { id: string } | undefined;

      // Always update the status after creation (even if it's "pending")
      if (addedUser?.id) {
        await updateDoc(doc(db, "users", addedUser.id), { status: newUser.status });
      }
      
      setSnackbar({ 
        open: true, 
        message: "User added successfully", 
        severity: "success" 
      });
      setAddDialogOpen(false);
      setNewUser({ 
        firstName: "", 
        lastName: "", 
        username: "", 
        password: "", 
        role: "cashier", 
        status: "pending" 
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to add user:", error);
      setSnackbar({ 
        open: true, 
        message: error.message || "Failed to add user", 
        severity: "error" 
      });
    }
  };

  const handleAcceptUser = async (userId: string) => {
    try {
      await acceptUser(userId);
      setSnackbar({ 
        open: true, 
        message: "User accepted successfully", 
        severity: "success" 
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to accept user:", error);
      setSnackbar({ 
        open: true, 
        message: error.message || "Failed to accept user", 
        severity: "error" 
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setSnackbar({ 
        open: true, 
        message: "User deleted successfully", 
        severity: "success" 
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      setSnackbar({ 
        open: true, 
        message: error.message || "Failed to delete user", 
        severity: "error" 
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    try {
      // Validate fields
      if (!editUser.firstName || !editUser.lastName || !editUser.username) {
        setSnackbar({ 
          open: true, 
          message: "Please fill all required fields", 
          severity: "error" 
        });
        return;
      }
      
      // Update user in Firestore (status is not supported by updateUser helper)
      await updateUser({
        id: editUser.id,
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        username: editUser.username,
        role: editUser.role
      });

      // Update status separately if needed
      if (editUser.status) {
        // Directly update the status field in Firestore if needed
        await updateDoc(doc(db, "users", editUser.id), { status: editUser.status });
      }
      
      setSnackbar({ 
        open: true, 
        message: "User updated successfully", 
        severity: "success" 
      });
      setEditDialogOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to update user:", error);
      setSnackbar({ 
        open: true, 
        message: error.message || "Failed to update user", 
        severity: "error" 
      });
    }
  };

  // Filter users by search
  const filterUsers = (users: User[]) => {
    if (!search.trim()) return users;
    const s = search.trim().toLowerCase();
    return users.filter(
      u =>
        u.firstName.toLowerCase().includes(s) ||
        u.lastName.toLowerCase().includes(s) ||
        u.username.toLowerCase().includes(s) ||
        u.role.toLowerCase().includes(s)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'disabled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case 'active': return <LockOpenIcon fontSize="small" />;
      case 'disabled': return <LockIcon fontSize="small" />;
      case 'pending': return <PersonIcon fontSize="small" />;
      default: return undefined;
    }
  };

  // Add stats
  const totalUsers = allUsers.length;
  const totalAdmins = allUsers.filter(u => u.role === "admin").length;
  const totalCashiers = allUsers.filter(u => u.role === "cashier").length;

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
        <Box sx={{ 
          maxWidth: 1400, 
          mx: "auto", 
          p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
          width: '100%'
        }}>
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
                background: `linear-gradient(135deg, ${currentTheme.palette.primary.light} 0%, ${currentTheme.palette.primary.main} 100%)`, // Primary gradient
                color: currentTheme.palette.primary.contrastText,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant={isMobile ? "h5" : "h3"} fontWeight={700} gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: isMobile ? 30 : 40 }} />
                  User Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage user accounts, roles, and statuses.
                </Typography>
              </Box>
              <Button
                onClick={fetchUsers}
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
                {loading ? "Loading..." : "Refresh Users"}
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
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
              gap: currentTheme.spacing(3),
              marginBottom: currentTheme.spacing(4),
              justifyContent: "center",
            }}
          >
            <motion.div variants={statCardVariants} whileHover="hover">
              <Paper elevation={4} sx={{
                p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.info.main}`,
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <Box sx={{ p: 1.5, bgcolor: currentTheme.palette.info.light, borderRadius: '50%', color: currentTheme.palette.info.dark, boxShadow: currentTheme.shadows[2] }}>
                  <PersonIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Users</Typography>
                  <Typography variant="h5" fontWeight={700} color={currentTheme.palette.info.dark}>{loading ? <CircularProgress size={24} /> : totalUsers}</Typography>
                </Box>
              </Paper>
            </motion.div>
            <motion.div variants={statCardVariants} whileHover="hover">
              <Paper elevation={4} sx={{
                p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.success.main}`,
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <Box sx={{ p: 1.5, bgcolor: currentTheme.palette.success.light, borderRadius: '50%', color: currentTheme.palette.success.dark, boxShadow: currentTheme.shadows[2] }}>
                  <LockOpenIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Admins</Typography>
                  <Typography variant="h5" fontWeight={700} color={currentTheme.palette.success.dark}>{loading ? <CircularProgress size={24} /> : totalAdmins}</Typography>
                </Box>
              </Paper>
            </motion.div>
            <motion.div variants={statCardVariants} whileHover="hover">
              <Paper elevation={4} sx={{
                p: 3, display: "flex", alignItems: "center", gap: 2,
                borderLeft: `6px solid ${currentTheme.palette.warning.main}`,
                borderRadius: 3, bgcolor: "background.paper"
              }}>
                <Box sx={{ p: 1.5, bgcolor: currentTheme.palette.warning.light, borderRadius: '50%', color: currentTheme.palette.warning.dark, boxShadow: currentTheme.shadows[2] }}>
                  <LockIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Cashiers</Typography>
                  <Typography variant="h5" fontWeight={700} color={currentTheme.palette.warning.dark}>{loading ? <CircularProgress size={24} /> : totalCashiers}</Typography>
                </Box>
              </Paper>
            </motion.div>
          </motion.div>
          
          {/* Search and Add User Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Paper elevation={4} sx={{ 
              p: { xs: 2, sm: 3 }, 
              mb: 3, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              flexWrap: "wrap", 
              gap: 2,
              borderRadius: 3,
              boxShadow: currentTheme.shadows[2],
              bgcolor: "background.paper"
            }}>
              <TextField
                size="medium" // Changed to medium
                placeholder="Search users..."
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
                    width: isMobile ? '100%' : 'auto',
                  }
                }}
                sx={{ 
                  flexGrow: isMobile ? 1 : 0,
                  minWidth: isMobile ? '100%' : 250
                }}
              />
              <Button 
                variant="contained" 
                onClick={() => setAddDialogOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  whiteSpace: 'nowrap',
                  width: isMobile ? '100%' : 'auto',
                  borderRadius: 2.5, // More rounded
                  fontWeight: 700,
                  bgcolor: currentTheme.palette.primary.main,
                  ":hover": { bgcolor: currentTheme.palette.primary.dark },
                  py: 1.2, // Increased padding
                  px: 3,
                }}
              >
                {isMobile ? 'Add User' : 'Add New User'}
              </Button>
            </Paper>
          </motion.div>
          
          {/* Tabs for User Status */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Tabs 
              value={tab} 
              onChange={(_, v) => setTab(v)} 
              sx={{ mb: 3, '& .MuiTabs-indicator': { backgroundColor: currentTheme.palette.primary.main } }}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              centered={!isMobile}
            >
              <Tab label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                  All Users
                  <Badge 
                    badgeContent={allUsers.length} 
                    color="primary" 
                    showZero
                    sx={{ '& .MuiBadge-badge': { fontSize: 12, height: 20, minWidth: 20, borderRadius: '10px' } }}
                  />
                </Box>
              } />
              <Tab label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                  Pending
                  <Badge 
                    badgeContent={pendingUsers.length} 
                    color="warning" 
                    showZero
                    sx={{ '& .MuiBadge-badge': { fontSize: 12, height: 20, minWidth: 20, borderRadius: '10px' } }}
                  />
                </Box>
              } />
              <Tab label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                  Active
                  <Badge 
                    badgeContent={activeUsers.length} 
                    color="success" 
                    showZero
                    sx={{ '& .MuiBadge-badge': { fontSize: 12, height: 20, minWidth: 20, borderRadius: '10px' } }}
                  />
                </Box>
              } />
              <Tab label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                  Disabled
                  <Badge 
                    badgeContent={disabledUsers.length} 
                    color="error" 
                    showZero
                    sx={{ '& .MuiBadge-badge': { fontSize: 12, height: 20, minWidth: 20, borderRadius: '10px' } }}
                  />
                </Box>
              } />
            </Tabs>
          </motion.div>
          
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: 200,
              mt: 4 // Margin top for loading spinner
            }}>
              <CircularProgress size={60} color="primary" />
              <Typography variant="h6" color="text.secondary" sx={{ ml: 3 }}>Loading Users...</Typography>
            </Box>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              {tab === 0 && (
                <UserTable 
                  users={filterUsers(allUsers)} 
                  onEdit={handleEditUser} 
                  onDelete={handleDeleteUser} 
                  onAccept={handleAcceptUser}
                  isMobile={isMobile}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  emptyMessage="No users found"
                />
              )}
              {tab === 1 && (
                <UserTable 
                  users={filterUsers(pendingUsers)} 
                  onEdit={handleEditUser} 
                  onDelete={handleDeleteUser} 
                  onAccept={handleAcceptUser}
                  isMobile={isMobile}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  emptyMessage="No pending users"
                  showAccept={true}
                />
              )}
              {tab === 2 && (
                <UserTable 
                  users={filterUsers(activeUsers)} 
                  onEdit={handleEditUser} 
                  onDelete={handleDeleteUser} 
                  isMobile={isMobile}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  emptyMessage="No active users"
                />
              )}
              {tab === 3 && (
                <UserTable 
                  users={filterUsers(disabledUsers)} 
                  onEdit={handleEditUser} 
                  onDelete={handleDeleteUser} 
                  isMobile={isMobile}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  emptyMessage="No disabled users"
                />
              )}
            </motion.div>
          )}
        </Box>
        
        {/* Add User Dialog */}
        <Dialog 
          open={addDialogOpen} 
          onClose={() => setAddDialogOpen(false)} 
          maxWidth="xs" 
          fullWidth
          fullScreen={isMobile}
          PaperProps={{ sx: { borderRadius: 3, boxShadow: currentTheme.shadows[8] } }}
        >
          <DialogTitle sx={{ 
            bgcolor: currentTheme.palette.primary.main,
            color: currentTheme.palette.primary.contrastText,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 700,
            py: 2 // Increased padding
          }}>
            <AddIcon /> Add New User
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              value={newUser.firstName}
              onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
              required
              inputProps={{ maxLength: 30 }}
              helperText="Enter the user's first name"
              variant="outlined" // Consistent variant
            />
            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              value={newUser.lastName}
              onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
              required
              inputProps={{ maxLength: 30 }}
              helperText="Enter the user's last name"
              variant="outlined"
            />
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={newUser.username}
              onChange={e => setNewUser({ ...newUser, username: e.target.value })}
              required
              inputProps={{ maxLength: 20 }}
              helperText="Choose a unique username"
              variant="outlined"
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              required
              inputProps={{ maxLength: 20 }}
              helperText="Set a secure password (min 6 characters)"
              variant="outlined"
            />
            <Select
              label="Role"
              fullWidth
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value as "admin" | "cashier" })}
              sx={{ mt: 2 }}
              variant="outlined"
            >
              <MenuItem value="cashier">Cashier</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            <Select
              label="Status"
              fullWidth
              value={newUser.status}
              onChange={e => setNewUser({ ...newUser, status: e.target.value as "pending" | "active" | "disabled" })}
              sx={{ mt: 2, mb: 1 }}
              variant="outlined"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setAddDialogOpen(false)} 
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAddUser}
              sx={{ ml: 2, borderRadius: 2, fontWeight: 600 }}
            >
              Add User
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit User Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
          maxWidth="xs" 
          fullWidth
          fullScreen={isMobile}
          PaperProps={{ sx: { borderRadius: 3, boxShadow: currentTheme.shadows[8] } }}
        >
          <DialogTitle sx={{ 
            bgcolor: currentTheme.palette.primary.main,
            color: currentTheme.palette.primary.contrastText,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 700,
            py: 2
          }}>
            <EditIcon /> Edit User
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              value={editUser?.firstName || ""}
              onChange={e => setEditUser(editUser ? { ...editUser, firstName: e.target.value } : null)}
              required
              inputProps={{ maxLength: 30 }}
              helperText="Edit the user's first name"
              variant="outlined"
            />
            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              value={editUser?.lastName || ""}
              onChange={e => setEditUser(editUser ? { ...editUser, lastName: e.target.value } : null)}
              required
              inputProps={{ maxLength: 30 }}
              helperText="Edit the user's last name"
              variant="outlined"
            />
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={editUser?.username || ""}
              onChange={e => setEditUser(editUser ? { ...editUser, username: e.target.value } : null)}
              required
              inputProps={{ maxLength: 20 }}
              helperText="Edit the username"
              variant="outlined"
            />
            <Select
              label="Role"
              fullWidth
              value={editUser?.role || ""}
              onChange={e => setEditUser(editUser ? { ...editUser, role: e.target.value as "admin" | "cashier" } : null)}
              sx={{ mt: 2 }}
              variant="outlined"
            >
              <MenuItem value="cashier">Cashier</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            <Select
              label="Status"
              fullWidth
              value={editUser?.status || ""}
              onChange={e => setEditUser(editUser ? { ...editUser, status: e.target.value as "pending" | "active" | "disabled" } : null)}
              sx={{ mt: 2, mb: 1 }}
              variant="outlined"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setEditDialogOpen(false)} 
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleUpdateUser}
              sx={{ ml: 2, borderRadius: 2, fontWeight: 600 }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete User Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, boxShadow: currentTheme.shadows[8] } }}
        >
          <DialogTitle sx={{ 
            bgcolor: currentTheme.palette.error.main,
            color: currentTheme.palette.error.contrastText,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 700,
            py: 2
          }}>
            <DeleteIcon /> Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: currentTheme.palette.error.light, mr: 2, width: 56, height: 56, fontSize: 24 }}>
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {userToDelete?.firstName} {userToDelete?.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  @{userToDelete?.username}
                </Typography>
              </Box>
            </Box>
            <DialogContentText variant="body1" sx={{ color: currentTheme.palette.text.primary }}>
              Are you sure you want to permanently delete this user account? This action cannot be undone and will remove all associated data.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              variant="outlined"
              color="inherit"
              startIcon={<CancelIcon />}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteUser} 
              variant="contained" 
              color="error"
              startIcon={<DeleteIcon />}
              sx={{ ml: 2, borderRadius: 2, fontWeight: 600 }}
            >
              Delete User
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity} 
            sx={{ width: '100%', borderRadius: 2, boxShadow: currentTheme.shadows[3] }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </AppSidebar>
    </ThemeProvider>
  );
};

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAccept?: (userId: string) => void;
  isMobile: boolean;
  getStatusColor: (status: string) => any;
  getStatusIcon: (status: string) => React.ReactElement | undefined;
  emptyMessage: string;
  showAccept?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onAccept,
  isMobile,
  getStatusColor,
  getStatusIcon,
  emptyMessage,
  showAccept = false
}) => {
  const currentTheme = useTheme();
  
  return (
    <TableContainer 
      component={Paper} 
      elevation={4} // Stronger shadow for the table
      sx={{ 
        borderRadius: 3, 
        boxShadow: currentTheme.shadows[4], // Consistent shadow
        overflowX: 'auto',
        border: "1px solid",
        borderColor: currentTheme.palette.divider,
        bgcolor: "background.paper",
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: currentTheme.shadows[6],
        }
      }}
    >
      <Table sx={{ minWidth: 650 }} size={isMobile ? 'small' : 'medium'}>
        <TableHead sx={{ bgcolor: currentTheme.palette.grey[100] }}>
          <TableRow>
            {!isMobile && <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Avatar</TableCell>}
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Name</TableCell>
            {!isMobile && <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Username</TableCell>}
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id} hover sx={{
              transition: "background 0.2s",
              "&:hover": { bgcolor: currentTheme.palette.action.selected }
            }}>
              {!isMobile && (
                <TableCell>
                  <Avatar sx={{ bgcolor: currentTheme.palette.primary.main, width: 48, height: 48, fontSize: 20 }}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </Avatar>
                </TableCell>
              )}
              <TableCell>
                <Typography fontWeight={600}>
                  {user.firstName} {user.lastName}
                </Typography>
                {isMobile && (
                  <Typography variant="body2" color="text.secondary">
                    @{user.username}
                  </Typography>
                )}
              </TableCell>
              {!isMobile && <TableCell>@{user.username}</TableCell>}
              <TableCell sx={{ textTransform: "capitalize" }}>
                <Chip 
                  label={user.role} 
                  size="small"
                  color={user.role === 'admin' ? 'primary' : 'default'}
                  sx={{ fontWeight: 600, px: 1 }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  color={getStatusColor(user.status)}
                  size="small"
                  icon={getStatusIcon(user.status) ?? undefined}
                  sx={{ fontWeight: 600, px: 1 }}
                />
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  {showAccept && onAccept && (
                    <Tooltip title="Accept User">
                      <IconButton 
                        color="success" 
                        onClick={() => onAccept(user.id)}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ 
                          bgcolor: currentTheme.palette.success.light, 
                          ":hover": { bgcolor: currentTheme.palette.success.main, color: "#fff" },
                          boxShadow: currentTheme.shadows[1],
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        <CheckCircleIcon fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Edit User">
                    <IconButton 
                      color="primary" 
                      onClick={() => onEdit(user)}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ 
                        bgcolor: currentTheme.palette.primary.light, 
                        ":hover": { bgcolor: currentTheme.palette.primary.main, color: "#fff" },
                        boxShadow: currentTheme.shadows[1],
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                    >
                      <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton 
                      color="error" 
                      onClick={() => onDelete(user)}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ 
                        bgcolor: currentTheme.palette.error.light, 
                        ":hover": { bgcolor: currentTheme.palette.error.main, color: "#fff" },
                        boxShadow: currentTheme.shadows[1],
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                    >
                      <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={isMobile ? 4 : 6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary" fontStyle="italic">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserManagementPage;
