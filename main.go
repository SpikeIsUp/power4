package main

import (
	"fmt"
	"github/power4/controller"
	"html/template"
	"net/http"
)

func main() {
	// Sert les fichiers CSS et images
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Route principale
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl := template.Must(template.ParseFiles("template/index.html"))
		tmpl.Execute(w, nil)
	})
	http.HandleFunc("/play", controller.Play)

	fmt.Println("✅ Serveur lancé sur http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
