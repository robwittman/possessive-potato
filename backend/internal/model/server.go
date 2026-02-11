package model

import (
	"time"
)

type Server struct {
	ID        int64     `json:"id,string" db:"id"`
	Name      string    `json:"name" db:"name"`
	OwnerID   int64     `json:"owner_id,string" db:"owner_id"`
	IconURL   *string   `json:"icon_url" db:"icon_url"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type ServerMember struct {
	ServerID int64     `json:"server_id,string" db:"server_id"`
	UserID   int64     `json:"user_id,string" db:"user_id"`
	Nickname *string   `json:"nickname" db:"nickname"`
	JoinedAt time.Time `json:"joined_at" db:"joined_at"`
}
