import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import checkAdmin from './functions/checkAdmin';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(window.location.pathname.replace('/',''));
  const navigate = useNavigate();

  const StyledListItemIcon = styled(ListItemIcon)(({ active }) => ({
    justifyContent: 'center',
    color: 'white',
    borderRadius: '12px',
    backgroundColor: active ? '#ffa02c' : 'rgba(255, 255, 255, 0.1)',
    padding: '10px',
    minWidth: 'unset',
    margin: '6px',
    '&:hover': {
      backgroundColor: '#ffa02c',
      cursor: 'pointer'
    },
  }));
  const role = checkAdmin()?.role;
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 80,
          boxSizing: 'border-box',
          backgroundColor: '#623cea',
          display: 'flex',
          alignItems: 'center',
        },
      }}
    >
      <List sx={{ width: '100%', paddingTop: 0, textAlign: 'center' }}>
        <ListItem sx={{ justifyContent: 'center', paddingY: 2, marginBottom: '50px' }}>
          <div style={{ textAlign: 'center', width: '100%', color: 'white', fontWeight: 'bold' }}>
            eco
          </div>
        </ListItem>

        <StyledListItemIcon active={activeItem === 'dashboard'} onClick={() => {
          setActiveItem('dashboard')
          return navigate('/dashboard')
          }}>
          <HomeIcon />
        </StyledListItemIcon>

        {
          role == 'superadmin' ? 
          <StyledListItemIcon active={activeItem === 'users'} onClick={() => {
            setActiveItem('users')
            return navigate('/users')
            }}>
            <ListAltIcon />
          </StyledListItemIcon>  : null
        }


        <StyledListItemIcon active={activeItem === 'profile'} onClick={() => {
          setActiveItem('profile');
          return navigate('/profile')
          }}>
          <PersonIcon />
        </StyledListItemIcon>
        <StyledListItemIcon active={activeItem === 'teteeetetfff'} onClick={() => {
          localStorage.removeItem('user')
          return navigate('/login')
        }}>
          <LogoutIcon />
        </StyledListItemIcon>
      </List>
    </Drawer>
  );
};

export default Sidebar;
