package store

import (
	"context"

	"github.com/robwittman/possessive-potato/backend/internal/model"
)

// UserStoreInterface defines all user persistence operations.
type UserStoreInterface interface {
	Create(ctx context.Context, user *model.User) error
	GetByID(ctx context.Context, id int64) (*model.User, error)
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	GetByUsername(ctx context.Context, username string) (*model.User, error)
}

// ServerStoreInterface defines all server persistence operations.
type ServerStoreInterface interface {
	Create(ctx context.Context, server *model.Server) error
	GetByID(ctx context.Context, id int64) (*model.Server, error)
	ListByUser(ctx context.Context, userID int64) ([]model.Server, error)
	AddMember(ctx context.Context, serverID, userID int64) error
	IsMember(ctx context.Context, serverID, userID int64) (bool, error)
	RemoveMember(ctx context.Context, serverID, userID int64) error
	Update(ctx context.Context, server *model.Server) error
	Delete(ctx context.Context, id int64) error
}

// ChannelStoreInterface defines all channel persistence operations.
type ChannelStoreInterface interface {
	Create(ctx context.Context, ch *model.Channel) error
	GetByID(ctx context.Context, id int64) (*model.Channel, error)
	ListByServer(ctx context.Context, serverID int64) ([]model.Channel, error)
	Update(ctx context.Context, ch *model.Channel) error
	UpdatePositions(ctx context.Context, serverID int64, positions []ChannelPosition) error
	Delete(ctx context.Context, id int64) error
}

// ChannelPosition pairs a channel ID with its new position for reordering.
type ChannelPosition struct {
	ID       int64 `json:"id,string"`
	Position int   `json:"position"`
}

// MessageStoreInterface defines all message persistence operations.
type MessageStoreInterface interface {
	Create(ctx context.Context, msg *model.Message) error
	ListByChannel(ctx context.Context, channelID int64, before int64, limit int) ([]model.Message, error)
	Update(ctx context.Context, id int64, content string) error
	Delete(ctx context.Context, id int64) error
}

// InviteStoreInterface defines all invite persistence operations.
type InviteStoreInterface interface {
	Create(ctx context.Context, invite *model.Invite) error
	GetByCode(ctx context.Context, code string) (*model.Invite, error)
	ListByServer(ctx context.Context, serverID int64) ([]model.Invite, error)
	IncrementUses(ctx context.Context, code string) error
	Delete(ctx context.Context, code string) error
}
