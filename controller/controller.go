package controller

import (
    "html/template"
    "net/http"
)

func renderTemplate(w http.ResponseWriter, tmpl string) {
    t, err := template.ParseFiles("template/" + tmpl)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    t.Execute(w, nil)
}

func Play(w http.ResponseWriter, r *http.Request){
	renderTemplate(w, "puissance4.html")
}