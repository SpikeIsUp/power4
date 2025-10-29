package controller

import (
	"html/template"
	"log"
	"net/http"
	"path/filepath"
)

// RenderTemplate rend un fichier depuis /template
func RenderTemplate(w http.ResponseWriter, tmpl string) error {
	path := filepath.Join("template", tmpl)
	log.Println("🧩 Rendu:", path)

	t, err := template.ParseFiles(path)
	if err != nil {
		log.Println("❌ Erreur template :", err)
		return err
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	return t.Execute(w, nil)
}

func Play(w http.ResponseWriter, r *http.Request) {
	log.Println("➡️  GET /play")
	if err := RenderTemplate(w, "puissance4.html"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
