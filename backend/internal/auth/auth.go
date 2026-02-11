package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

const (
	AccessTokenDuration  = 15 * time.Minute
	RefreshTokenDuration = 7 * 24 * time.Hour
)

type Claims struct {
	UserID int64 `json:"uid"`
	jwt.RegisteredClaims
}

type Service struct {
	jwtSecret []byte
	redis     *redis.Client
}

func NewService(jwtSecret string, redisClient *redis.Client) *Service {
	return &Service{
		jwtSecret: []byte(jwtSecret),
		redis:     redisClient,
	}
}

func (s *Service) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("hash password: %w", err)
	}
	return string(hash), nil
}

func (s *Service) CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func (s *Service) GenerateAccessToken(userID int64) (string, error) {
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AccessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *Service) ValidateAccessToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("parse token: %w", err)
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}

func (s *Service) GenerateRefreshToken(ctx context.Context, userID int64) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate refresh token: %w", err)
	}
	token := hex.EncodeToString(b)

	key := fmt.Sprintf("refresh:%s", token)
	if err := s.redis.Set(ctx, key, userID, RefreshTokenDuration).Err(); err != nil {
		return "", fmt.Errorf("store refresh token: %w", err)
	}
	return token, nil
}

func (s *Service) ValidateRefreshToken(ctx context.Context, token string) (int64, error) {
	key := fmt.Sprintf("refresh:%s", token)
	userID, err := s.redis.Get(ctx, key).Int64()
	if err == redis.Nil {
		return 0, fmt.Errorf("refresh token expired or invalid")
	}
	if err != nil {
		return 0, fmt.Errorf("validate refresh token: %w", err)
	}
	return userID, nil
}

func (s *Service) RevokeRefreshToken(ctx context.Context, token string) error {
	key := fmt.Sprintf("refresh:%s", token)
	return s.redis.Del(ctx, key).Err()
}
