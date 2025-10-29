package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/SpikelsUp/power4/controller" // change si ton module est différent dans go.mod
)

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	log.Println("➡️  GET /  → template/menu.html")
	if err := controller.RenderTemplate(w, "menu.html"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	cwd, _ := os.Getwd()
	log.Printf("📁 CWD: %s\n", cwd)

	// Fichiers statiques (/static/...)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Routes pages
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/play", controller.Play)
	http.HandleFunc("/players", controller.Players)
	http.HandleFunc("/histo", controller.Histo)

	// Ping santé
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok")) })

	addr := ":8080"
	fmt.Printf("✅ Serveur lancé sur http://localhost%v\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}
