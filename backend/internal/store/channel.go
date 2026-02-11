package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robwittman/possessive-potato/backend/internal/model"
)

type ChannelStore struct {
	db *pgxpool.Pool
}

func NewChannelStore(db *pgxpool.Pool) *ChannelStore {
	return &ChannelStore{db: db}
}

func (s *ChannelStore) Create(ctx context.Context, ch *model.Channel) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO channels (id, server_id, name, type, position, topic) VALUES ($1, $2, $3, $4, $5, $6)`,
		ch.ID, ch.ServerID, ch.Name, ch.Type, ch.Position, ch.Topic,
	)
	if err != nil {
		return fmt.Errorf("create channel: %w", err)
	}
	return nil
}

func (s *ChannelStore) GetByID(ctx context.Context, id int64) (*model.Channel, error) {
	var ch model.Channel
	err := s.db.QueryRow(ctx,
		`SELECT id, server_id, name, type, position, topic, created_at FROM channels WHERE id = $1`, id,
	).Scan(&ch.ID, &ch.ServerID, &ch.Name, &ch.Type, &ch.Position, &ch.Topic, &ch.CreatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get channel: %w", err)
	}
	return &ch, nil
}

func (s *ChannelStore) ListByServer(ctx context.Context, serverID int64) ([]model.Channel, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, server_id, name, type, position, topic, created_at
		 FROM channels WHERE server_id = $1 ORDER BY position`, serverID,
	)
	if err != nil {
		return nil, fmt.Errorf("list channels: %w", err)
	}
	defer rows.Close()

	var channels []model.Channel
	for rows.Next() {
		var ch model.Channel
		if err := rows.Scan(&ch.ID, &ch.ServerID, &ch.Name, &ch.Type, &ch.Position, &ch.Topic, &ch.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan channel: %w", err)
		}
		channels = append(channels, ch)
	}
	return channels, nil
}

func (s *ChannelStore) Delete(ctx context.Context, id int64) error {
	_, err := s.db.Exec(ctx, `DELETE FROM channels WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete channel: %w", err)
	}
	return nil
}
