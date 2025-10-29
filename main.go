package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/SpikelsUp/power4/controller"
)

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

func main() {
	cwd, _ := os.Getwd()
	log.Printf("📁 CWD: %s\n", cwd)

	// Static
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Pages
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/setup", setupHandler)              // page pseudos + jetons
	http.HandleFunc("/play", controller.Play)            // partie
	http.HandleFunc("/players", controller.Players)      // classement (UNIQUE)
	http.HandleFunc("/histo", controller.Histo)
	http.HandleFunc("/clear-history", controller.ClearHistory)

	// API
	http.HandleFunc("/api/state", controller.GameState)
	http.HandleFunc("/api/turn", controller.GamePlayTurn)
	http.HandleFunc("/api/reset", controller.GameReset)
	http.HandleFunc("/api/setupPlayers", controller.GameSetupPlayers)

	// Santé
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { _, _ = w.Write([]byte("ok")) })

	addr := ":8080"
	fmt.Printf("✅ Serveur lancé sur http://localhost%v\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}
