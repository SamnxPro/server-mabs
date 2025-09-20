import React from 'react'
import { AuthContext } from '../auth/hooks/AuthContext.jsx'
import LayoutRoutes from './LayaouRoutes'


//pero que dato ?
export default function Index() {
 
  return (
    <AuthContext> 
      <LayoutRoutes/>
    </AuthContext>

  )
}
