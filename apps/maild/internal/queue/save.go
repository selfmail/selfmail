package queue

import (
	"context"
	"sync"
)

type EmailJob struct {
	ID        string
	From      string
	Recipient string
}

type RedisQueue struct {
	mu   sync.Mutex
	jobs []EmailJob
}

type Queue interface {
	Enqueue(ctx context.Context, job EmailJob) error
}
