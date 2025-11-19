# Acceso a MySQL con Pool de conexiones

## 1️⃣ Qué es un **Pool de Conexiones**

Un **Pool de conexiones** es un conjunto de conexiones abiertas a la base de datos que se mantienen activas y se reutilizan en lugar de abrir y cerrar una conexión para cada consulta.

En el ejemplo:

```jsx
this.pool = mysql.createPool(this.config)
```

- Se crean varias conexiones (hasta `connectionLimit`) listas para usar.
- Cada vez que ejecutamos una consulta, **una conexión libre del pool se asigna automáticamente**.
- Al terminar la consulta, la conexión **se libera y queda disponible para otra consulta**:

```jsx
this.pool.getConnection((err, connection) => {
    // usamos la conexión
    connection.release(); // devuelve la conexión al pool
});
```

---

## 2️⃣ Cómo funciona en el código

1. **Creación del pool**

```jsx
this.pool = mysql.createPool({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    connectionLimit: process.env.DB_MAXCONNECTIONS
});
```

- `connectionLimit` define cuántas conexiones abiertas simultáneamente puede mantener el pool.
- Si hay más solicitudes concurrentes que conexiones disponibles, MySQL espera hasta que una conexión se libere.
1. **Consulta usando el pool**

```jsx
this.pool.query(sql, values, (err, rows) => { ... });
```

- Node busca una conexión libre automáticamente.
- Ejecuta la consulta y **devuelve la conexión al pool**.
- Ya no necesitas abrir o cerrar la conexión manualmente.
1. **Cierre del pool al terminar la app**

```jsx
process.on('SIGINT', async () => {
    await this.pool.end();
});
```

- Esto cierra todas las conexiones abiertas del pool cuando el proceso termina (CTRL+C).
- Evita conexiones "colgadas" en la base de datos.

---

## 3️⃣ Ventajas del Pool de Conexiones

1. **Rendimiento mejorado**
    - No se abre y cierra una conexión para cada consulta.
    - Ideal para aplicaciones con muchas consultas concurrentes.
2. **Reutilización de conexiones**
    - Cada conexión se puede usar múltiples veces, reduciendo el overhead de MySQL.
3. **Control de concurrencia**
    - Puedes limitar cuántas conexiones abiertas simultáneamente con `connectionLimit`.
    - Evita saturar el servidor de base de datos.
4. **Manejo automático de conexiones**
    - No es necesario liberar manualmente cada conexión si usamos métodos como `pool.query()`.

---

## 4️⃣ Inconvenientes del Pool de Conexiones

1. **Consumo de recursos**
    - Cada conexión abierta consume memoria y recursos en MySQL.
    - Si `connectionLimit` es muy alto, puede sobrecargar el servidor.
2. **Complejidad en errores**
    - Algunas veces los errores pueden surgir por conexiones bloqueadas o agotadas (`pool.getConnection()` puede fallar si todas están ocupadas).
    - Es importante manejar errores de pool correctamente.
3. **Cierre de la app**
    - Si no cerramos correctamente el pool (`pool.end()`), las conexiones pueden quedar "colgadas" en MySQL.
4. **No siempre necesario**
    - Para apps pequeñas o con pocas consultas concurrentes, un pool no aporta gran ventaja.
    - En esos casos, usar conexión simple (abrir/cerrar cada vez) es suficiente y más simple.

---

## 5️⃣ Diferencia con conexión simple

| Característica | Conexión simple | Pool de conexiones |
| --- | --- | --- |
| Abrir/Cerrar cada consulta | ✅ | ❌ (reutiliza conexiones) |
| Rendimiento | Menor | Mayor, ideal para muchas consultas concurrentes |
| Consumo de recursos | Bajo | Puede ser alto si `connectionLimit` es grande |
| Complejidad | Baja | Media (hay que manejar pool correctamente) |
| Escalabilidad | Limitada | Alta, más adecuado para apps grandes |

💡 **Resumen guarripeich**:

> El pool de conexiones es como un “grupo de trabajadores listos para actuar” en vez de contratar uno nuevo cada vez que llega un cliente. Esto ahorra tiempo y recursos, pero hay que controlar cuántos trabajadores hay para no saturar la oficina.
> 

---

---

---

---

# Node.js vs PHP/Laravel (Apache/PHP-FPM)

Cómo funcionan, qué diferencias tienen y por qué Node.js es tan eficiente.

# **1. Concurrencia: El modelo de ejecución**

## **Node.js**

- JavaScript corre en **un solo hilo** (event loop).
- Las operaciones que tardan (MySQL, archivos, red…) se envían al **thread pool interno** de Node (libuv).
- Mientras estas tareas trabajan en segundo plano, **el event loop sigue atendiendo más peticiones**.
- No hay un hilo nuevo por petición.
    
    🔹 **Ventaja:** puede atender miles de conexiones simultáneas con muy poca memoria.
    

---

## **PHP/Laravel (Apache o PHP-FPM)**

- Cada petición HTTP se procesa en **un worker** (proceso o hilo).
- Cada worker ejecuta PHP de principio a fin.
- Cada petición abre y cierra su conexión a la base de datos.
- Si hay 200 peticiones simultáneas → 200 procesos/hilos.

🔹 **Ventaja:** cada petición es completamente aislada.

🔹 **Desventaja:** muchas peticiones simultáneas = mucho consumo de RAM.

---

# **2. Asincronía: `async/await` y Promesas**

## **JavaScript**

- `async/await` **no crea hilos**.
- Es simplemente “pausar esta función hasta que llegue la respuesta”.
- **Mientras tanto**, el event loop atiende otras peticiones.
- Internamente usa **Promesas**.
    
    

🔹 **Conclusión:**

`async/await` es solo una forma más limpia de escribir Promesas.

No bloquea el hilo principal.

---

## **PHP**

- PHP es **síncrono** por defecto.
- Una petición no avanza hasta que termina la consulta a la base de datos.
- Como cada petición tiene su propio worker, el bloqueo **no afecta** a las demás.

---

# **3. Conexiones a MySQL**

## **Node.js**

- Usualmente se usa un **pool de conexiones real** (mysql2, pg, etc.).
- Varias peticiones reutilizan las mismas conexiones abiertas.
- Muy eficiente y escalable.

---

## **Laravel / PHP**

- **No tiene un pool real** entre peticiones.
- Cada petición abre su propia conexión y la cierra al terminar.
- PDO tiene modo “persistente”, pero:
    - se mantiene **por proceso**, no entre procesos
    - Laravel no lo gestiona como pool
    - no es pooling real

🔹 Excepción:

Con **Laravel Octane (Swoole / RoadRunner)** sí puede haber conexiones persistentes.

---

# **4. Rendimiento y escalabilidad**

| Característica | Node.js | Apache/PHP-FPM |
| --- | --- | --- |
| Modelo | Monohilo + event loop | Multihilo/multiproceso |
| Conexión por petición | ❌ No | ✔️ Sí |
| Pool de conexiones | ✔️ Sí | ❌ No (salvo casos especiales) |
| Coste por conexión | Muy bajo | Alto |
| Concurrencia | Excelente (miles) | Limitada por RAM |
| Tiempo real (WS) | Muy bueno | Muy difícil |
| Aislamiento | Bajo | Alto |

# **5. ¿Por qué Node.js puede atender tantas conexiones?**

Porque:

- No crea hilos por cliente.
- Solo tiene **un hilo** ejecutando JS.
- Las tareas lentas se derivan a hilos internos del sistema.
    
    En Node.js:
    
    - El **código JavaScript** se ejecuta siempre en **un solo hilo principal** (event loop).
    - Pero **las operaciones de I/O** (disco, red, MySQL, DNS, etc.) **no** se ejecutan en ese hilo.
    - Esas operaciones se pasan a **un conjunto de hilos internos** administrados por **libuv** (la librería que Node usa para gestionar I/O asincrono).
    
    Estos hilos **no son hilos del sistema para tu código JavaScript**, pero **sí son hilos reales en segundo plano** que ejecutan operaciones bloqueantes.
    
- Mientras espera respuestas, **acepta otras solicitudes**.

🔹 Resultado:

Más usuarios con menos hardware.

---

# **6. ¿Cuándo usar cada uno?**

## **Node.js (ideal para):**

- APIs de alta concurrencia
- Tiempo real (websockets, chat, juegos)
- Streaming y eventos
- Microservicios
- IoT
- Aplicaciones con MUCHO I/O

---

## **PHP/Laravel (ideal para):**

- Web tradicional (HTML, Blade)
- CMS (WordPress, Drupal)
- Backoffice, paneles administrativos
- Aplicaciones con carga moderada
- Entornos donde el aislamiento por proceso es deseable

---

# **7. Resumen final**

- Node.js es monohilo, pero puede manejar miles de clientes gracias al event loop.
- `async/await` no crea hilos: es solo sintaxis más limpia para Promesas.
- Node usa pools verdaderos de conexiones a DB; PHP no.
- Apache/PHP-FPM maneja una petición por proceso/hilo.
- Node es superior para tiempo real y alta concurrencia.
- PHP es superior para web tradicional y CMS.