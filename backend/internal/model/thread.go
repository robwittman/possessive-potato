package model

import (
	"time"
)

type Thread struct {
	ID              int64     `json:"id,string" db:"id"`
	ChannelID       int64     `json:"channel_id,string" db:"channel_id"`
	ParentMessageID int64     `json:"parent_message_id,string" db:"parent_message_id"`
	Name            string    `json:"name" db:"name"`
	CreatedBy       int64     `json:"created_by,string" db:"created_by"`
	Archived        bool      `json:"archived" db:"archived"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
}
