CREATE TABLE "user" (
    id              SERIAL PRIMARY KEY, 
    "name"          VARCHAR(64) NOT NULL,
    "password"      TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    "companyName"   TEXT
);