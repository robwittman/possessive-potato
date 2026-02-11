package model

type Role struct {
	ID          int64   `json:"id,string" db:"id"`
	ServerID    int64   `json:"server_id,string" db:"server_id"`
	Name        string  `json:"name" db:"name"`
	Permissions int64   `json:"permissions" db:"permissions"`
	Color       *string `json:"color" db:"color"`
	Position    int     `json:"position" db:"position"`
}

type MemberRole struct {
	ServerID int64 `json:"server_id,string" db:"server_id"`
	UserID   int64 `json:"user_id,string" db:"user_id"`
	RoleID   int64 `json:"role_id,string" db:"role_id"`
}

// Permission bit flags
const (
	PermissionAdmin          int64 = 1 << 0
	PermissionManageServer   int64 = 1 << 1
	PermissionManageChannels int64 = 1 << 2
	PermissionManageRoles    int64 = 1 << 3
	PermissionKickMembers    int64 = 1 << 4
	PermissionBanMembers     int64 = 1 << 5
	PermissionSendMessages   int64 = 1 << 6
	PermissionReadMessages   int64 = 1 << 7
	PermissionManageMessages int64 = 1 << 8
	PermissionConnect        int64 = 1 << 9
	PermissionSpeak          int64 = 1 << 10
	PermissionShareScreen    int64 = 1 << 11
)
