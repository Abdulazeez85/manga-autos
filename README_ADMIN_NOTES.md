Admin quick notes

- Start server with an admin token:

  For development (Windows PowerShell):

  $env:ADMIN_TOKEN='my-secret-token'
  npm run dev

  Or (cmd):

  set ADMIN_TOKEN=my-secret-token && npm run dev

- Protected endpoints (require header `Authorization: Bearer <ADMIN_TOKEN>`):
  - POST /api/vehicles
  - PUT /api/vehicles/:id
  - DELETE /api/vehicles/:id

- Example curl to add a vehicle:

  curl -X POST http://localhost:3000/api/vehicles \
    -H "Authorization: Bearer my-secret-token" \
    -H "Content-Type: application/json" \
    -d '{"brand":"Test","model":"T1","year":2022,"price":1000000}'

- Example curl to edit a vehicle:

  curl -X PUT http://localhost:3000/api/vehicles/v123456789 \
    -H "Authorization: Bearer my-secret-token" \
    -H "Content-Type: application/json" \
    -d '{"price":1200000}'

- Bookings endpoint now validates `name` and `phone` fields.
