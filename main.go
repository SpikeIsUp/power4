package main

import (
	"fmt"
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

		fmt.Println("✅ Serveur lancé sur http://localhost:8080")
    // Lance le serveur
    http.ListenAndServe(":8080", nil)
}