package recipient

import "testing"

func TestCheckPattern(t *testing.T) {
	cases := []struct {
		name    string
		address string
		pattern string
		want    bool
	}{
		{"local wildcard", "support-team@example.com", "support-*", true},
		{"full address", "support-team@example.com", "support-*@example.com", true},
		{"other domain", "support-team@other.com", "support-*@example.com", false},
		{"empty wildcard", "support-@example.com", "support-*", true},
		{"multiple wildcards", "abc-def-ghi@example.com", "a*-*i", true},
		{"anchored", "other-support-team@example.com", "support-*", false},
		{"literal punctuation", "infoXteam@example.com", "info.team", false},
		{"literal brackets", "info[team]@example.com", "info[team]", true},
		{"empty pattern", "info@example.com", "", false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := CheckPattern(tc.address, tc.pattern); got != tc.want {
				t.Errorf("CheckPattern(%q, %q) = %v, want %v", tc.address, tc.pattern, got, tc.want)
			}
		})
	}
}
