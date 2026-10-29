# 💰 Control de Cuchumbal

Sistema web para llevar el control de un cuchumbal (ahorro rotativo entre compañeros de trabajo).

## Funciones
- Acceso con usuario y contraseña (3 usuarios autorizados), validado en el servidor.
- Los datos se guardan en el servidor (Netlify Blobs): todos los usuarios ven los mismos datos desde cualquier dispositivo.
- Registro de participantes (nombre y apellido), mínimo 25, hasta 50.
- Cuota fija de L 300 semanales, 4 semanas por mes, 4 meses (16 semanas, total L 4,800 por persona).
- Búsqueda por nombre: al agregar otra cuota se suma a la misma persona, sin duplicar registros.
- Control semanal con "Lleva aportado" y "Falta" automáticos. Al llegar a L 4,800 no se aceptan más cuotas.
- Ruleta de turnos sin repetir; el turno sorteado se refleja en la tabla principal.
- Quitar nombres o turnos de la ruleta solo afecta a la ruleta, no a los participantes.
- Eliminar o anular registros requiere autorización del usuario administrador.

## Estructura
```
index.html                 Estructura de la página
src/main.js                Lógica del sistema
src/style.css              Estilos
netlify/functions/api.mjs  Servidor: valida usuarios y guarda los datos
netlify.toml               Configuración de Netlify
vite.config.js             Configuración de Vite
```

## Publicar en Netlify (necesario desde GitHub o CLI)
Como ahora hay servidor, ya no sirve arrastrar una carpeta a Netlify Drop.

### Opción A: desde GitHub
1. Sube todo el contenido de esta carpeta a un repositorio de GitHub.
2. En Netlify: Add new site → Import an existing project → elige el repositorio.
3. Netlify lee `netlify.toml` (instala, compila y activa la función). Pulsa Deploy.

### Opción B: con Netlify CLI
```
npm install
npm install -g netlify-cli
netlify login
netlify deploy --build --prod
```

## Notas
- Si dos personas guardan al mismo tiempo, el sistema avisa y recarga los datos más recientes.
- Cada 15 segundos la página busca cambios de otros usuarios.
- Las contraseñas no viajan en el código de la página: solo las huellas están en `netlify/functions/api.mjs`. Mantén el repositorio privado.

Créditos: DENIS MAIRENA
