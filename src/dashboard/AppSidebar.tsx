import React, { useState, useEffect, ReactNode } from "react";
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Typography,
  CssBaseline,
  ListItemButton,
  Menu,
  MenuItem as MuiMenuItem,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme as useMuiTheme,
  AppBar,
  Toolbar,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  People,
  Settings,
  Receipt,
  BarChart,
  Logout,
  PointOfSale,
  AccountCircle,
  ExpandMore,
  Group as GroupIcon,
  Build as BuildIcon,
  Payment as PaymentIcon,
  MonetizationOn as MonetizationOnIcon,
} from "@mui/icons-material";
import logo from '../assets/logos/military-logo.jpg'; // Use military logo
import { useNavigate } from "react-router-dom";

// --- Military Theme (matches LoginForm.tsx) ---
const militaryTheme = createTheme({
  typography: {
    fontFamily: '"Roboto Condensed", sans-serif',
    h4: {
      fontFamily: '"Bebas Neue", sans-serif',
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
      main: '#4a7729',
      light: '#6b9c3a',
      dark: '#2d4a1a',
    },
    secondary: {
      main: '#333333',
    },
    background: {
      default: '#f5f5f5',
      paper: 'rgba(255,255,255,0.95)',
    },
    divider: 'rgba(74,119,41,0.25)',
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '2px solid rgba(74,119,41,0.25)',
          background: 'rgba(255,255,255,0.95)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid #4a7729',
        },
      },
    },
  },
});
// --- End Military Theme ---

const drawerWidth = 260;
const collapsedWidth = 72;

interface AppSidebarProps {
  role: "admin" | "cashier";
  firstName?: string;
  lastName?: string;
  onLogout?: () => void;
  onProfile?: () => void;
  children?: ReactNode;
}

// Enhanced menu structure with route paths
const adminMenu = [
  {
    section: "Main",
    items: [
      { text: "Dashboard", icon: <Dashboard />, path: "/admin" },
      { text: "Reports & Analytics", icon: <BarChart />, path: "/admin/reports" },
      { text: "Sales Transactions", icon: <Receipt />, path: "/admin/sales-transactions" },
      { text: "Loyalty Program", icon: <People />, path: "/admin/loyalty-program" },
      { text: "Commissions", icon: <MonetizationOnIcon />, path: "/commissions" }
    ]
  },
  {
    section: "Management",
    items: [
      { text: "User Management", icon: <People />, path: "/admin/users" },
      { text: "Employee Management", icon: <GroupIcon />, path: "/admin/employees" },
      { text: "Product Management", icon: <BuildIcon />, path: "/admin/services" },
      // { text: "Chemicals Inventory", icon: <BuildIcon color="secondary" />, path: "/admin/chemicals" } // HIDDEN
    ]
  }
];

const cashierMenu = [
  {
    section: "Main",
    items: [
      { text: "Dashboard", icon: <Dashboard />, path: "/cashier" },
      { text: "Payment & Services", icon: <PaymentIcon />, path: "/cashier/payment-services" },
      { text: "Loyalty Program", icon: <People />, path: "/cashier/loyalty-program" },
      { text: "Sales Transactions", icon: <PointOfSale />, path: "/cashier/sales-transactions" },
      { text: "Daily Summary", icon: <Receipt />, path: "/cashier/daily-summary" },
      { text: "Commissions", icon: <MonetizationOnIcon />, path: "/commissions" }
    ]
  }
];

const SIDEBAR_PREF_KEY = "sidebarOpen";

const AppSidebar: React.FC<AppSidebarProps> = ({
  role,
  firstName: propFirstName = '',
  lastName: propLastName = '',
  onLogout,
  onProfile,
  children
}) => {
  const theme = militaryTheme; // Use military theme
  const muiTheme = useMuiTheme(); // For breakpoints
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [open, setOpen] = useState(() => {
    // Default to open on desktop, closed on mobile
    const pref = localStorage.getItem(SIDEBAR_PREF_KEY);
    return isMobile ? false : (pref === null ? true : pref === "true");
  });
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("");

  const [userInfo, setUserInfo] = useState<{ firstName: string, lastName: string }>({
    firstName: propFirstName,
    lastName: propLastName
  });

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserInfo({
          firstName: parsed.firstName || "",
          lastName: parsed.lastName || ""
        });
      } catch {
        setUserInfo({ firstName: propFirstName, lastName: propLastName });
      }
    } else {
      setUserInfo({ firstName: propFirstName, lastName: propLastName });
    }

    // Set active item based on current path
    const currentPath = window.location.pathname;
    const allMenuItems = [...adminMenu, ...cashierMenu].flatMap(section => section.items);
    const activeMenuItem = allMenuItems.find(item => item.path === currentPath);
    if (activeMenuItem) {
      setActiveItem(activeMenuItem.text);
    }
  }, [propFirstName, propLastName, role]);

  useEffect(() => {
    // Only save preference if not on mobile
    if (!isMobile) {
      localStorage.setItem(SIDEBAR_PREF_KEY, String(open));
    }
  }, [open, isMobile]);

  // Handle sidebar behavior based on mobile state
  useEffect(() => {
    if (isMobile) {
      setOpen(false); // Always start closed on mobile
    } else {
      const pref = localStorage.getItem(SIDEBAR_PREF_KEY);
      setOpen(pref === null ? true : pref === "true"); // Respect preference on desktop
    }
  }, [isMobile]);

  const handleMenuClick = (item: { text: string; path: string }) => {
    setActiveItem(item.text);
    navigate(item.path);
    if (isMobile) {
      setOpen(false); // Close sidebar on mobile after navigation
    }
  };

  const menu = role === "admin" ? adminMenu : cashierMenu;
  const firstName = userInfo.firstName || propFirstName;
  const lastName = userInfo.lastName || propLastName;
  const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleProfileClick = () => {
    handleCloseUserMenu();
    if (onProfile) onProfile();
  };

  const handleLogoutClick = () => {
    handleCloseUserMenu();
    if (onLogout) onLogout();
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: theme.typography.fontFamily }}>
        {/* Mobile AppBar with Menu Button */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              width: '100%',
              zIndex: theme.zIndex.drawer + 1,
              background: "linear-gradient(90deg, #4a7729 0%, #6b9c3a 100%)",
              boxShadow: theme.shadows[2],
              height: 64,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={toggleSidebar}
                edge="start"
                sx={{ mr: 2, color: "#fff" }}
              >
                <MenuIcon />
              </IconButton>
              <Box
                component="img"
                src={logo}
                alt="OMS Logo"
                sx={{
                  height: 36,
                  mr: 1,
                  objectFit: "contain",
                  borderRadius: 2,
                  border: '2px solid #4a7729',
                  background: "#fff",
                  p: 0.5,
                }}
              />
              <Typography variant="h6" noWrap component="div"
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: 2,
                  whiteSpace: "nowrap",
                  fontFamily: theme.typography.h4.fontFamily,
                  ml: 1,
                  textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                OMS
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Sidebar Drawer */}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            width: open ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedWidth,
              overflowX: 'hidden',
              transition: (muiTheme) => muiTheme.transitions.create('width', {
                easing: muiTheme.transitions.easing.sharp,
                duration: muiTheme.transitions.duration.enteringScreen,
              }),
              background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
              borderRight: `2px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              boxShadow: isMobile ? theme.shadows[4] : 'none',
              top: isMobile ? 64 : 0,
              height: isMobile ? 'calc(100% - 64px)' : '100vh',
            },
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {/* Logo Section */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: open ? "flex-start" : "center",
                p: open ? "20px 24px 12px 24px" : "20px 12px 12px 12px",
                borderBottom: `2px solid ${theme.palette.divider}`,
                minHeight: 72,
                background: "rgba(255,255,255,0.95)",
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="OMS Logo"
                sx={{
                  height: 44,
                  width: open ? "auto" : 44,
                  borderRadius: 2,
                  objectFit: "contain",
                  background: "#fff",
                  border: '2px solid #4a7729',
                  p: 0.5,
                  transition: "width 0.3s ease-in-out"
                }}
              />
              {open && (
                <Typography variant="h5" sx={{
                  ml: 2,
                  fontWeight: 800,
                  color: theme.palette.primary.main,
                  letterSpacing: 2,
                  whiteSpace: "nowrap",
                  fontFamily: theme.typography.h4.fontFamily,
                  textShadow: "0 2px 8px rgba(0,0,0,0.10)",
                }}>
                  OMS
                </Typography>
              )}
            </Box>
          )}

          {/* Main Menu */}
          <Box sx={{
            flexGrow: 1,
            overflowY: "auto",
            pt: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.action.hover,
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.light,
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.primary.dark,
            }
          }}>
            {menu.map((section, idx) => (
              <Box key={`${section.section}-${idx}`} sx={{ my: 1 }}>
                {open && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.dark,
                      fontWeight: 700,
                      letterSpacing: 1,
                      pl: 3,
                      pb: 0.5,
                      display: "block",
                      textTransform: 'uppercase',
                      fontFamily: theme.typography.h6.fontFamily,
                    }}
                  >
                    {section.section}
                  </Typography>
                )}
                <List sx={{ py: 0 }}>
                  {section.items.map((item) => (
                    <Tooltip
                      key={item.text}
                      title={!open ? item.text : ""}
                      placement="right"
                      arrow
                      sx={{ [`& .MuiTooltip-tooltip`]: { fontSize: 13 } }}
                    >
                      <ListItemButton
                        sx={{
                          minHeight: 48,
                          justifyContent: open ? 'initial' : 'center',
                          px: open ? 3 : 1.5,
                          borderRadius: 2,
                          my: 0.5,
                          mx: 1,
                          transition: "all 0.2s ease-in-out",
                          backgroundColor: activeItem === item.text ? theme.palette.primary.light : "transparent",
                          color: activeItem === item.text ? theme.palette.primary.main : theme.palette.text.primary,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.dark,
                            transform: 'translateX(4px)',
                          },
                          "&.Mui-selected": {
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.main,
                            "&:hover": {
                              backgroundColor: theme.palette.primary.light,
                            }
                          }
                        }}
                        onClick={() => handleMenuClick(item)}
                        selected={activeItem === item.text}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 2 : 'auto',
                            justifyContent: 'center',
                            color: activeItem === item.text ? theme.palette.primary.main : theme.palette.action.active,
                            transition: 'color 0.2s ease-in-out',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          sx={{
                            opacity: open ? 1 : 0,
                            transition: "opacity 0.3s ease-in-out",
                            whiteSpace: "nowrap"
                          }}
                          primaryTypographyProps={{
                            fontWeight: activeItem === item.text ? 700 : 500,
                            fontSize: 15,
                            color: activeItem === item.text ? theme.palette.primary.main : theme.palette.text.primary,
                            fontFamily: theme.typography.fontFamily,
                          }}
                        />
                      </ListItemButton>
                    </Tooltip>
                  ))}
                </List>
                {idx < menu.length - 1 && (
                  <Divider sx={{ mx: open ? 2 : 1.5, my: 2, borderColor: theme.palette.divider }} />
                )}
              </Box>
            ))}
          </Box>

          {/* User Menu Section */}
          <Box
            sx={{
              p: open ? 2 : 1,
              borderTop: `2px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: open ? "row" : "column",
              alignItems: "center",
              justifyContent: open ? "space-between" : "center",
              minHeight: 70,
              background: "rgba(255,255,255,0.95)",
              transition: 'all 0.3s ease-in-out',
            }}
          >
            <Tooltip title={open ? "" : `${firstName} ${lastName}`} placement="right" arrow>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: open ? "100%" : "auto",
                  cursor: "pointer",
                  '&:hover': {
                    opacity: 0.8,
                  }
                }}
                onClick={handleUserMenuOpen}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.primary.main,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    mr: open ? 2 : 0,
                    transition: 'margin 0.3s ease-in-out',
                    boxShadow: theme.shadows[1],
                  }}
                >
                  {userInitials}
                </Avatar>
                {open && (
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, color: theme.palette.primary.dark }}>
                      {firstName} {lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {role === "admin" ? "Administrator" : "Cashier"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Tooltip>
            {open && (
              <IconButton
                size="small"
                onClick={handleUserMenuOpen}
                sx={{ ml: 1, transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'scale(1.1)' }, color: theme.palette.primary.main }}
                aria-label="User menu"
              >
                <ExpandMore />
              </IconButton>
            )}
          </Box>

          {/* User Menu Dropdown */}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleCloseUserMenu}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: "rgba(255,255,255,0.98)",
                border: `2px solid ${theme.palette.primary.light}`,
              }
            }}
          >
            <MuiMenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MuiMenuItem>
            <Divider />
            <MuiMenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MuiMenuItem>
          </Menu>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: isMobile ? '100%' : `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
            transition: (muiTheme) => muiTheme.transitions.create(['margin', 'width'], {
              easing: muiTheme.transitions.easing.sharp,
              duration: muiTheme.transitions.duration.enteringScreen,
            }),
            background: theme.palette.background.default,
            minHeight: "100vh",
            marginLeft: isMobile ? 0 : `${open ? drawerWidth : collapsedWidth}px`,
            mt: isMobile ? '64px' : 0,
            position: "relative",
          }}
        >
          {/* Collapse Button (visible only on desktop) */}
          {!isMobile && (
            <IconButton
              onClick={toggleSidebar}
              sx={{
                position: "fixed",
                top: 16,
                left: open ? drawerWidth - 12 : collapsedWidth - 12,
                zIndex: theme.zIndex.drawer + 1,
                backgroundColor: "#fff",
                border: `2px solid ${theme.palette.primary.light}`,
                color: theme.palette.primary.main,
                boxShadow: theme.shadows[2],
                transition: "left 0.3s ease-in-out, transform 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: theme.palette.primary.light,
                  transform: "scale(1.1)",
                  color: theme.palette.primary.dark,
                },
                transform: open ? "rotate(0deg)" : "rotate(180deg)",
              }}
              size="medium"
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronLeft />
            </IconButton>
          )}

          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AppSidebar;