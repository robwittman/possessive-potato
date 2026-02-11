package events

// Event type constants for real-time event delivery
const (
	// Message events
	MessageCreate = "MESSAGE_CREATE"
	MessageUpdate = "MESSAGE_UPDATE"
	MessageDelete = "MESSAGE_DELETE"

	// Typing events
	TypingStart = "TYPING_START"

	// Channel events
	ChannelCreate = "CHANNEL_CREATE"
	ChannelUpdate = "CHANNEL_UPDATE"
	ChannelDelete = "CHANNEL_DELETE"

	// Server events
	ServerCreate       = "SERVER_CREATE"
	ServerUpdate       = "SERVER_UPDATE"
	ServerDelete       = "SERVER_DELETE"
	ServerMemberAdd    = "SERVER_MEMBER_ADD"
	ServerMemberRemove = "SERVER_MEMBER_REMOVE"

	// Thread events
	ThreadCreate = "THREAD_CREATE"
	ThreadUpdate = "THREAD_UPDATE"

	// Voice events
	VoiceStateUpdate = "VOICE_STATE_UPDATE"
	VoiceServerInfo  = "VOICE_SERVER_INFO"

	// Presence events
	PresenceUpdate = "PRESENCE_UPDATE"
)

// Event is the envelope for all real-time events.
type Event struct {
	Type           string      `json:"t"`
	Data           interface{} `json:"d"`
	SourceInstance string      `json:"s,omitempty"` // Federation-ready: origin instance
}
