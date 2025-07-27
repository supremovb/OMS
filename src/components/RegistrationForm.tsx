import React, { useState, useEffect } from "react";
import { saveCredentials, createUserWithProfile, getUserByUsername } from "../firebase/firestoreHelpers";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Alert,
  Fade,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  Snackbar,
  Link,
  IconButton,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import {
  AccountCircle,
  Lock,
  HowToReg,
  AdminPanelSettings,
  PointOfSale,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import logo from '../assets/logos/military-logo.jpg'; // Updated logo path
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Custom Material-UI Theme for military styling
const theme = createTheme({
  typography: {
    fontFamily: '"Roboto Condensed", sans-serif', // Military-style condensed font
    h4: {
      fontFamily: '"Bebas Neue", sans-serif', // Bold military-style font for headings
      fontWeight: 700,
      letterSpacing: 1.8,
    },
    h5: {
      fontFamily: '"Bebas Neue", sans-serif',
      fontWeight: 600,
      letterSpacing: 1.5,
    },
    h6: {
      fontFamily: '"Bebas Neue", sans-serif',
      fontWeight: 600,
      letterSpacing: 1.2,
    },
    button: {
      textTransform: 'none',
      letterSpacing: 1.1,
    },
  },
  palette: {
    primary: {
      main: '#4a7729', // Military green
      light: '#6b9c3a',
      dark: '#2d4a1a',
    },
    secondary: {
      main: '#333333', // Dark grey for contrast
    },
    background: {
      default: '#f5f5f5',
      paper: 'rgba(255,255,255,0.95)',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // More angular military style
            backgroundColor: 'rgba(255,255,255,0.9)',
            '& fieldset': {
              borderColor: '#d0d0d0',
              borderWidth: '2px',
              transition: 'border-color 0.3s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: '#6b9c3a',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4a7729',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#555',
            fontWeight: 500,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#4a7729',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // More angular military style
          padding: '12px 24px',
          fontWeight: 700,
          letterSpacing: 1.2,
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          border: '2px solid transparent',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
            transform: 'translateY(-2px)',
            border: '2px solid #2d4a1a',
          },
          '&:focus': {
            outline: 'none',
            border: '2px solid #2d4a1a',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // More angular military style
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(74, 119, 41, 0.3)',
          boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12), 0 4px 12px 0 rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '2px solid #d0d0d0',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Apply rounded corners to Select
          backgroundColor: 'rgba(255,255,255,0.9)', // Consistent background
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d0d0d0',
            borderWidth: '2px',
            transition: 'border-color 0.3s ease-in-out',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6b9c3a',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4a7729',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#555',
          fontWeight: 500,
          '&.Mui-focused': {
            color: '#4a7729',
          },
        },
      },
    },
  },
});

// Array of military-themed images for the right side
const militaryImages = [
  "https://images.stockcake.com/public/3/0/b/30ba1667-705d-41e9-9778-28912e4c0689_large/tactical-gear-display-stockcake.jpg",
  "https://images.stockcake.com/public/6/8/b/68b26b74-7820-401b-814c-7d656fb4e04a_large/tactical-gear-layout-stockcake.jpg",
  "https://media.istockphoto.com/id/1181645866/photo/military-uniform-and-equipment-body-armor-gun-assault-rifle-helmet-night-vision-goggles.jpg?s=612x612&w=0&k=20&c=fyNcAa5udJovVBjt1rAmnD5QPRkd2V__ZBcwb0vwMPQ=",
  "https://s3-media0.fl.yelpcdn.com/bphoto/ULmYN38BLbFcthn3dUJm0w/l.jpg",
  "https://i.ytimg.com/vi/LDf-tgNQg0E/maxresdefault.jpg",
];

interface RegistrationFormProps {
  onBackToLogin?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("cashier");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPasswords, setShowPasswords] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % militaryImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    try {
      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        setError("Username already exists. Please choose another.");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      await createUserWithProfile({
        username,
        password,
        role,
        firstName,
        lastName,
        status: "pending",
      });

      setMessage("Account created successfully! Please wait for admin approval.");
      setFirstName("");
      setLastName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setRole("cashier");
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const step =
    firstName && lastName && username && password && confirmPassword
      ? 3
      : firstName && lastName && username && password
      ? 2
      : firstName && lastName && username
      ? 1
      : 0;

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
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          position: "relative",
          background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
          overflow: "hidden",
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {/* Camouflage pattern background elements */}
        <Box
          sx={{
            position: "absolute",
            top: -150,
            left: -150,
            width: 350,
            height: 350,
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            background: "radial-gradient(circle at 60% 40%, rgba(74, 119, 41, 0.2) 0%, rgba(255, 240, 240, 0) 80%)",
            zIndex: 0,
            filter: "blur(25px)",
            animation: 'float1 10s ease-in-out infinite alternate',
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -120,
            right: -120,
            width: 280,
            height: 280,
            borderRadius: "70% 30% 30% 70% / 70% 70% 30% 30%",
            background: "radial-gradient(circle at 40% 60%, rgba(45, 74, 26, 0.2) 0%, rgba(255, 240, 240, 0) 80%)",
            zIndex: 0,
            filter: "blur(20px)",
            animation: 'float2 12s ease-in-out infinite alternate-reverse',
          }}
        />
        <style>
          {`
          @keyframes float1 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(20px, 10px) rotate(5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes float2 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-15px, -10px) rotate(-3deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          `}
        </style>

        {/* Left side - Registration Form */}
        <Box
          sx={{
            width: isMobile ? "100%" : "50%",
            minHeight: isMobile ? "auto" : "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: isXs ? 2 : isMobile ? 4 : 8,
            py: isXs ? 4 : isMobile ? 6 : 0,
            position: "relative",
            zIndex: 2,
            background: isMobile ? "rgba(255,255,255,0.95)" : "transparent",
          }}
        >
          {!isMobile && (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: "10%",
                height: "80%",
                width: 8,
                borderRadius: 4,
                background: "linear-gradient(180deg, #4a7729 0%, #6b9c3a 100%)",
                boxShadow: "0 0 20px 5px rgba(74,119,41,0.3)",
                zIndex: 3,
              }}
            />
          )}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <motion.div variants={itemVariants}>
              <Box
                component="img"
                src={logo}
                alt="OPENG MILITARY SUPPLIES"
                sx={{
                  height: isXs ? 64 : isMobile ? 80 : 100,
                  mb: 2.5,
                  filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.15))",
                  borderRadius: 3,
                  background: "#fff",
                  p: 2,
                  border: '2px solid #4a7729',
                }}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography
                variant={isXs ? "h5" : "h4"}
                sx={{
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  color: theme.palette.primary.main,
                  mb: 1,
                  textShadow: "0 3px 10px rgba(0,0,0,0.08)",
                }}
              >
                OPENG MILITARY SUPPLIES
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                  fontWeight: 500,
                  fontSize: isXs ? "1rem" : "1.1rem",
                }}
              >
                Tactical Gear & Equipment
              </Typography>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            style={{ width: "100%", maxWidth: 400 }}
          >
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                p: isXs ? 3 : 4,
                borderRadius: 3,
                background: theme.palette.background.paper,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 60px 0 rgba(0,0,0,0.15), 0 5px 15px 0 rgba(0,0,0,0.05)',
                border: '2px solid rgba(74,119,41,0.3)',
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 32,
                      height: 8,
                      borderRadius: 3,
                      mx: 0.8,
                      background:
                        step > i
                          ? "linear-gradient(90deg, #4a7729 0%, #6b9c3a 100%)"
                          : "#e0e0e0",
                      transition: "background 0.4s ease-in-out",
                    }}
                  />
                ))}
              </Box>

              <Typography
                variant="h6"
                component="h1"
                sx={{
                  mb: 3,
                  textAlign: "center",
                  fontWeight: 700,
                  color: theme.palette.secondary.main,
                  fontFamily: theme.typography.h6.fontFamily,
                  fontSize: isXs ? "1.2rem" : "1.35rem",
                }}
              >
                Request Account Access
              </Typography>

              <form onSubmit={handleRegister} autoComplete="off">
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    margin="normal"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2.5 }}
                    required
                    autoFocus
                    size="medium"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    margin="normal"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2.5 }}
                    required
                    size="medium"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2.5 }}
                    required
                    size="medium"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPasswords ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPasswords((v: boolean) => !v)}
                            edge="end"
                            size="small"
                            tabIndex={-1}
                          >
                            {showPasswords ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2.5 }}
                    required
                    size="medium"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showPasswords ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPasswords((v: boolean) => !v)}
                            edge="end"
                            size="small"
                            tabIndex={-1}
                          >
                            {showPasswords ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2.5 }}
                    required
                    size="medium"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={role}
                      onChange={(e) => setRole(e.target.value as string)}
                      label="Role"
                      required
                      size="medium"
                    >
                      <MenuItem value="cashier">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PointOfSale fontSize="small" /> Cashier
                        </Box>
                      </MenuItem>
                      <MenuItem value="admin">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AdminPanelSettings fontSize="small" /> Admin
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} color="inherit" /> : <HowToReg />
                    }
                    sx={{
                      mt: 1.5,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: "1.1rem",
                      background: theme.palette.primary.main,
                      '&:hover': {
                        background: theme.palette.primary.dark,
                        outline: 'none',
                        border: 'none',
                      },
                      '&:focus': {
                        outline: 'none',
                        border: 'none',
                      },
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    }}
                  >
                    {loading ? "Requesting Access..." : "Request Access"}
                  </Button>
                </motion.div>
              </form>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.95rem" }}
                >
                  Already have an account?{" "}
                  <Link
                    component="button"
                    onClick={() => navigate("/login")}
                    sx={{
                      fontWeight: 700,
                      cursor: "pointer",
                      color: theme.palette.primary.main,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                      transition: 'color 0.2s ease-in-out',
                    }}
                  >
                    Login Here
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Box>

        {/* Right side - Military Images Carousel (Desktop Only) */}
        {!isMobile && (
          <Box
            sx={{
              width: "50%",
              minHeight: "100vh",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {militaryImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{
                  opacity: index === currentImageIndex ? 1 : 0,
                  scale: index === currentImageIndex ? 1 : 1.05,
                  transition: { duration: 1.5, ease: "easeInOut" },
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  zIndex: 1,
                }}
              />
            ))}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(120deg, rgba(0,0,0,0.7) 30%, rgba(74,119,41,0.4) 100%)",
                zIndex: 2,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 64,
                left: 64,
                zIndex: 3,
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 1.5,
                    letterSpacing: 1.5,
                    textShadow: "0 4px 16px rgba(0,0,0,0.8)",
                  }}
                >
                  OPENG MILITARY SUPPLIES
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 500, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
                >
                  Tactical Gear & Equipment
                </Typography>
              </motion.div>
            </Box>
            <Box
              sx={{
                position: "absolute",
                bottom: 40,
                left: 64,
                zIndex: 4,
                display: "flex",
                gap: 1.5,
              }}
            >
              {militaryImages.map((_, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.2, backgroundColor: "#fff" }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: idx === currentImageIndex ? "#fff" : "rgba(255,255,255,0.6)",
                      border:
                        idx === currentImageIndex
                          ? "3px solid #4a7729"
                          : "2px solid rgba(255,255,255,0.4)",
                      transition: "all 0.3s ease-in-out",
                      cursor: "pointer",
                    }}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                </motion.div>
              ))}
            </Box>
          </Box>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: { xs: 2, sm: 8 } }}
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Alert
              severity="error"
              onClose={handleCloseSnackbar}
              sx={{
                width: "100%",
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.error.main,
                "& .MuiAlert-icon": {
                  color: theme.palette.error.main,
                },
              }}
            >
              {error}
            </Alert>
          </motion.div>
        </Snackbar>

        <Snackbar
          open={!!message}
          autoHideDuration={6000}
          onClose={() => setMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: { xs: 2, sm: 8 } }}
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Alert
              severity="success"
              onClose={() => setMessage("")}
              sx={{
                width: "100%",
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.success.main,
                "& .MuiAlert-icon": {
                  color: theme.palette.success.main,
                },
              }}
            >
              {message}
            </Alert>
          </motion.div>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default RegistrationForm;