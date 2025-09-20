import React from 'react'
import AvatarPerfil from './perfil/AvatarPerfil.jsx'
import MenuDepegable from './perfil/MenuDepegable.jsx'
import MenuPerfil from './navegacion/MenuPerfil.jsx'

export default function Home() {
  return (
    <>
      <div
        style={{
          backgroundColor: "#E66DD4",
          minHeight: "100vh", // ocupa toda la altura de la pantalla
          minWidth: "100vw",  // ocupa todo el ancho
        }}
      >
        <MenuPerfil/>
        <AvatarPerfil />
      </div>
      
    </>
  )
}
