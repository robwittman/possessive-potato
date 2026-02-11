package model

import (
	"time"
)

type Invite struct {
	Code      string     `json:"code" db:"code"`
	ServerID  int64      `json:"server_id,string" db:"server_id"`
	CreatedBy int64      `json:"created_by,string" db:"created_by"`
	MaxUses   *int       `json:"max_uses" db:"max_uses"`
	Uses      int        `json:"uses" db:"uses"`
	ExpiresAt *time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}
