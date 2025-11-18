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
2. **Consulta usando el pool**

```jsx
this.pool.query(sql, values, (err, rows) => { ... });
```

    - Node busca una conexión libre automáticamente.
    - Ejecuta la consulta y **devuelve la conexión al pool**.
    - Ya no necesitas abrir o cerrar la conexión manualmente.
3. **Cierre del pool al terminar la app**

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