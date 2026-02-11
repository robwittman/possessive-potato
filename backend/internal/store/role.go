package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robwittman/possessive-potato/backend/internal/model"
)

type RoleStore struct {
	db *pgxpool.Pool
}

func NewRoleStore(db *pgxpool.Pool) *RoleStore {
	return &RoleStore{db: db}
}

func (s *RoleStore) Create(ctx context.Context, role *model.Role) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO roles (id, server_id, name, permissions, color, position)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		role.ID, role.ServerID, role.Name, role.Permissions, role.Color, role.Position,
	)
	if err != nil {
		return fmt.Errorf("create role: %w", err)
	}
	return nil
}

func (s *RoleStore) GetByID(ctx context.Context, id int64) (*model.Role, error) {
	var role model.Role
	err := s.db.QueryRow(ctx,
		`SELECT id, server_id, name, permissions, color, position FROM roles WHERE id = $1`, id,
	).Scan(&role.ID, &role.ServerID, &role.Name, &role.Permissions, &role.Color, &role.Position)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get role: %w", err)
	}
	return &role, nil
}

func (s *RoleStore) ListByServer(ctx context.Context, serverID int64) ([]model.Role, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, server_id, name, permissions, color, position
		 FROM roles WHERE server_id = $1 ORDER BY position`, serverID,
	)
	if err != nil {
		return nil, fmt.Errorf("list roles: %w", err)
	}
	defer rows.Close()

	var roles []model.Role
	for rows.Next() {
		var role model.Role
		if err := rows.Scan(&role.ID, &role.ServerID, &role.Name, &role.Permissions, &role.Color, &role.Position); err != nil {
			return nil, fmt.Errorf("scan role: %w", err)
		}
		roles = append(roles, role)
	}
	return roles, nil
}

func (s *RoleStore) GetDefaultRole(ctx context.Context, serverID int64) (*model.Role, error) {
	var role model.Role
	err := s.db.QueryRow(ctx,
		`SELECT id, server_id, name, permissions, color, position
		 FROM roles WHERE server_id = $1 AND position = 0`, serverID,
	).Scan(&role.ID, &role.ServerID, &role.Name, &role.Permissions, &role.Color, &role.Position)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get default role: %w", err)
	}
	return &role, nil
}

func (s *RoleStore) Update(ctx context.Context, role *model.Role) error {
	_, err := s.db.Exec(ctx,
		`UPDATE roles SET name = $1, permissions = $2, color = $3, position = $4 WHERE id = $5`,
		role.Name, role.Permissions, role.Color, role.Position, role.ID,
	)
	if err != nil {
		return fmt.Errorf("update role: %w", err)
	}
	return nil
}

func (s *RoleStore) Delete(ctx context.Context, id int64) error {
	_, err := s.db.Exec(ctx, `DELETE FROM roles WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete role: %w", err)
	}
	return nil
}

func (s *RoleStore) AssignRole(ctx context.Context, serverID, userID, roleID int64) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO member_roles (server_id, user_id, role_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
		serverID, userID, roleID,
	)
	if err != nil {
		return fmt.Errorf("assign role: %w", err)
	}
	return nil
}

func (s *RoleStore) RemoveRole(ctx context.Context, serverID, userID, roleID int64) error {
	_, err := s.db.Exec(ctx,
		`DELETE FROM member_roles WHERE server_id = $1 AND user_id = $2 AND role_id = $3`,
		serverID, userID, roleID,
	)
	if err != nil {
		return fmt.Errorf("remove role: %w", err)
	}
	return nil
}

func (s *RoleStore) GetMemberRoles(ctx context.Context, serverID, userID int64) ([]model.Role, error) {
	rows, err := s.db.Query(ctx,
		`SELECT r.id, r.server_id, r.name, r.permissions, r.color, r.position
		 FROM roles r
		 JOIN member_roles mr ON r.id = mr.role_id
		 WHERE mr.server_id = $1 AND mr.user_id = $2
		 ORDER BY r.position`, serverID, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("get member roles: %w", err)
	}
	defer rows.Close()

	var roles []model.Role
	for rows.Next() {
		var role model.Role
		if err := rows.Scan(&role.ID, &role.ServerID, &role.Name, &role.Permissions, &role.Color, &role.Position); err != nil {
			return nil, fmt.Errorf("scan role: %w", err)
		}
		roles = append(roles, role)
	}
	return roles, nil
}

// GetMemberPermissions computes the effective permissions for a user by bitwise OR-ing
// all assigned roles plus the @everyone role (position 0).
func (s *RoleStore) GetMemberPermissions(ctx context.Context, serverID, userID int64) (int64, error) {
	var perms int64
	err := s.db.QueryRow(ctx,
		`SELECT COALESCE(bit_or(r.permissions), 0)
		 FROM roles r
		 WHERE r.server_id = $1
		   AND (r.position = 0 OR r.id IN (
		     SELECT mr.role_id FROM member_roles mr
		     WHERE mr.server_id = $1 AND mr.user_id = $2
		   ))`, serverID, userID,
	).Scan(&perms)
	if err != nil {
		return 0, fmt.Errorf("get member permissions: %w", err)
	}
	return perms, nil
}
