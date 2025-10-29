package controller

import (
	"encoding/json"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"sort"
)

const scoresFile = "data/scores.json"

type ScoreEntry struct {
	Name string `json:"name"`
	Wins int    `json:"wins"`
}
type Scoreboard struct {
	Entries []ScoreEntry `json:"entries"`
}

func loadScores() Scoreboard {
	_ = ensureDataDir()
	var s Scoreboard
	b, err := os.ReadFile(scoresFile)
	if err != nil {
		return Scoreboard{Entries: []ScoreEntry{}}
	}
	if err := json.Unmarshal(b, &s); err != nil {
		return Scoreboard{Entries: []ScoreEntry{}}
	}
	return s
}

func saveScores(s Scoreboard) error {
	_ = ensureDataDir()
	b, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	tmp := scoresFile + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, scoresFile)
}

func incrementWin(name string) {
	if name == "" {
		return
	}
	s := loadScores()
	found := false
	for i := range s.Entries {
		if s.Entries[i].Name == name {
			s.Entries[i].Wins++
			found = true
			break
		}
	}
	if !found {
		s.Entries = append(s.Entries, ScoreEntry{Name: name, Wins: 1})
	}
	sort.Slice(s.Entries, func(i, j int) bool {
		if s.Entries[i].Wins == s.Entries[j].Wins {
			return s.Entries[i].Name < s.Entries[j].Name
		}
		return s.Entries[i].Wins > s.Entries[j].Wins
	})
	_ = saveScores(s)
}

func Players(w http.ResponseWriter, r *http.Request) {
	s := loadScores()
	path := filepath.Join("template", "players.html")
	t := template.New("players.html").Funcs(template.FuncMap{
		"add1": func(i int) int { return i + 1 },
	})
	t, err := t.ParseFiles(path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := t.Execute(w, s); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func ClearScores(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	_ = saveScores(Scoreboard{Entries: []ScoreEntry{}})
	http.Redirect(w, r, "/players", http.StatusSeeOther)
}
