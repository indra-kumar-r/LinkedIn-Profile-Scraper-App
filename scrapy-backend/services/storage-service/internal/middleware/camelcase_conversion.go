package middleware

import (
	"bytes"
	"encoding/json"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func toCamelCaseKey(s string) string {
	parts := strings.Split(s, "_")
	for i := 1; i < len(parts); i++ {
		if len(parts[i]) > 0 {
			parts[i] = strings.ToUpper(parts[i][:1]) + parts[i][1:]
		}
	}
	return strings.Join(parts, "")
}

func convertKeysToCamelCase(data interface{}) interface{} {
	switch v := data.(type) {
	case map[string]interface{}:
		newMap := make(map[string]interface{})
		for key, value := range v {
			newMap[toCamelCaseKey(key)] = convertKeysToCamelCase(value)
		}
		return newMap
	case []interface{}:
		for i, val := range v {
			v[i] = convertKeysToCamelCase(val)
		}
		return v
	default:
		return data
	}
}

func CamelCaseMiddleware(c *fiber.Ctx) error {
	var buf bytes.Buffer
	c.Response().SetBodyStream(&buf, -1)

	if err := c.Next(); err != nil {
		return err
	}

	body := c.Response().Body()

	var data interface{}
	if err := json.Unmarshal(body, &data); err == nil {
		converted := convertKeysToCamelCase(data)
		newBody, _ := json.Marshal(converted)
		c.Response().SetBody(newBody)
	}

	return nil
}
