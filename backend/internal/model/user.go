package model

import (
	"time"
)

type UserStatus string

const (
	UserStatusOnline  UserStatus = "online"
	UserStatusOffline UserStatus = "offline"
	UserStatusAway    UserStatus = "away"
	UserStatusDND     UserStatus = "dnd"
)

type User struct {
	ID           int64      `json:"id,string" db:"id"`
	Username     string     `json:"username" db:"username"`
	DisplayName  string     `json:"display_name" db:"display_name"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	AvatarURL    *string    `json:"avatar_url" db:"avatar_url"`
	Status       UserStatus `json:"status" db:"status"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}
