CREATE TABLE users (
    id         BIGINT PRIMARY KEY,
    username     VARCHAR(32) UNIQUE NOT NULL,
    display_name VARCHAR(64) NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url   TEXT,
    status       VARCHAR(16) NOT NULL DEFAULT 'offline',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE servers (
    id       BIGINT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE server_members (
    server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname  VARCHAR(64),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (server_id, user_id)
);

CREATE TABLE roles (
    id          BIGINT PRIMARY KEY,
    server_id   BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    name        VARCHAR(64) NOT NULL,
    permissions BIGINT NOT NULL DEFAULT 0,
    color       VARCHAR(7),
    position    INT NOT NULL DEFAULT 0
);

CREATE TABLE member_roles (
    server_id BIGINT NOT NULL,
    user_id   BIGINT NOT NULL,
    role_id   BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (server_id, user_id, role_id),
    FOREIGN KEY (server_id, user_id) REFERENCES server_members(server_id, user_id) ON DELETE CASCADE
);

CREATE TABLE channels (
    id        BIGINT PRIMARY KEY,
    server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    name      VARCHAR(100) NOT NULL,
    type      VARCHAR(16) NOT NULL DEFAULT 'text',
    position  INT NOT NULL DEFAULT 0,
    topic     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE threads (
    id                BIGINT PRIMARY KEY,
    channel_id        BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    parent_message_id BIGINT NOT NULL,
    name              VARCHAR(100) NOT NULL,
    created_by        BIGINT NOT NULL REFERENCES users(id),
    archived          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
    id         BIGINT PRIMARY KEY,
    channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    author_id  BIGINT NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL,
    thread_id  BIGINT REFERENCES threads(id) ON DELETE SET NULL,
    edited_at  TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Efficient pagination index: fetch messages in a channel ordered by snowflake ID
CREATE INDEX idx_messages_channel_id ON messages (channel_id, id);

-- Foreign key for parent_message_id in threads (deferred because messages table must exist)
ALTER TABLE threads ADD CONSTRAINT fk_threads_parent_message
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE CASCADE;

CREATE TABLE invites (
    code      VARCHAR(16) PRIMARY KEY,
    server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    max_uses  INT,
    uses      INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
