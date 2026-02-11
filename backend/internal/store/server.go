package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robwittman/possessive-potato/backend/internal/model"
)

type ServerStore struct {
	db *pgxpool.Pool
}

func NewServerStore(db *pgxpool.Pool) *ServerStore {
	return &ServerStore{db: db}
}

func (s *ServerStore) Create(ctx context.Context, server *model.Server) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO servers (id, name, owner_id, icon_url) VALUES ($1, $2, $3, $4)`,
		server.ID, server.Name, server.OwnerID, server.IconURL,
	)
	if err != nil {
		return fmt.Errorf("create server: %w", err)
	}
	return nil
}

func (s *ServerStore) GetByID(ctx context.Context, id int64) (*model.Server, error) {
	var srv model.Server
	err := s.db.QueryRow(ctx,
		`SELECT id, name, owner_id, icon_url, created_at FROM servers WHERE id = $1`, id,
	).Scan(&srv.ID, &srv.Name, &srv.OwnerID, &srv.IconURL, &srv.CreatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get server: %w", err)
	}
	return &srv, nil
}

func (s *ServerStore) ListByUser(ctx context.Context, userID int64) ([]model.Server, error) {
	rows, err := s.db.Query(ctx,
		`SELECT s.id, s.name, s.owner_id, s.icon_url, s.created_at
		 FROM servers s
		 JOIN server_members sm ON s.id = sm.server_id
		 WHERE sm.user_id = $1
		 ORDER BY s.created_at`, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("list servers: %w", err)
	}
	defer rows.Close()

	var servers []model.Server
	for rows.Next() {
		var srv model.Server
		if err := rows.Scan(&srv.ID, &srv.Name, &srv.OwnerID, &srv.IconURL, &srv.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan server: %w", err)
		}
		servers = append(servers, srv)
	}
	return servers, nil
}

func (s *ServerStore) AddMember(ctx context.Context, serverID, userID int64) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO server_members (server_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		serverID, userID,
	)
	if err != nil {
		return fmt.Errorf("add member: %w", err)
	}
	return nil
}

func (s *ServerStore) Update(ctx context.Context, server *model.Server) error {
	_, err := s.db.Exec(ctx,
		`UPDATE servers SET name = $1, icon_url = $2 WHERE id = $3`,
		server.Name, server.IconURL, server.ID,
	)
	if err != nil {
		return fmt.Errorf("update server: %w", err)
	}
	return nil
}

func (s *ServerStore) IsMember(ctx context.Context, serverID, userID int64) (bool, error) {
	var exists bool
	err := s.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2)`,
		serverID, userID,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check membership: %w", err)
	}
	return exists, nil
}

func (s *ServerStore) RemoveMember(ctx context.Context, serverID, userID int64) error {
	_, err := s.db.Exec(ctx,
		`DELETE FROM server_members WHERE server_id = $1 AND user_id = $2`,
		serverID, userID,
	)
	if err != nil {
		return fmt.Errorf("remove member: %w", err)
	}
	return nil
}

func (s *ServerStore) Delete(ctx context.Context, id int64) error {
	_, err := s.db.Exec(ctx, `DELETE FROM servers WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete server: %w", err)
	}
	return nil
}
