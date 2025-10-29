package game

import (
	"errors"
	"sync"
)

type Game struct {
	Board    *Board       `json:"board"`
	Turn     int          `json:"turn"`     // 0: J1, 1: J2
	Over     bool         `json:"over"`
	Winner   int          `json:"winner"`   // -1 = aucun, 0 = J1, 1 = J2, 2 = nul
	Names    [2]string    `json:"names"`    // pseudos
	TokenURL [2]string    `json:"tokenUrls"`// chemins images (absolus /static/…)
	mu       sync.Mutex   `json:"-"`
}

func NewGame() *Game {
	return &Game{
		Board:    NewBoard(),
		Turn:     0,
		Over:     false,
		Winner:   -1,
		Names:    [2]string{"Joueur 1", "Joueur 2"},
		TokenURL: [2]string{"/static/image/Jetons/Jeton4.png", "/static/image/Jetons/Jeton5.png"},
	}
}

func (g *Game) Reset() {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.Board.Reset()
	g.Turn = 0
	g.Over = false
	g.Winner = -1
}

// Paramètres envoyés depuis players.html
func (g *Game) SetPlayers(p1, p2, t1, t2 string) error {
	g.mu.Lock()
	defer g.mu.Unlock()

	if p1 == "" { p1 = "Joueur 1" }
	if p2 == "" { p2 = "Joueur 2" }
	if t1 == "" { t1 = "/static/image/Jetons/Jeton4.png" }
	if t2 == "" { t2 = "/static/image/Jetons/Jeton5.png" }

	// sécurité: interdire le même jeton
	if t1 == t2 {
		return errors.New("les deux joueurs ne peuvent pas avoir le même jeton")
	}

	g.Names[0], g.Names[1] = p1, p2
	g.TokenURL[0], g.TokenURL[1] = t1, t2
	// reset de la partie quand on (re)configure les joueurs
	g.Board.Reset()
	g.Turn = 0
	g.Over = false
	g.Winner = -1
	return nil
}

type PlayResult struct {
	Row      int                `json:"row"`
	Col      int                `json:"col"`
	Player   int                `json:"player"`
	Win      WinResult          `json:"win"`
	Over     bool               `json:"over"`
	Winner   int                `json:"winner"`
	Grid     [Rows][Columns]int `json:"grid"`
	NextTurn int                `json:"nextTurn"`
	Names    [2]string          `json:"names"`
	TokenURL [2]string          `json:"tokenUrls"`
}

func (g *Game) Play(col int) (PlayResult, error) {
	g.mu.Lock()
	defer g.mu.Unlock()

	if g.Over {
		return PlayResult{}, errors.New("partie terminée")
	}

	row, c, err := g.Board.DropToken(col, g.Turn)
	if err != nil {
		return PlayResult{}, err
	}

	win := g.Board.CheckWin(row, c, g.Turn)
	if win.Win {
		g.Over = true
		g.Winner = g.Turn
		return PlayResult{
			Row: row, Col: c, Player: g.Turn, Win: win, Over: true, Winner: g.Winner,
			Grid: g.Board.Grid, NextTurn: g.Turn, Names: g.Names, TokenURL: g.TokenURL,
		}, nil
	}

	if g.Board.IsFull() {
		g.Over = true
		g.Winner = 2 // nul
		return PlayResult{
			Row: row, Col: c, Player: g.Turn, Win: WinResult{}, Over: true, Winner: 2,
			Grid: g.Board.Grid, NextTurn: g.Turn, Names: g.Names, TokenURL: g.TokenURL,
		}, nil
	}

	// Tour suivant
	g.Turn = 1 - g.Turn

	return PlayResult{
		Row: row, Col: c, Player: 1 - g.Turn, Win: WinResult{}, Over: false, Winner: -1,
		Grid: g.Board.Grid, NextTurn: g.Turn, Names: g.Names, TokenURL: g.TokenURL,
	}, nil
}

func (g *Game) State() (grid [Rows][Columns]int, turn int, over bool, winner int, names [2]string, tokenURL [2]string) {
	g.mu.Lock()
	defer g.mu.Unlock()
	return g.Board.Grid, g.Turn, g.Over, g.Winner, g.Names, g.TokenURL
}
