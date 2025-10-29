package controller

import (
	"html/template"
	"log"
	"net/http"
)

func renderTemplate(w http.ResponseWriter, tmpl string) {
	path := "template/" + tmpl
	log.Println("➡️  Rendu:", path)
	t, err := template.ParseFiles(path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := t.Execute(w, nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func Play(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/play" { // sécurité: ne rend que pour /play exact
		http.NotFound(w, r)
		return
	}
	renderTemplate(w, "puissance4.html")
}
