package recipient

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient() (*redis.Client, error) {
	url := "redis://localhost:6379/0"
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, fmt.Errorf("failed to parse redis URL: %w", err)
	}

	return redis.NewClient(opts), nil
}

var ctx = context.Background()
var sharedRedisClient = sync.OnceValues(NewRedisClient)

func CheckRecipient(mail string) bool {
	local, domain, ok := strings.Cut(mail, "@")
	if !ok || local == "" || domain == "" || strings.Contains(domain, "@") {
		return false
	}

	r, err := sharedRedisClient()
	if err != nil {
		panic(err)
	}

	exists, err := r.Exists(ctx, "rcpt:exact:"+mail).Result()
	if err != nil {
		panic(err)
	}
	if exists > 0 {
		return true
	}

	patterns, err := r.HGetAll(ctx, "rcpt:wildcard:"+domain).Result()
	if err != nil {
		panic(err)
	}
	for pattern := range patterns {
		if CheckPattern(mail, pattern) {
			return true
		}
	}

	catchAll, err := r.Get(ctx, "rcpt:catch-all:"+domain).Bool()
	if err == redis.Nil {
		return false
	}
	if err != nil {
		panic(err)
	}
	return catchAll
}
