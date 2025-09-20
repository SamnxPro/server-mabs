import React, { useContext } from 'react'
import userContext  from '../auth/hooks/AuthContext.jsx'; 
import PublicRoutes from './PublicRoutes.jsx';
import PrivateRoutes from './PrivateRoutes.jsx';


export default function LayaouRoutes() {


    const {user} = useContext(userContext)

  return (
    <React.Fragment>
    {user ? <PrivateRoutes/> : <PublicRoutes />}
  </React.Fragment>
  )
}