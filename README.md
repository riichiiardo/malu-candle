# Malu Candle

Primera implementación local del ecommerce de Malu Candle: homepage editorial, compra por ocasión, filtros, búsqueda, carrito lateral y base de datos Supabase preparada.

## Ejecutar localmente

```bash
docker compose up --build
```

Abrir `http://localhost:8080`.

Para una prueba sin Docker:

```bash
npm test
npm run dev
```

## Supabase

La migración `supabase/migrations/001_malu_candle_catalog.sql` contiene el catálogo, variantes, imágenes, categorías, clientes, pedidos e items de pedido, con RLS habilitado.

La aplicación funciona con catálogo visual local mientras se crea el proyecto remoto. Cuando Supabase esté disponible, se añadirá el cliente publishable en una siguiente iteración sin exponer claves secretas.
