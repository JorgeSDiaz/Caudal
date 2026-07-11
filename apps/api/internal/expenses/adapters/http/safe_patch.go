package http

import (
	"encoding/json"
	"fmt"

	"caudal-api/internal/expenses/application"
)

func safePatchExpense(id int64, raw map[string]json.RawMessage) (command application.UpdateExpenseCommand, err error) {
	defer func() {
		if recovered := recover(); recovered != nil {
			err = fmt.Errorf("%v", recovered)
		}
	}()
	return patchExpenseCommand(id, raw)
}
