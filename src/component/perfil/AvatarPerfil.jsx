// Asegúrate de que el archivo se llame Navbar.jsx, no Narvbar.jsx
import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import MenuDepegable from './MenuDepegable';

const AvatarPerfil = () => {
    const [open, setOpen] = useState(false)
  return (
    <>    
    <MenuDepegable/>
    </>

  );
};

export default AvatarPerfil;
