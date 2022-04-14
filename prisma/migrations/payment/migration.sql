
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    chatid BIGINT,
    amount INT,
    currency VARCHAR
);