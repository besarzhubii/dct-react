import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const ProfileForm = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = React.useState({
    name: '',
    email: '',
    password: '',
    klavyio: '',
    shopify: '',
    facebook: '',
    google: '',
    role: ''
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const user = JSON.parse(localStorage.getItem('user') as any);
  const userId = JSON.parse(localStorage.getItem('user') as any).id;

  React.useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_API}/user/${user?.id}`)
      .then((response) => {
        setUserData(response.data);
        setError('');
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError('Failed to fetch user data.');
        setIsLoading(false);
      });
  }, [userId]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "emaieel") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError("Invalid email format.");
        return;
      } else {
        setError("");
      }
    }

    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError("Invalid email format.");
      return;
    } else {
      setError("");
    }
    setIsLoading(true);
    axios
      .put(`${process.env.REACT_APP_API}/user/${user?.id}`, userData)
      .then(() => {
        setIsLoading(false);
        setError('');
        setSuccess('User updated successfully!');
      })
      .catch((error) => {
        setIsLoading(false);
        setError('Failed to update profile.');
      });
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f8f8f8' }}>
      <Sidebar />
      {
        !isLoading ? 
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <CssBaseline enableColorScheme />
          <Stack direction="column" justifyContent="center" sx={{ minHeight: '100vh', padding: 2 }}>
            <Card variant="outlined">
              <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
              >
                Update Profile
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
              >
                <FormControl>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <TextField
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    fullWidth
                    variant="outlined"
                    required
                  />
                </FormControl>
  
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    required
                    error={!!error}
                    helperText={error}
                  />
                </FormControl>
  
                <FormControl>
                  <FormLabel htmlFor="klavyio">Klavyio</FormLabel>
                  <TextField
                    id="klavyio"
                    name="klavyio"
                    value={userData.klavyio}
                    onChange={handleInputChange}
                    placeholder="Enter Klavyio ID"
                    fullWidth
                    variant="outlined"
                    required
                  />
                </FormControl>
  
                <FormControl>
                  <FormLabel htmlFor="shopify">Shopify</FormLabel>
                  <TextField
                    id="shopify"
                    name="shopify"
                    value={userData.shopify}
                    onChange={handleInputChange}
                    placeholder="Enter Shopify ID"
                    fullWidth
                    variant="outlined"
                    required
                  />
                </FormControl>
  
                <FormControl>
                  <FormLabel htmlFor="facebook">Facebook</FormLabel>
                  <TextField
                    id="facebook"
                    name="facebook"
                    value={userData.facebook}
                    onChange={handleInputChange}
                    placeholder="Enter Facebook ID"
                    fullWidth
                    variant="outlined"
                    required
                  />
                </FormControl>
  
                <FormControl>
                  <FormLabel htmlFor="google">Google</FormLabel>
                  <TextField
                    id="google"
                    name="google"
                    value={userData.google}
                    onChange={handleInputChange}
                    placeholder="Enter Google ID"
                    fullWidth
                    variant="outlined"
                    required
                  />
                </FormControl>
  
                {error && <Typography color="error">{error}</Typography>}
                {success && <Typography color="success">{success}</Typography>}
                <Button type="submit" fullWidth variant="contained">
                  Update Profile
                </Button>
              </Box>
            </Card>
          </Stack>
        </Box> : <CircularProgress />
      }
    </Box>
  );
};

export default ProfileForm;
