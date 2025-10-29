package controller

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const historyFile = "data/history.json"

type HistoryItem struct {
	ResultLine string    `json:"resultLine"`
	CreatedAt  time.Time `json:"createdAt"`
}

type History struct {
	Items []HistoryItem `json:"items"`
}

func ensureDataDir() error {
	return os.MkdirAll("data", 0o755)
}

func loadHistory() History {
	_ = ensureDataDir()
	var h History
	b, err := os.ReadFile(historyFile)
	if err != nil {
		return History{Items: []HistoryItem{}}
	}
	if err := json.Unmarshal(b, &h); err != nil {
		return History{Items: []HistoryItem{}}
	}
	return h
}

func saveHistory(h History) error {
	_ = ensureDataDir()
	b, err := json.MarshalIndent(h, "", "  ")
	if err != nil {
		return err
	}
	tmp := historyFile + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, historyFile)
}

func AppendHistory(line string) {
	h := loadHistory()
	item := HistoryItem{
		ResultLine: line,
		CreatedAt:  time.Now(),
	}
	h.Items = append([]HistoryItem{item}, h.Items...)
	if len(h.Items) > 20 {
		h.Items = h.Items[:20]
	}
	if err := saveHistory(h); err != nil {
		log.Println("history: save error:", err)
	}
}

func Histo(w http.ResponseWriter, r *http.Request) {
	h := loadHistory()

	path := filepath.Join("template", "histo.html")
	t, err := template.ParseFiles(path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := t.Execute(w, h); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func ClearHistory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if err := saveHistory(History{Items: []HistoryItem{}}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, "/histo", http.StatusSeeOther)
}
