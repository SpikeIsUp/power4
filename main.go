package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/SpikelsUp/power4/controller"
)

// Handlers pour les pages HTML
func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	if err := controller.RenderTemplate(w, "menu.html"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func setupHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/setup" {
		http.NotFound(w, r)
		return
	}
	if err := controller.RenderTemplate(w, "setup.html"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func botHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/bot" {
		http.NotFound(w, r)
		return
	}
	if err := controller.RenderTemplate(w, "bot.html"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func playHandler(w http.ResponseWriter, r *http.Request) {
	controller.Play(w, r)
}

func playersHandler(w http.ResponseWriter, r *http.Request) {
	controller.Players(w, r)
}

func histoHandler(w http.ResponseWriter, r *http.Request) {
	controller.Histo(w, r)
}

func clearHistoryHandler(w http.ResponseWriter, r *http.Request) {
	controller.ClearHistory(w, r)
}

func main() {
	cwd, _ := os.Getwd()
	log.Printf("📁 CWD: %s\n", cwd)

	// Static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Pages
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/setup", setupHandler)
	http.HandleFunc("/bot", botHandler)
	http.HandleFunc("/play", playHandler)
	http.HandleFunc("/players", playersHandler)
	http.HandleFunc("/histo", histoHandler)
	http.HandleFunc("/clear-history", clearHistoryHandler)

	// API routes
	http.HandleFunc("/api/state", controller.GameState)
	http.HandleFunc("/api/turn", controller.GamePlayTurn)
	http.HandleFunc("/api/reset", controller.GameReset)
	http.HandleFunc("/api/setupPlayers", controller.GameSetupPlayers)

	// Santé
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("ok"))
	})

	addr := ":8080"
	fmt.Printf("✅ Serveur lancé sur http://localhost%v\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}
