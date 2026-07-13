package app

import (
	"log/slog"
	"net/http"
	"os"

	backuphttp "caudal-api/internal/backup/http"
	categoryhttp "caudal-api/internal/categories/adapters/http"
	categorydb "caudal-api/internal/categories/adapters/persistence"
	categoryapp "caudal-api/internal/categories/application"
	expensehttp "caudal-api/internal/expenses/adapters/http"
	expensedb "caudal-api/internal/expenses/adapters/persistence"
	expenseapp "caudal-api/internal/expenses/application"
	incomehttp "caudal-api/internal/incomes/adapters/http"
	incomedb "caudal-api/internal/incomes/adapters/persistence"
	incomeapp "caudal-api/internal/incomes/application"
	"caudal-api/internal/platform/clock"
	"caudal-api/internal/platform/config"
	"caudal-api/internal/platform/httpx"
	profilehttp "caudal-api/internal/profile/adapters/http"
	profiledb "caudal-api/internal/profile/adapters/persistence"
	profileapp "caudal-api/internal/profile/application"
	recurrencehttp "caudal-api/internal/recurrences/adapters/http"
	recurrencedb "caudal-api/internal/recurrences/adapters/persistence"
	recurrenceapp "caudal-api/internal/recurrences/application"
	reporthttp "caudal-api/internal/reports/adapters/http"
	reportdb "caudal-api/internal/reports/adapters/persistence"
	reportapp "caudal-api/internal/reports/application"
	"gorm.io/gorm"
)

func NewRouter(db *gorm.DB, settings config.Settings, logger *slog.Logger) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /openapi.json", serveOpenAPI)

	wireCategories(db).Register(mux)
	expenseSet := wireExpenses(db)
	expenseSet.router.Register(mux)
	incomeSet := wireIncomes(db)
	incomeSet.router.Register(mux)
	wireReports(db).Register(mux)
	wireRecurrences(db).Register(mux)
	wireProfile(db).Register(mux)
	wireBackup(expenseSet, incomeSet).Register(mux)

	return httpx.CORS(settings.CORSOrigins, httpx.LogRequests(logger, mux))
}

func wireProfile(db *gorm.DB) profilehttp.Router {
	repository := profiledb.NewRepository(db)
	return profilehttp.NewRouter(profileapp.NewGetProfile(repository), profileapp.NewUpdateProfile(repository))
}

func serveOpenAPI(w http.ResponseWriter, _ *http.Request) {
	content, err := os.ReadFile("openapi/caudal.yaml")
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/yaml")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(content)
}

type expenseWiring struct {
	router   expensehttp.Router
	export   expenseapp.ExportExpenses
	importer expenseapp.ImportExpenses
}

type incomeWiring struct {
	router   incomehttp.Router
	export   incomeapp.ExportIncomes
	importer incomeapp.ImportIncomes
}

func wireCategories(db *gorm.DB) categoryhttp.Router {
	repository := categorydb.NewRepository(db)
	return categoryhttp.NewRouter(
		categoryapp.NewCreateCategory(repository),
		categoryapp.NewListCategories(repository),
		categoryapp.NewUpdateCategory(repository),
		categoryapp.NewDeleteCategory(repository),
	)
}

func wireExpenses(db *gorm.DB) expenseWiring {
	repository := expensedb.NewRepository(db)
	categoryChecker := categorydb.NewRepository(db)
	create := expenseapp.NewCreateExpense(repository, categoryChecker)
	return expenseWiring{
		router: expensehttp.NewRouter(
			create, expenseapp.NewListExpenses(repository),
			expenseapp.NewUpdateExpense(repository, categoryChecker),
			expenseapp.NewDeleteExpense(repository),
		),
		export:   expenseapp.NewExportExpenses(repository),
		importer: expenseapp.NewImportExpenses(create),
	}
}

func wireIncomes(db *gorm.DB) incomeWiring {
	repository := incomedb.NewRepository(db)
	sourceChecker := categorydb.NewRepository(db)
	create := incomeapp.NewCreateIncome(repository, sourceChecker)
	return incomeWiring{
		router: incomehttp.NewRouter(
			create, incomeapp.NewListIncomes(repository),
			incomeapp.NewUpdateIncome(repository, sourceChecker),
			incomeapp.NewDeleteIncome(repository),
		),
		export:   incomeapp.NewExportIncomes(repository),
		importer: incomeapp.NewImportIncomes(create),
	}
}

func wireReports(db *gorm.DB) reporthttp.Router {
	monthly := reportapp.NewMonthlyReport(reportdb.NewExpenseReader(db), reportdb.NewIncomeReader(db))
	return reporthttp.NewRouter(monthly)
}

func wireRecurrences(db *gorm.DB) recurrencehttp.Router {
	repository := recurrencedb.NewRepository(db)
	checker := recurrencedb.NewCategoryChecker(db)
	writer := recurrencedb.NewMovementWriter(db)
	create := recurrenceapp.NewCreateRecurrence(repository, checker)
	return recurrencehttp.NewRouter(
		create, recurrenceapp.NewListRecurrences(repository),
		recurrenceapp.NewUpdateRecurrence(repository, checker),
		recurrenceapp.NewDeleteRecurrence(repository),
		recurrenceapp.NewRunDueRecurrences(repository, writer),
		clock.SystemClock{},
	)
}

func wireBackup(expenses expenseWiring, incomes incomeWiring) backuphttp.Router {
	return backuphttp.NewRouter(expenses.export, expenses.importer, incomes.export, incomes.importer)
}
