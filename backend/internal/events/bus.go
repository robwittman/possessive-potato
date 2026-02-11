package events

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
)

// Bus wraps Redis pub/sub for inter-service event delivery.
type Bus struct {
	redis *redis.Client
}

func NewBus(redisClient *redis.Client) *Bus {
	return &Bus{redis: redisClient}
}

// Publish sends an event to a channel (e.g., "channel:123" or "server:456").
func (b *Bus) Publish(ctx context.Context, channel string, event Event) error {
	data, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("marshal event: %w", err)
	}
	return b.redis.Publish(ctx, channel, data).Err()
}

// Subscribe listens for events on the given channels and delivers them to the handler.
func (b *Bus) Subscribe(ctx context.Context, handler func(Event), channels ...string) {
	sub := b.redis.Subscribe(ctx, channels...)
	ch := sub.Channel()

	go func() {
		defer sub.Close()
		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				var event Event
				if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {
					log.Error().Err(err).Str("channel", msg.Channel).Msg("failed to unmarshal event")
					continue
				}
				handler(event)
			}
		}
	}()
}
