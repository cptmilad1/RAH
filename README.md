# RAH-project
nothing for this time

## Parcel shipments

The authenticated shipment dashboard is available at `/shipments`. The API is mounted at `/api/parcels` and supports listing a user's shipments, creating a shipment, viewing tracking details, and cancelling an eligible shipment.

For an existing database, apply `DataBase/migrations/20261028_add_parcel_recipient_details.sql` before using shipment creation. New databases should use the updated `DataBase/schema/Schema.sql`.

Shipment UI is organized into small components under `FrontEnd/src/features/shipments/components`, with page state in `hooks/useShipmentPage.js` and shared labels/form defaults in `shipmentConstants.js`. Backend request handlers live in `BackEnd/Post/controller`, input validation in `BackEnd/Post/services`, and database queries/transactions in `BackEnd/Post/repositories`.
