package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robwittman/possessive-potato/backend/internal/model"
)

type MessageStore struct {
	db *pgxpool.Pool
}

func NewMessageStore(db *pgxpool.Pool) *MessageStore {
	return &MessageStore{db: db}
}

func (s *MessageStore) Create(ctx context.Context, msg *model.Message) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO messages (id, channel_id, author_id, content, thread_id) VALUES ($1, $2, $3, $4, $5)`,
		msg.ID, msg.ChannelID, msg.AuthorID, msg.Content, msg.ThreadID,
	)
	if err != nil {
		return fmt.Errorf("create message: %w", err)
	}
	return nil
}

// ListByChannel returns messages using cursor-based pagination with snowflake IDs.
// Pass before=0 to get the latest messages.
func (s *MessageStore) ListByChannel(ctx context.Context, channelID int64, before int64, limit int) ([]model.Message, error) {
	var query string
	var args []interface{}

	if before > 0 {
		query = `SELECT id, channel_id, author_id, content, thread_id, edited_at, created_at
				 FROM messages WHERE channel_id = $1 AND id < $2 AND thread_id IS NULL
				 ORDER BY id DESC LIMIT $3`
		args = []interface{}{channelID, before, limit}
	} else {
		query = `SELECT id, channel_id, author_id, content, thread_id, edited_at, created_at
				 FROM messages WHERE channel_id = $1 AND thread_id IS NULL
				 ORDER BY id DESC LIMIT $2`
		args = []interface{}{channelID, limit}
	}

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list messages: %w", err)
	}
	defer rows.Close()

	var messages []model.Message
	for rows.Next() {
		var m model.Message
		if err := rows.Scan(&m.ID, &m.ChannelID, &m.AuthorID, &m.Content, &m.ThreadID, &m.EditedAt, &m.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan message: %w", err)
		}
		messages = append(messages, m)
	}
	return messages, nil
}

func (s *MessageStore) Update(ctx context.Context, id int64, content string) error {
	_, err := s.db.Exec(ctx,
		`UPDATE messages SET content = $1, edited_at = NOW() WHERE id = $2`,
		content, id,
	)
	if err != nil {
		return fmt.Errorf("update message: %w", err)
	}
	return nil
}

func (s *MessageStore) Delete(ctx context.Context, id int64) error {
	_, err := s.db.Exec(ctx, `DELETE FROM messages WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete message: %w", err)
	}
	return nil
}
