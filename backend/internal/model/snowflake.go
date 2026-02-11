package model

import (
	"github.com/bwmarrin/snowflake"
)

var node *snowflake.Node

// InitSnowflake initializes the snowflake ID generator.
// instanceID should be 0 for local, other values reserved for federation.
func InitSnowflake(instanceID int64) error {
	// bwmarrin/snowflake uses 10 bits for node ID (0-1023)
	// We use this as the instance ID for federation readiness
	var err error
	node, err = snowflake.NewNode(instanceID)
	return err
}

// NewID generates a new snowflake ID.
func NewID() snowflake.ID {
	return node.Generate()
}
