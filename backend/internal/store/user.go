package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robwittman/possessive-potato/backend/internal/model"
)

type UserStore struct {
	db *pgxpool.Pool
}

func NewUserStore(db *pgxpool.Pool) *UserStore {
	return &UserStore{db: db}
}

func (s *UserStore) Create(ctx context.Context, user *model.User) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO users (id, username, display_name, email, password_hash, status)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		user.ID, user.Username, user.DisplayName, user.Email, user.PasswordHash, user.Status,
	)
	if err != nil {
		return fmt.Errorf("create user: %w", err)
	}
	return nil
}

func (s *UserStore) GetByID(ctx context.Context, id int64) (*model.User, error) {
	var u model.User
	err := s.db.QueryRow(ctx,
		`SELECT id, username, display_name, email, password_hash, avatar_url, status, created_at, updated_at
		 FROM users WHERE id = $1`, id,
	).Scan(&u.ID, &u.Username, &u.DisplayName, &u.Email, &u.PasswordHash, &u.AvatarURL, &u.Status, &u.CreatedAt, &u.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return &u, nil
}

func (s *UserStore) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var u model.User
	err := s.db.QueryRow(ctx,
		`SELECT id, username, display_name, email, password_hash, avatar_url, status, created_at, updated_at
		 FROM users WHERE email = $1`, email,
	).Scan(&u.ID, &u.Username, &u.DisplayName, &u.Email, &u.PasswordHash, &u.AvatarURL, &u.Status, &u.CreatedAt, &u.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return &u, nil
}

func (s *UserStore) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	var u model.User
	err := s.db.QueryRow(ctx,
		`SELECT id, username, display_name, email, password_hash, avatar_url, status, created_at, updated_at
		 FROM users WHERE username = $1`, username,
	).Scan(&u.ID, &u.Username, &u.DisplayName, &u.Email, &u.PasswordHash, &u.AvatarURL, &u.Status, &u.CreatedAt, &u.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get user by username: %w", err)
	}
	return &u, nil
}
