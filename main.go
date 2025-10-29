package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/SpikelsUp/power4/controller"
)

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" { // évite que "/" capte /play par erreur
		http.NotFound(w, r)
		return
	}
	log.Println("➡️  Rendu: index.html")
	tmpl := template.Must(template.ParseFiles("template/index.html"))
	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	// Fichiers statiques
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Routes
	http.HandleFunc("/play", controller.Play) // doit arriver AVANT "/" ou avec le garde ci-dessus
	http.HandleFunc("/", homeHandler)

	fmt.Println("✅ Serveur lancé sur http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
