package recipient

import (
	"regexp"
	"strings"
)

func CheckPattern(recipient string, pattern string) bool {
	if pattern == "" {
		return false
	}
	if !strings.Contains(pattern, "@") {
		recipient, _, _ = strings.Cut(recipient, "@")
	}

	// Only '*' is a wildcard; all other pattern characters are literal.
	expression := "^" + strings.ReplaceAll(regexp.QuoteMeta(pattern), `\*`, ".*") + "$"
	return regexp.MustCompile(expression).MatchString(recipient)
}
