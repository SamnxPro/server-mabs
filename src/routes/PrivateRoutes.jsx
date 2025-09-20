import React, { useContext, useEffect } from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

export default function PrivateRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Home />}></Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
