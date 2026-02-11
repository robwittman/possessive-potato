package model

import (
	"time"
)

type Message struct {
	ID        int64      `json:"id,string" db:"id"`
	ChannelID int64      `json:"channel_id,string" db:"channel_id"`
	AuthorID  int64      `json:"author_id,string" db:"author_id"`
	Content   string     `json:"content" db:"content"`
	ThreadID  *int64     `json:"thread_id,string,omitempty" db:"thread_id"`
	EditedAt  *time.Time `json:"edited_at,omitempty" db:"edited_at"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}
