# InteriorHub API

GET /api/health
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/request-otp
POST /api/auth/verify-otp
POST /api/auth/logout
GET /api/me
GET /api/state
PUT /api/state
GET /api/messages?projectId=...
POST /api/messages
GET /api/events?token=...

When served by Node, the frontend automatically uses the same origin.
Direct HTML testing may override the API with `?api=http://localhost:8787`.
