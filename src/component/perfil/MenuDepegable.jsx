import { useState } from "react";
import './MenuDes.css'
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

  
export default function DrawerExample({ }) {
  const [open, setOpen] = useState(false);

  return (
    <Stack style={{
    // 85% del ancho de la ventana
            color: "red"
          }} >



      {open && (
        <div className="fixed top-0 right-0 w-64 h-64 bg-white shadow-lg p-4">
          <button
            className="mb-4 text-red-500"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </button>

          {/* Aquí va el perfil */}
          <div>
            <h2 className="text-xl font-bold">Perfil</h2>
            <p>Nombre: Juan Pixel</p>
            <p>Email: juan@example.com</p>
          </div>
        </div>
      )}
    </Stack >
  );
}
