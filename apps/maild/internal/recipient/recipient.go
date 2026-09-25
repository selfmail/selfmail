package recipient

import (
	"context"
	"errors"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient() (*redis.Client, error) {
	url := "redis://localhost:6379/0"
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, errors.New("Failed to parase redis URL: " + err.Error())
	}

	return redis.NewClient(opts), nil
}

var ctx = context.Background()

func CheckRecipient(mail string) bool {
	r, err := NewRedisClient()

	if err != nil {
		// Panic in order to crash the program
		panic(err)
	}

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
