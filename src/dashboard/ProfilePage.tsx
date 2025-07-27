import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  Fade,
  CircularProgress,
  Snackbar,
  Avatar,
  Stack,
  Divider,
  useTheme, // Import useTheme
  useMediaQuery, // Import useMediaQuery
  createTheme, // Import createTheme for consistency
  ThemeProvider, // Import ThemeProvider
  CssBaseline,
  Chip, // Import CssBaseline
} from "@mui/material";
import { AccountCircle, Lock, Person, ArrowBack } from "@mui/icons-material"; // Added ArrowBack icon
import { motion } from "framer-motion"; // Import motion for animations
import { saveCredentials } from "../firebase/firestoreHelpers"; // Assuming this path is correct

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
          borderRadius: '24px', // Consistent rounded corners for main paper elements
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)', // Consistent softer shadow
        },
      },
    },
    MuiCard: { // Keeping for consistency
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
    MuiChip: { // Keeping for consistency
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
    MuiSelect: { // Keeping for consistency
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
    MuiDialog: { // Keeping for consistency
      styleOverrides: {
        paper: {
          borderRadius: '24px',
          boxShadow: '0 15px 45px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTableHead: { // Keeping for consistency
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5', // Use a hardcoded color instead of theme.palette.grey[100]
        },
      },
    },
    MuiTableCell: { // Keeping for consistency
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#212121', // Use a hardcoded color instead of theme.palette.text.primary
        },
      },
    },
    MuiLinearProgress: { // Keeping for consistency
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
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // More prominent shadow for avatars
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

interface ProfilePageProps {
  user: {
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack }) => {
  const [username, setUsername] = useState(user.username);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const currentTheme = useTheme(); // Use currentTheme to access theme properties
  const isMobile = useMediaQuery(currentTheme.breakpoints.down("sm"));

  // Profile update (username, firstName, lastName)
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage(""); // Clear previous success message
    try {
      // TODO: Replace this with actual Firestore update logic for user profile
      // For now, simulate an API call
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      setError("Failed to update profile.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Password update (same logic as RegistrationForm)
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError("");
    setPwMessage(""); // Clear previous success message
    if (newPassword !== confirmNewPassword) {
      setPwError("New passwords do not match.");
      setSnackbarOpen(true);
      setPwLoading(false);
      return;
    }
    if (!newPassword || newPassword.length < 6) { // Example validation
      setPwError("New password must be at least 6 characters long.");
      setSnackbarOpen(true);
      setPwLoading(false);
      return;
    }
    // In a real application, you would verify currentPassword before changing
    // For this example, we'll assume saveCredentials handles the actual update
    try {
      // Use saveCredentials to update password (username, newPassword, role)
      await saveCredentials(user.username, newPassword, user.role); // Use user.username as it's the identifier
      setPwMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("Password change failed:", err);
      setPwError("Failed to change password. Please check your current password or try again.");
      setSnackbarOpen(true);
    } finally {
      setPwLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError(""); // Clear error when snackbar closes
    setPwError(""); // Clear password error when snackbar closes
  };

  // Avatar initials
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

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
    <ThemeProvider theme={theme}> {/* Apply the custom theme */}
      <CssBaseline /> {/* Apply base CSS for consistent styling */}
      <Box sx={{
        maxWidth: 520,
        mx: "auto",
        mt: { xs: 3, sm: 6 },
        px: { xs: 1, sm: 0 },
        pb: 6,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: currentTheme.spacing(4), // Consistent gap between cards
      }}>
        {/* Profile Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          style={{ width: '100%' }} // Ensure motion.div takes full width
        >
          <Paper sx={{
            p: { xs: 2.5, sm: 4 }, // Increased padding
            borderRadius: 4,
            boxShadow: currentTheme.shadows[6], // Stronger shadow
            bgcolor: "background.paper",
            position: "relative",
            overflow: "hidden", // Ensure no overflow from rounded corners
          }}>
            {/* Back Button */}
            <Button
              onClick={onBack}
              variant="outlined" // Outlined variant for back button
              size="small"
              startIcon={<ArrowBack />} // Icon for back button
              sx={{
                position: "absolute",
                left: isMobile ? 16 : 24, // Responsive positioning
                top: isMobile ? 16 : 24,
                minWidth: 0,
                px: 1.5,
                py: 0.5,
                fontWeight: 600,
                color: currentTheme.palette.secondary.main, // Secondary color for back button
                borderColor: currentTheme.palette.secondary.light,
                borderRadius: 2,
                textTransform: "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: currentTheme.palette.secondary.light,
                  color: currentTheme.palette.secondary.contrastText,
                  borderColor: currentTheme.palette.secondary.main,
                  boxShadow: currentTheme.shadows[2],
                },
              }}
            >
              {isMobile ? "" : "Back"}
            </Button>
            <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 3, mt: { xs: 4, sm: 2 } }}> {/* Adjusted margin-top for back button */}
              <Avatar sx={{
                width: 96, // Larger avatar
                height: 96,
                bgcolor: currentTheme.palette.primary.main, // Primary color for avatar
                fontSize: 48, // Larger font size for initials
                fontWeight: 700,
                mb: 1,
              }}>
                {initials}
              </Avatar>
              <Typography variant="h4" fontWeight={700} color={currentTheme.palette.primary.dark}> {/* Larger and bolder name */}
                {firstName} {lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary"> {/* Slightly larger body text */}
                @{username} &nbsp;|&nbsp; <Chip label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} size="small" color="info" sx={{ fontWeight: 600 }} />
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight={700} mb={2} color={currentTheme.palette.secondary.dark}> {/* Bolder heading */}
              Edit Profile Information
            </Typography>
            <form onSubmit={handleProfileUpdate} autoComplete="off">
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={e => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }} // Removed borderRadius here as it's handled by theme
                required
                inputProps={{ maxLength: 30, autoComplete: "username" }}
              />
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                margin="normal"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
                inputProps={{ maxLength: 30, autoComplete: "given-name" }}
              />
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                margin="normal"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
                inputProps={{ maxLength: 30, autoComplete: "family-name" }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2, mb: 1, py: 1.5, fontWeight: 700, // Increased padding and font weight
                  boxShadow: currentTheme.shadows[3], // Subtle shadow
                  letterSpacing: 0.5,
                  "&:hover": {
                    boxShadow: currentTheme.shadows[6], // Elevate on hover
                    transform: "translateY(-2px)", // Subtle lift
                  },
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined} // Inherit color for progress
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              {message && (
                <Fade in={!!message}>
                  <Alert severity="success" sx={{ mt: 2 }}> {/* Removed borderRadius here */}
                    {message}
                  </Alert>
                </Fade>
              )}
            </form>
          </Paper>
        </motion.div>

        {/* Password Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          style={{ width: '100%' }} // Ensure motion.div takes full width
        >
          <Paper sx={{
            p: { xs: 2.5, sm: 4 }, // Increased padding
            borderRadius: 4,
            boxShadow: currentTheme.shadows[6], // Stronger shadow
            bgcolor: "background.paper",
            overflow: "hidden",
          }}>
            <Typography variant="h6" fontWeight={700} mb={2} color={currentTheme.palette.secondary.dark}> {/* Bolder heading */}
              Change Password
            </Typography>
            <form onSubmit={handlePasswordUpdate} autoComplete="off">
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
                inputProps={{ autoComplete: "current-password", maxLength: 30 }}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
                inputProps={{ autoComplete: "new-password", maxLength: 30 }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
                inputProps={{ autoComplete: "new-password", maxLength: 30 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={pwLoading}
                sx={{
                  mt: 2, mb: 1, py: 1.5, fontWeight: 700, // Increased padding and font weight
                  boxShadow: currentTheme.shadows[3], // Subtle shadow
                  letterSpacing: 0.5,
                  "&:hover": {
                    boxShadow: currentTheme.shadows[6], // Elevate on hover
                    transform: "translateY(-2px)", // Subtle lift
                  },
                }}
                startIcon={pwLoading ? <CircularProgress size={20} color="inherit" /> : undefined} // Inherit color for progress
              >
                {pwLoading ? "Changing..." : "Change Password"}
              </Button>
              {pwMessage && (
                <Fade in={!!pwMessage}>
                  <Alert severity="success" sx={{ mt: 2 }}> {/* Removed borderRadius here */}
                    {pwMessage}
                  </Alert>
                </Fade>
              )}
            </form>
          </Paper>
        </motion.div>

        {/* Snackbar for errors */}
        <Snackbar
          open={!!error || !!pwError || snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="error"
            onClose={handleCloseSnackbar}
            sx={{
              width: "100%",
              // Removed borderRadius here as it's handled by theme.components.MuiAlert
              // Removed boxShadow here as it's handled by theme.components.MuiAlert
              backgroundColor: currentTheme.palette.background.paper, // Use paper background
              color: currentTheme.palette.error.dark, // Use error dark color for text
              "& .MuiAlert-icon": {
                color: currentTheme.palette.error.main // Use error main color for icon
              }
            }}
          >
            {error || pwError}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ProfilePage;
