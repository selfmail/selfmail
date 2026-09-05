package recipient

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient() *redis.Client {
	url := "redis://localhost:6379/0"
	opts, err := redis.ParseURL(url)
	if err != nil {
		panic(err)
	}

	return redis.NewClient(opts)
}

var ctx = context.Background()

func CheckRecipient(mail string) bool {
	r := NewRedisClient()

	v, err := r.Get(ctx, "recpient:"+mail).Result()
	fmt.Println(v)

	// TODO: check for possible other sources like a postgres database
	if err == redis.Nil {
		fmt.Println("key2 does not exist")
		return false
	} else if err != nil {
		panic(err)
	}

	return true
}
