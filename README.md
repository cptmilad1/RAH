# RAH-project
nothing for this time

## Parcel shipments

The authenticated shipment dashboard is available at `/shipments`. The API is mounted at `/api/parcels` and supports listing a user's shipments, creating a shipment, viewing tracking details, and cancelling an eligible shipment.

For an existing database, apply `DataBase/migrations/20261028_add_parcel_recipient_details.sql` before using shipment creation. New databases should use the updated `DataBase/schema/Schema.sql`.

Shipment UI is organized into small components under `FrontEnd/src/features/shipments/components`, with page state in `hooks/useShipmentPage.js` and shared labels/form defaults in `shipmentConstants.js`. Backend request handlers live in `BackEnd/Post/controller`, input validation in `BackEnd/Post/services`, and database queries/transactions in `BackEnd/Post/repositories`.

## Live presence

The backend runs Socket.IO on the existing HTTP server. Authenticated sockets join a private `user:<id>` room; presence is announced to connected clients and is only set offline after the last socket leaves that room. Socket.IO heartbeat/disconnect detection handles lost devices, and `logout-all` disconnects every socket for that user. The Vite dev server proxies `/socket.io` to the backend. If the backend is later scaled across multiple processes or hosts, configure a shared Socket.IO adapter so room membership and presence checks span all instances.
