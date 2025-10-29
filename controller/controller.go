package controller

import (
	"html/template"
	"log"
	"net/http"
	"path/filepath"
)

// RenderTemplate rend un fichier depuis /template sans panic
func RenderTemplate(w http.ResponseWriter, tmpl string) error {
	path := filepath.Join("template", tmpl)
	log.Println("🧩 Rendu:", path)

	t, err := template.ParseFiles(path)
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	return t.Execute(w, nil)
}

func Play(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/play" && r.URL.Path != "/play/" {
		http.NotFound(w, r)
		return
	}
	if err := RenderTemplate(w, "puissance4.html"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func Players(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/players" && r.URL.Path != "/players/" {
		http.NotFound(w, r)
		return
	}
	if err := RenderTemplate(w, "players.html"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func Histo(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/histo" && r.URL.Path != "/histo/" {
		http.NotFound(w, r)
		return
	}
	if err := RenderTemplate(w, "histo.html"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
