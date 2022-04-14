-- SELECT * FROM pg_catalog.pg_tables;
-- DROP TABLE IF EXISTS users, fullz, _prisma_migrations;


-- CreateTable
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    balance FLOAT,
    chatid VARCHAR UNIQUE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS fullz (
    id SERIAL PRIMARY KEY,
    owner BIGINT,
    dob VARCHAR,
    bin VARCHAR
);