import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from './theme/App.Theme';
import ColorModeSelect from './theme/ColorModeSelect';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useColorScheme } from '@mui/material/styles';

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

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [loginError, setLoginError] = React.useState(false)
  const [loginErrorMessage, setLoginErrorMessage] = React.useState('')
  const [open, setOpen] = React.useState(false);
  const { mode, systemMode, setMode } = useColorScheme();

    const [errorMessage, setErrorMessage] = React.useState('');
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [klavyio, setKlaviyo] = React.useState('');
    const [facebook, setFacebook] = React.useState('');
    const [shopify, setShopify] = React.useState('');
  const navigate = useNavigate();
  React.useEffect(() => {
    setMode('dark');
  },[]);



  const submitData = async (e:any) => {
    e.preventDefault();
    const data = {
        name,
        email,
        password,
        klavyio,
        facebook,
        shopify
    }
    
    const addUser = await axios.post(`${process.env.REACT_APP_API}/user/add`,{
      ...data
    })
      .then(function (response) {
        setErrorMessage('')
        navigate('/login')
      })
      .catch(function (error) {
        setErrorMessage('Something went wrong, please try again!');
      })
}
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={submitData}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <TextField
              style={{marginBottom:'15px'}}
                  type="text"
                  label="Name"
                  variant="outlined"
                  onChange={(e) => {setName(e.target.value)}}
              />
              <TextField
              style={{marginBottom:'15px'}}
                  type="text"
                  label="E-mail"
                  variant="outlined"
                  onChange={(e) => {setEmail(e.target.value)}}
              />
              <TextField
              style={{marginBottom:'15px'}}
                  type="password"
                  label="Password"
                  variant="outlined"
                  onChange={(e) => {setPassword(e.target.value)}}
              />
              <TextField
              style={{marginBottom:'15px'}}
                  type="text"
                  label="Klaviyo API key"
                  variant="outlined"
                  onChange={(e) => {setKlaviyo(e.target.value)}}
              />
              <TextField
              style={{marginBottom:'15px'}}
                  type="text"
                  label="Facebook API key"
                  variant="outlined"
                  onChange={(e) => {setFacebook(e.target.value)}}
              />
              <TextField
              style={{marginBottom:'15px'}}
                  type="text"
                  label="Shopify API key"
                  variant="outlined"
                  onChange={(e) => {setShopify(e.target.value)}}
              />
            </FormControl>
            {errorMessage}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={(e) => submitData(e)}
            >
              Sign Up
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
