# Seguridad

Velora es una PWA **sin servidor**: no hay cuentas, ni API, ni base de datos remota, ni analítica.
Todo vive en el navegador del dispositivo (IndexedDB). Eso elimina la mayor parte de la superficie
de ataque, pero no toda. Este documento dice qué está protegido, contra qué, y qué **no**.

## Modelo de amenazas

| Amenaza | Mitigación | Estado |
| --- | --- | --- |
| Alguien coge el móvil desbloqueado y abre la app | Bloqueo con PIN opcional + bloqueo automático tras 1 min en segundo plano | ✅ |
| Alguien lee los ficheros del navegador / copia de seguridad del perfil | Con PIN: datos **cifrados en reposo** (AES-GCM-256, clave derivada con PBKDF2-SHA256 × 600 000) | ✅ |
| El selector de apps de iOS muestra el saldo en la miniatura | Portada de privacidad al pasar a segundo plano (con PIN activo) | ✅ |
| Prueba de PIN por fuerza bruta en el teclado | Espera progresiva: tras 5 fallos, 30 s, duplicando hasta 15 min | ✅ |
| Inyección de script (XSS) que lea los datos | CSP estricta (`script-src 'self'`, sin `unsafe-eval`, `connect-src 'self'`), React escapa todo, sin `dangerouslySetInnerHTML`, cero scripts de terceros | ✅ |
| Exfiltración de datos si hubiera XSS | `connect-src 'self'` + `form-action 'none'`: no se puede enviar nada a otro dominio | ✅ |
| Clickjacking (la app dentro de un iframe ajeno) | `frame-ancestors 'none'` + `X-Frame-Options: DENY` (Vercel) | ✅ Vercel / ⚠️ GitHub Pages no permite cabeceras |
| Importar un JSON malicioso | Validación estricta campo a campo, límites de tamaño y longitud, sin prototype pollution (test) | ✅ |
| Safari borra IndexedDB tras 7 días sin uso (ITP) | Guía de instalación en pantalla de inicio por navegador + `navigator.storage.persist()` + exportar copia | ✅ |
| Dependencias vulnerables | `npm audit --omit=dev --audit-level=high` en CI | ✅ |

### Lo que **no** protege (honestidad)

- **Malware en el dispositivo** o alguien con el móvil y la app **ya desbloqueada**.
- **Un PIN corto es un espacio pequeño.** 4 dígitos = 10 000 combinaciones. PBKDF2 hace cada intento
  offline lento (≈ cientos de ms en un móvil), no imposible para un atacante con GPU y una copia de
  los datos. Si quieres más margen, usa 6–8 dígitos.
- **Si se olvida el PIN, los datos no se pueden recuperar.** No hay puerta trasera, a propósito.
  Exporta una copia (Ajustes → Exportar copia) de vez en cuando.
- **La copia exportada (JSON) no va cifrada.** Trátala como un documento privado.
- El contador de intentos vive en `localStorage`; quien tenga herramientas de desarrollador puede
  borrarlo, pero esa persona ya podría atacar el cifrado offline, así que no añade riesgo.
- En **GitHub Pages** no se pueden enviar cabeceras HTTP: la CSP va por `<meta>` (funciona), pero
  `frame-ancestors`, HSTS y `X-Frame-Options` solo se aplican en **Vercel** (`vercel.json`).

## Detalles del cifrado (`src/lib/vault.ts`)

- KDF: PBKDF2-HMAC-SHA256, 600 000 iteraciones (recomendación OWASP 2023), sal aleatoria de 16 bytes.
- Cifrado: AES-GCM 256 bits, IV aleatorio de 12 bytes **nuevo en cada escritura**.
- La clave es `CryptoKey` **no extraíble** (WebCrypto): el código puede usarla, nunca leerla.
- Al bloquear, la clave y los datos en claro se descartan de memoria; en disco solo hay ciphertext.
- La etiqueta de autenticación de GCM detecta cualquier manipulación del fichero (test incluido).
- Tests: `src/test/vault.test.ts` (ida y vuelta, PIN erróneo, IV único, manipulación, clave no extraíble).
- E2E: `scripts/e2e.cjs` comprueba que en IndexedDB **no aparece** ningún dato en claro con el PIN activo.

## Avisos conocidos de `npm audit`

`glob` / `minimatch` (moderado, ReDoS) llegan vía `vite-plugin-pwa → workbox-build`. Solo se ejecutan
**al compilar**, sobre patrones fijos del propio proyecto; no se distribuyen a los usuarios. Se
revisarán cuando `workbox-build` actualice. Dependencias de producción: 0 vulnerabilidades.

## Reportar un problema

Abre un issue privado (Security → Report a vulnerability) en el repositorio.
