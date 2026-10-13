package recipient

import (
	"context"
	"github.com/redis/go-redis/v9"
	"testing"
)

type lookupHook struct {
	redis.Hook
	exact    bool
	patterns map[string]string
	catchAll string
	keys     []string
}

func (h *lookupHook) ProcessHook(_ redis.ProcessHook) redis.ProcessHook {
	return func(_ context.Context, cmd redis.Cmder) error {
		h.keys = append(h.keys, cmd.Args()[1].(string))
		switch cmd := cmd.(type) {
		case *redis.IntCmd:
			if h.exact {
				cmd.SetVal(1)
			}
		case *redis.MapStringStringCmd:
			cmd.SetVal(h.patterns)
		case *redis.StringCmd:
			if h.catchAll == "" {
				cmd.SetErr(redis.Nil)
				return redis.Nil
			}
			cmd.SetVal(h.catchAll)
		}
		return nil
	}
}
func (h *lookupHook) DialHook(next redis.DialHook) redis.DialHook { return next }
func (h *lookupHook) ProcessPipelineHook(next redis.ProcessPipelineHook) redis.ProcessPipelineHook {
	return next
}

func TestCheckRecipient(t *testing.T) {
	original := sharedRedisClient
	t.Cleanup(func() { sharedRedisClient = original })
	cases := []struct {
		name  string
		hook  lookupHook
		want  bool
		calls int
	}{
		{"exact", lookupHook{exact: true}, true, 1},
		{"wildcard", lookupHook{patterns: map[string]string{"support-*": "target"}}, true, 2},
		{"catch-all", lookupHook{catchAll: "true"}, true, 3},
		{"numeric catch-all", lookupHook{catchAll: "1"}, true, 3},
		{"disabled", lookupHook{catchAll: "false"}, false, 3},
		{"missing", lookupHook{patterns: map[string]string{"info-*": "target"}}, false, 3},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			client := redis.NewClient(&redis.Options{})
			t.Cleanup(func() { _ = client.Close() })
			client.AddHook(&tc.hook)
			sharedRedisClient = func() (*redis.Client, error) { return client, nil }
			if got := CheckRecipient("support-team@example.com"); got != tc.want {
				t.Errorf("got %v, want %v", got, tc.want)
			}
			keys := []string{"rcpt:exact:support-team@example.com", "rcpt:wildcard:example.com", "rcpt:catch-all:example.com"}
			if len(tc.hook.keys) != tc.calls {
				t.Fatalf("got %d calls, want %d", len(tc.hook.keys), tc.calls)
			}
			for i, key := range tc.hook.keys {
				if key != keys[i] {
					t.Errorf("key = %q, want %q", key, keys[i])
				}
			}
		})
	}
	for _, address := range []string{"invalid", "@example.com", "info@", "info@example@com"} {
		if CheckRecipient(address) {
			t.Errorf("accepted invalid address %q", address)
		}
	}
}
