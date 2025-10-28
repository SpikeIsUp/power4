package main

import (
	"fmt"
	"html/template"
	"net/http"
)

func playHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("template/puissance4.html"))
	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	// Sert les fichiers CSS et images
	http.Handle("/static/",
		http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Route principale
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl := template.Must(template.ParseFiles("template/index.html"))
		if err := tmpl.Execute(w, nil); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	// Route play
	http.HandleFunc("/play", playHandler)

	fmt.Println("✅ Serveur lancé sur http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
