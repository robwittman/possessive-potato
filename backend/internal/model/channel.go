package model

import (
	"time"
)

type ChannelType string

const (
	ChannelTypeText  ChannelType = "text"
	ChannelTypeVoice ChannelType = "voice"
)

type Channel struct {
	ID        int64       `json:"id,string" db:"id"`
	ServerID  int64       `json:"server_id,string" db:"server_id"`
	Name      string      `json:"name" db:"name"`
	Type      ChannelType `json:"type" db:"type"`
	Position  int         `json:"position" db:"position"`
	Topic     *string     `json:"topic" db:"topic"`
	CreatedAt time.Time   `json:"created_at" db:"created_at"`
}
