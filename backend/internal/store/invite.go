package store

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robwittman/possessive-potato/backend/internal/model"
)

const inviteAlphabet = "abcdefghjkmnpqrstuvwxyz23456789" // 30 chars, no ambiguous l/1/0/o/i

type InviteStore struct {
	db *pgxpool.Pool
}

func NewInviteStore(db *pgxpool.Pool) *InviteStore {
	return &InviteStore{db: db}
}

func GenerateInviteCode() (string, error) {
	b := make([]byte, 8)
	for i := range b {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(inviteAlphabet))))
		if err != nil {
			return "", fmt.Errorf("generate invite code: %w", err)
		}
		b[i] = inviteAlphabet[n.Int64()]
	}
	return string(b), nil
}

func (s *InviteStore) Create(ctx context.Context, invite *model.Invite) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO invites (code, server_id, created_by, max_uses, expires_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		invite.Code, invite.ServerID, invite.CreatedBy, invite.MaxUses, invite.ExpiresAt,
	)
	if err != nil {
		return fmt.Errorf("create invite: %w", err)
	}
	return nil
}

func (s *InviteStore) GetByCode(ctx context.Context, code string) (*model.Invite, error) {
	var inv model.Invite
	err := s.db.QueryRow(ctx,
		`SELECT code, server_id, created_by, max_uses, uses, expires_at, created_at
		 FROM invites WHERE code = $1`, code,
	).Scan(&inv.Code, &inv.ServerID, &inv.CreatedBy, &inv.MaxUses, &inv.Uses, &inv.ExpiresAt, &inv.CreatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get invite: %w", err)
	}
	return &inv, nil
}

func (s *InviteStore) ListByServer(ctx context.Context, serverID int64) ([]model.Invite, error) {
	rows, err := s.db.Query(ctx,
		`SELECT code, server_id, created_by, max_uses, uses, expires_at, created_at
		 FROM invites WHERE server_id = $1 ORDER BY created_at DESC`, serverID,
	)
	if err != nil {
		return nil, fmt.Errorf("list invites: %w", err)
	}
	defer rows.Close()

	var invites []model.Invite
	for rows.Next() {
		var inv model.Invite
		if err := rows.Scan(&inv.Code, &inv.ServerID, &inv.CreatedBy, &inv.MaxUses, &inv.Uses, &inv.ExpiresAt, &inv.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan invite: %w", err)
		}
		invites = append(invites, inv)
	}
	return invites, nil
}

func (s *InviteStore) IncrementUses(ctx context.Context, code string) error {
	_, err := s.db.Exec(ctx,
		`UPDATE invites SET uses = uses + 1 WHERE code = $1`, code,
	)
	if err != nil {
		return fmt.Errorf("increment invite uses: %w", err)
	}
	return nil
}

func (s *InviteStore) Delete(ctx context.Context, code string) error {
	_, err := s.db.Exec(ctx, `DELETE FROM invites WHERE code = $1`, code)
	if err != nil {
		return fmt.Errorf("delete invite: %w", err)
	}
	return nil
}
