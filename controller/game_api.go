package controller

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/SpikelsUp/power4/game"
)

var (
	currentGame = game.NewGame()
	once        sync.Once
)

func ensureGame() {
	once.Do(func() {
		currentGame = game.NewGame()
	})
}

func writeJSON(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}

func GameState(w http.ResponseWriter, r *http.Request) {
	ensureGame()
	grid, turn, over, winner, names, tokenURL := currentGame.State()
	writeJSON(w, http.StatusOK, map[string]any{
		"grid":      grid,
		"turn":      turn,
		"over":      over,
		"winner":    winner,
		"names":     names,
		"tokenUrls": tokenURL,
	})
}

type playReq struct{ Col int `json:"col"` }

// 👇 VERSION UNIQUE (avec enregistrement dans l’historique)
func GamePlayTurn(w http.ResponseWriter, r *http.Request) {
	ensureGame()
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req playReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	res, err := currentGame.Play(req.Col)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	// Si la partie vient de se terminer, on logue dans l'historique (Option A simple)
	if res.Over {
		p1 := res.Names[0]
		p2 := res.Names[1]
		now := time.Now().Format("02/01/2006 15:04") // JJ/MM/AAAA HH:MM

		var line string
		switch res.Winner {
		case 2:
			line = "➖ Match nul: " + p1 + " vs " + p2 + " — " + now
		case 0:
			line = "✅ " + p1 + " a battu " + p2 + " — " + now
		case 1:
			line = "✅ " + p2 + " a battu " + p1 + " — " + now
		}
		AppendHistory(line)
	}
	// ...
	if res.Over {
			p1 := res.Names[0]
			p2 := res.Names[1]
			now := time.Now().Format("02/01/2006 15:04")

			var line string
			switch res.Winner {
			case 2:
					line = "➖ Match nul: " + p1 + " vs " + p2 + " — " + now
			case 0:
					line = "✅ " + p1 + " a battu " + p2 + " — " + now
					incrementWin(p1) // <<< ajoute la victoire au classement
			case 1:
					line = "✅ " + p2 + " a battu " + p1 + " — " + now
					incrementWin(p2) // <<< ajoute la victoire au classement
			}
			AppendHistory(line)
	}
// ...

	writeJSON(w, http.StatusOK, res)
}

func GameReset(w http.ResponseWriter, r *http.Request) {
	ensureGame()
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	currentGame.Reset()
	writeJSON(w, http.StatusOK, map[string]string{"status": "reset"})
}

type setupReq struct {
	P1     string `json:"p1"`
	P2     string `json:"p2"`
	Token1 string `json:"token1"` // chemin absolu /static/...
	Token2 string `json:"token2"`
}

func GameSetupPlayers(w http.ResponseWriter, r *http.Request) {
	ensureGame()
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req setupReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	if err := currentGame.SetPlayers(req.P1, req.P2, req.Token1, req.Token2); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}
	_, _, _, _, names, tokenURL := currentGame.State()
	writeJSON(w, http.StatusOK, map[string]any{
		"names":     names,
		"tokenUrls": tokenURL,
	})
}
